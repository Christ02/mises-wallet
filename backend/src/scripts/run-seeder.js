import bcrypt from 'bcrypt';
import pg from 'pg';
import { config } from '../config/config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.database.url,
});

async function createSuperAdmin() {
  try {
    // Verificar que existan los roles
    const roleCheck = await pool.query('SELECT id FROM roles WHERE name = $1', ['super_admin']);
    
    if (roleCheck.rows.length === 0) {
      console.log('⚠️  Creando roles primero...');
      // Insertar roles si no existen
      await pool.query(`
        INSERT INTO roles (name, description) VALUES
          ('super_admin', 'Super Administrador - Acceso completo al sistema'),
          ('admin', 'Administrador - Acceso administrativo limitado'),
          ('usuario', 'Usuario - Acceso básico')
        ON CONFLICT (name) DO NOTHING
      `);
    }

    const superAdminRole = await pool.query('SELECT id FROM roles WHERE name = $1', ['super_admin']);
    const roleId = superAdminRole.rows[0].id;

    // Datos del super administrador
    const nombres = 'Super';
    const apellidos = 'Administrador';
    const carnet_universitario = 'SUPER001';
    const email = 'admin@ufm.edu';
    const password = 'Admin123!'; // Cambiar en producción
    const password_hash = await bcrypt.hash(password, 10);

    // Verificar si ya existe
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Super administrador ya existe');
      await pool.end();
      return;
    }

    // Crear super administrador
    await pool.query(`
      INSERT INTO users (nombres, apellidos, carnet_universitario, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [nombres, apellidos, carnet_universitario, email, password_hash, roleId]);

    console.log('✅ Super administrador creado exitosamente');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error al crear super administrador:', error);
    await pool.end();
    throw error;
  }
}

createSuperAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

