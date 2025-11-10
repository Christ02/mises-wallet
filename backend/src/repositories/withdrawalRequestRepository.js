import pool from '../config/database.js';

const mapRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  amount: parseFloat(row.amount),
  token_symbol: row.token_symbol,
  status: row.status,
  notes: row.notes,
  processed_by: row.processed_by,
  processed_at: row.processed_at,
  tx_hash: row.tx_hash,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export class WithdrawalRequestRepository {
  static async create({ user_id, amount, token_symbol, notes }) {
    const query = `
      INSERT INTO withdrawal_requests (user_id, amount, token_symbol, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, amount, token_symbol, notes || null];
    const result = await pool.query(query, values);
    return mapRow(result.rows[0]);
  }

  static async findPendingByUser(userId) {
    const query = `
      SELECT *
      FROM withdrawal_requests
      WHERE user_id = $1 AND status IN ('pendiente', 'en_proceso')
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }

  static async findByUser(userId, { limit = 20, offset = 0 } = {}) {
    const query = `
      SELECT *
      FROM withdrawal_requests
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(mapRow);
  }

  static async findAll({ limit = 50, offset = 0 } = {}) {
    const query = `
      SELECT wr.*, u.carnet_universitario, u.nombres, u.apellidos
      FROM withdrawal_requests wr
      LEFT JOIN users u ON u.id = wr.user_id
      ORDER BY wr.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows.map((row) => ({
      ...mapRow(row),
      user: row.user_id
        ? {
            id: row.user_id,
            carnet: row.carnet_universitario,
            nombres: row.nombres,
            apellidos: row.apellidos
          }
        : null
    }));
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM withdrawal_requests WHERE id = $1',
      [id]
    );
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }

  static async updateStatus(id, { status, processed_by, tx_hash, notes }) {
    const query = `
      UPDATE withdrawal_requests
      SET status = $1,
          processed_by = $2,
          processed_at = CURRENT_TIMESTAMP,
          tx_hash = COALESCE($3, tx_hash),
          notes = COALESCE($4, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [status, processed_by || null, tx_hash || null, notes || null, id]);
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }
}


