import pool from '../config/database.js';

const mapRow = (row) => ({
  id: row.id,
  event_id: row.event_id,
  business_id: row.business_id,
  requested_amount: row.requested_amount,
  token_symbol: row.token_symbol,
  method: row.method,
  notes: row.notes,
  status: row.status,
  token_transfer_hash: row.token_transfer_hash,
  created_by: row.created_by,
  approved_by: row.approved_by,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export class SettlementRequestRepository {
  static async create(data) {
    const query = `
      INSERT INTO settlement_requests (
        event_id,
        business_id,
        requested_amount,
        token_symbol,
        method,
        notes,
        status,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;

    const values = [
      data.event_id,
      data.business_id,
      data.requested_amount,
      data.token_symbol,
      data.method || null,
      data.notes || null,
      data.status || 'pendiente',
      data.created_by || null
    ];

    const result = await pool.query(query, values);
    return mapRow(result.rows[0]);
  }

  static async findActiveByBusinessId(businessId) {
    const query = `
      SELECT *
      FROM settlement_requests
      WHERE business_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [businessId]);
    if (!result.rows.length) return null;

    const row = result.rows[0];
    if (!['pendiente', 'aprobada', 'pagada'].includes(row.status)) {
      return null;
    }
    return mapRow(row);
  }

  static async findByBusinessId(businessId) {
    const query = `
      SELECT *
      FROM settlement_requests
      WHERE business_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [businessId]);
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT * FROM settlement_requests WHERE id = $1`,
      [id]
    );
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }

  static async list({ status, limit = 50 } = {}) {
    const conditions = [];
    const params = [];
    let index = 1;

    if (status) {
      conditions.push(`status = $${index}`);
      params.push(status);
      index += 1;
    }

    const query = `
      SELECT sr.*,
             eb.name AS business_name,
             eb.group_id,
             e.name AS event_name
      FROM settlement_requests sr
      JOIN event_businesses eb ON eb.id = sr.business_id
      JOIN events e ON e.id = sr.event_id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY sr.created_at DESC
      LIMIT ${Math.min(limit, 200)}
    `;

    const result = await pool.query(query, params);
    return result.rows.map((row) => ({
      ...mapRow(row),
      business_name: row.business_name,
      group_id: row.group_id,
      event_name: row.event_name
    }));
  }

  static async updateStatus(id, { status, token_transfer_hash, approved_by }) {
    const query = `
      UPDATE settlement_requests
      SET
        status = $1,
        token_transfer_hash = COALESCE($2, token_transfer_hash),
        approved_by = COALESCE($3, approved_by),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [status, token_transfer_hash || null, approved_by || null, id]);
    return result.rows.length ? mapRow(result.rows[0]) : null;
  }
}


