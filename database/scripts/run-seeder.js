import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import createSuperAdmin from '../seeders/001_create_super_admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeeder() {
  try {
    console.log('🌱 Ejecutando seeder...\n');
    await createSuperAdmin();
    console.log('\n✅ Seeder ejecutado exitosamente');
  } catch (error) {
    console.error('❌ Error al ejecutar seeder:', error);
    throw error;
  }
}

runSeeder()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

