/**
 * Script de inicio para producción
 * Ejecuta migraciones y seeders antes de iniciar el servidor
 */

import { runMigrations } from './run-migrations.js';
import { createSuperAdmin } from './run-seeder.js';

async function startProduction() {
  try {
    console.log('🚀 Iniciando aplicación en modo producción...\n');
    
    // Ejecutar migraciones primero
    console.log('📦 Ejecutando migraciones...');
    await runMigrations();
    console.log('✅ Migraciones completadas\n');
    
    // Ejecutar seeder para crear super admin
    console.log('🌱 Ejecutando seeder...');
    await createSuperAdmin();
    console.log('✅ Seeder completado\n');
    
    // Iniciar el servidor
    console.log('🚀 Iniciando servidor...\n');
    // Importar y ejecutar el servidor
    await import('../index.js');
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startProduction();

