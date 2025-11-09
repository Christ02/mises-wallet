import pool from '../config/database.js';

export class EventBusinessRepository {
  static async create({ event_id, name, description, lead_carnet, group_id }) {
    const query = `
      INSERT INTO event_businesses (event_id, name, description, lead_carnet, group_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      event_id,
      name,
      description ?? null,
      lead_carnet,
      group_id
    ]);

    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM event_businesses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByGroupId(groupId) {
    const query = 'SELECT * FROM event_businesses WHERE group_id = $1';
    const result = await pool.query(query, [groupId]);
    return result.rows[0] || null;
  }

  static async findByEventId(eventId) {
    const query = `
      SELECT eb.*,
        w.address AS wallet_address
      FROM event_businesses eb
      LEFT JOIN event_business_wallets w ON w.business_id = eb.id
      WHERE eb.event_id = $1
      ORDER BY eb.created_at DESC
    `;

    const result = await pool.query(query, [eventId]);
    return result.rows;
  }

  static async update(id, data) {
    const allowedFields = ['name', 'description', 'lead_carnet'];
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index}`);
        values.push(data[field]);
        index += 1;
      }
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE event_businesses
      SET ${setClauses.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM event_businesses WHERE id = $1';
    await pool.query(query, [id]);
  }
}
