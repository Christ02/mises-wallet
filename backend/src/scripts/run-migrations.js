/**
 * Script de Migraciones para Producción
 * 
 * Características:
 * - Tracking de migraciones ejecutadas
 * - Ejecución idempotente (puede ejecutarse múltiples veces)
 * - Manejo robusto de errores
 * - Logging detallado
 * 
 * Uso:
 *   npm run migrate
 *   o
 *   node src/scripts/run-migrations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../config/config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Crear tabla de tracking de migraciones si no existe
 */
async function ensureMigrationsTable() {
  const dockerMigrationsDir = '/app/database/migrations';
  const backendMigrationsDir = path.resolve(__dirname, '../../database/migrations');
  const rootMigrationsDir = path.resolve(__dirname, '../../../database/migrations');
  
  let migrationsDir = dockerMigrationsDir;
  if (!fs.existsSync(migrationsDir)) {
    migrationsDir = backendMigrationsDir;
    if (!fs.existsSync(migrationsDir) || (fs.existsSync(migrationsDir) && fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).length === 0)) {
      migrationsDir = rootMigrationsDir;
    }
  }

  const initMigrationPath = path.join(migrationsDir, '000_create_migrations_table.sql');
  
  if (fs.existsSync(initMigrationPath)) {
    const sql = fs.readFileSync(initMigrationPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Tabla de tracking de migraciones creada/verificada\n');
  } else {
    // Crear tabla manualmente si no existe el archivo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);
    `);
    console.log('✅ Tabla de tracking de migraciones verificada\n');
  }
}

/**
 * Obtener lista de migraciones ya ejecutadas
 */
async function getExecutedMigrations() {
  try {
    const result = await pool.query('SELECT migration_name FROM schema_migrations ORDER BY migration_name');
    return new Set(result.rows.map(row => row.migration_name));
  } catch (error) {
    // Si la tabla no existe, retornar set vacío
    return new Set();
  }
}

/**
 * Registrar migración como ejecutada
 */
async function recordMigration(migrationName, executionTimeMs) {
  try {
    await pool.query(
      'INSERT INTO schema_migrations (migration_name, execution_time_ms) VALUES ($1, $2) ON CONFLICT (migration_name) DO NOTHING',
      [migrationName, executionTimeMs]
    );
  } catch (error) {
    console.warn(`⚠️  No se pudo registrar la migración ${migrationName}:`, error.message);
  }
}

/**
 * Ejecutar migraciones
 */
async function runMigrations() {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Iniciando proceso de migraciones...\n');

    // Determinar directorio de migraciones
    // En Railway/Docker: /app/database/migrations (desde backend/database/migrations)
    // En desarrollo local: backend/database/migrations o database/migrations (raíz)
    const dockerMigrationsDir = '/app/database/migrations';
    const backendMigrationsDir = path.resolve(__dirname, '../../database/migrations');
    const rootMigrationsDir = path.resolve(__dirname, '../../../database/migrations');

    let migrationsDir = dockerMigrationsDir;
    if (!fs.existsSync(migrationsDir)) {
      // Intentar backend/database/migrations primero (preferido)
      migrationsDir = backendMigrationsDir;
      if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).length === 0) {
        // Si no existe o está vacío, intentar database/migrations (raíz)
        migrationsDir = rootMigrationsDir;
      }
    }

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`❌ El directorio de migraciones no existe: ${migrationsDir}`);
    }

    // Asegurar que existe la tabla de tracking
    await ensureMigrationsTable();

    // Obtener migraciones ya ejecutadas
    const executedMigrations = await getExecutedMigrations();
    console.log(`📊 Migraciones ya ejecutadas: ${executedMigrations.size}\n`);

    // Leer y ordenar archivos de migración
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== '000_create_migrations_table.sql')
      .sort();

    if (files.length === 0) {
      console.log('ℹ️  No se encontraron migraciones para ejecutar');
      await pool.end();
      return;
    }

    console.log(`📦 Encontradas ${files.length} migraciones\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let executedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Ejecutar cada migración
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      
      // Verificar si ya fue ejecutada
      if (executedMigrations.has(file)) {
        console.log(`⏭️  ${file} (ya ejecutada, omitida)`);
        skippedCount++;
        continue;
      }

      try {
        const migrationStartTime = Date.now();
        const sql = fs.readFileSync(filePath, 'utf8');
        
        console.log(`🔄 Ejecutando: ${file}`);
        
        // Ejecutar migración dentro de una transacción
        await pool.query('BEGIN');
        try {
          await pool.query(sql);
          await pool.query('COMMIT');
          
          const executionTime = Date.now() - migrationStartTime;
          await recordMigration(file, executionTime);
          
          console.log(`   ✅ Completada en ${executionTime}ms\n`);
          executedCount++;
        } catch (error) {
          await pool.query('ROLLBACK');
          throw error;
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error ejecutando ${file}:`, error.message);
        console.error(`   Detalles:`, error);
        console.log('');
        
        // En producción, detener en caso de error
        if (process.env.NODE_ENV === 'production') {
          console.error('\n❌ Error crítico en producción. Deteniendo migraciones.');
          await pool.end();
          process.exit(1);
        } else {
          console.warn('⚠️  Continuando con las siguientes migraciones (modo desarrollo)...\n');
        }
      }
    }

    const totalTime = Date.now() - startTime;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Resumen:');
    console.log(`   ✅ Ejecutadas: ${executedCount}`);
    console.log(`   ⏭️  Omitidas: ${skippedCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   ⏱️  Tiempo total: ${totalTime}ms\n`);

    if (errorCount === 0) {
      console.log('✅ Proceso de migraciones completado exitosamente\n');
    } else {
      console.log('⚠️  Proceso completado con errores\n');
    }

    await pool.end();
  } catch (error) {
    console.error('\n❌ Error fatal al ejecutar migraciones:', error);
    await pool.end();
    throw error;
  }
}

// Ejecutar migraciones
runMigrations()
  .then(() => {
    console.log('\n✅ Migraciones completadas exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal al ejecutar migraciones:', error);
    // Si es un error de conexión a la BD, no es crítico en el primer inicio
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('⚠️  Error de conexión a la base de datos. Verifica las variables de entorno.');
    }
    // Si es un error de directorio no encontrado, es crítico
    if (error.message && error.message.includes('directorio de migraciones no existe')) {
      console.error('❌ Directorio de migraciones no encontrado. Verifica la configuración.');
    }
    process.exit(1);
  });
