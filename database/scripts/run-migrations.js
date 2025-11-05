import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { config } from '../../backend/src/config/config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
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

