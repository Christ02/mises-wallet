/**
 * Script de Migraciones Seguro para Producción
 * 
 * Este script ejecuta las migraciones pero no falla si hay errores de conexión
 * o si las migraciones ya están ejecutadas. Útil para el inicio del servidor.
 */

import { runMigrations } from './run-migrations.js';

runMigrations()
  .then(() => {
    console.log('\n✅ Migraciones completadas exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n⚠️  Advertencia al ejecutar migraciones:', error.message);
    
    // Si las migraciones ya están ejecutadas o hay un error no crítico, continuar
    if (error.message && (
      error.message.includes('ya ejecutadas') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED')
    )) {
      console.log('ℹ️  Continuando sin ejecutar migraciones...');
      process.exit(0);
    }
    
    // Para errores críticos, salir con error
    console.error('❌ Error crítico en migraciones');
    process.exit(1);
  });

