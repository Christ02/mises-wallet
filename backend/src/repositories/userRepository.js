import pool from '../config/database.js';

export class UserRepository {
  static async create(userData) {
    const {
      nombres,
      apellidos,
      carnet_universitario,
      email,
      password_hash,
      role_id = 3,
      status = 'activo'
    } = userData;
    
    const query = `
      INSERT INTO users (nombres, apellidos, carnet_universitario, email, password_hash, role_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombres, apellidos, carnet_universitario, email, role_id, status, created_at, updated_at
    `;
    
    const result = await pool.query(query, [
      nombres,
      apellidos,
      carnet_universitario,
      email,
      password_hash,
      role_id,
      status
    ]);
    
    return result.rows[0];
  }

  static async findAll({ search, limit = 50, offset = 0 } = {}) {
    const params = [];
    let whereClauses = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
      whereClauses.push(`(
        LOWER(u.nombres) LIKE $${params.length - 2}
        OR LOWER(u.apellidos) LIKE $${params.length - 1}
        OR LOWER(u.email) LIKE $${params.length}
      )`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    params.push(limit);
    params.push(offset);

    const query = `
      SELECT 
        u.id,
        u.nombres,
        u.apellidos,
        u.carnet_universitario,
        u.email,
        u.role_id,
        u.status,
        u.created_at,
        u.updated_at,
        r.name AS role_name,
        w.address AS wallet_address
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN wallets w ON w.user_id = u.id
      ${whereSQL}
      ORDER BY u.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async countAll({ search } = {}) {
    const params = [];
    let whereClauses = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
      params.push(`%${search.toLowerCase()}%`);
      whereClauses.push(`(
        LOWER(nombres) LIKE $${params.length - 2}
        OR LOWER(apellidos) LIKE $${params.length - 1}
        OR LOWER(email) LIKE $${params.length}
      )`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT COUNT(*)::int AS total
      FROM users
      ${whereSQL}
    `;

    const result = await pool.query(query, params);
    return result.rows[0]?.total ?? 0;
  }

  static async findByEmail(email) {
    const query = `
      SELECT 
        u.*,
        r.name as role_name,
        w.address AS wallet_address
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN wallets w ON w.user_id = u.id
      WHERE u.email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByCarnet(carnet) {
    const query = `
      SELECT 
        u.*,
        r.name AS role_name,
        w.address AS wallet_address
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN wallets w ON w.user_id = u.id
      WHERE u.carnet_universitario = $1
    `;
    const result = await pool.query(query, [carnet]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT 
        u.*,
        r.name as role_name,
        w.address AS wallet_address
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN wallets w ON w.user_id = u.id
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

  static async updateById(id, data) {
    const allowedFields = [
      'nombres',
      'apellidos',
      'carnet_universitario',
      'email',
      'password_hash',
      'role_id',
      'status'
    ];
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index}`);
        values.push(data[field]);
        index++;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteById(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

