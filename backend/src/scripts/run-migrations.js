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

async function runMigrations() {
  try {
    const dockerMigrationsDir = '/app/database/migrations';
    const localMigrationsDir = path.resolve(__dirname, '../../../database/migrations');

    let migrationsDir = dockerMigrationsDir;

    if (!fs.existsSync(migrationsDir)) {
      migrationsDir = localMigrationsDir;
    }

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`El directorio de migraciones no existe: ${migrationsDir}`);
    }
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('📦 Ejecutando migraciones...\n');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`  → ${file}`);
      await pool.query(sql);
    }

    console.log('\n✅ Todas las migraciones se ejecutaron exitosamente');
    await pool.end();
  } catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error);
    await pool.end();
    throw error;
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

