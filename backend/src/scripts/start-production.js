/**
 * Script de inicio para producción
 * Inicia el servidor primero, luego ejecuta migraciones y seeders en segundo plano
 */

import { runMigrations } from './run-migrations.js';
import { createSuperAdmin } from './run-seeder.js';

async function startProduction() {
  try {
    console.log('🚀 Iniciando aplicación en modo producción...\n');
    
    // Iniciar el servidor primero
    console.log('🚀 Iniciando servidor...\n');
    await import('../index.js');
    
    // Esperar un momento para que el servidor se inicie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Ejecutar migraciones en segundo plano
    console.log('📦 Ejecutando migraciones en segundo plano...');
    runMigrations()
      .then(() => {
        console.log('✅ Migraciones completadas\n');
        
        // Después de las migraciones, ejecutar el seeder
        console.log('🌱 Ejecutando seeder en segundo plano...');
        return createSuperAdmin();
      })
      .then(() => {
        console.log('✅ Seeder completado\n');
      })
      .catch((error) => {
        console.error('⚠️  Error al ejecutar migraciones/seeder (no crítico):', error.message);
        // No detener el servidor si fallan
      });
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startProduction();

