import pool from '../config/database.js';

export class RoleRepository {
  static async findAll() {
    const query = `
      SELECT id, name, description
      FROM roles
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, name, description
      FROM roles
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const query = `
      SELECT id, name, description
      FROM roles
      WHERE name = $1
    `;
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }
}


