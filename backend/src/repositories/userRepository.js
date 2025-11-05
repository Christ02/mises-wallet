import pool from '../config/database.js';

export class UserRepository {
  static async create(userData) {
    const { nombres, apellidos, carnet_universitario, email, password_hash, role_id = 3 } = userData;
    
    const query = `
      INSERT INTO users (nombres, apellidos, carnet_universitario, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombres, apellidos, carnet_universitario, email, role_id, created_at
    `;
    
    const result = await pool.query(query, [
      nombres,
      apellidos,
      carnet_universitario,
      email,
      password_hash,
      role_id
    ]);
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByCarnet(carnet) {
    const query = 'SELECT * FROM users WHERE carnet_universitario = $1';
    const result = await pool.query(query, [carnet]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async updateResetToken(email, token, expires) {
    const query = `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2
      WHERE email = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [token, expires, email]);
    return result.rows[0];
  }

  static async updatePassword(id, password_hash) {
    const query = `
      UPDATE users 
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = $2
      RETURNING id, email
    `;
    
    const result = await pool.query(query, [password_hash, id]);
    return result.rows[0];
  }

  static async findByResetToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE reset_password_token = $1 
      AND reset_password_expires > NOW()
    `;
    
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async updateWalletId(userId, walletId) {
    const query = `
      UPDATE users 
      SET wallet_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, wallet_id
    `;
    
    const result = await pool.query(query, [walletId, userId]);
    return result.rows[0];
  }
}

