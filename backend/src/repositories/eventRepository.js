import pool from '../config/database.js';

export class EventRepository {
  static async create({ name, event_date, location, start_time, end_time, description, status, cover_image_url }) {
    const query = `
      INSERT INTO events (name, event_date, location, start_time, end_time, description, status, cover_image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      name,
      event_date,
      location,
      start_time,
      end_time,
      description ?? null,
      status ?? 'borrador',
      cover_image_url ?? null
    ]);

    return result.rows[0];
  }

  static async findAllWithBusinessCount() {
    const query = `
      SELECT
        e.*, 
        COUNT(b.id)::int AS business_count
      FROM events e
      LEFT JOIN event_businesses b ON b.event_id = e.id
      GROUP BY e.id
      ORDER BY e.event_date DESC, e.start_time DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findUpcoming(limit = 20) {
    const query = `
      SELECT *
      FROM events
      WHERE event_date >= CURRENT_DATE
      ORDER BY event_date ASC, start_time ASC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    if (result.rows.length > 0) {
      return result.rows;
    }

    const fallbackQuery = `
      SELECT *
      FROM events
      ORDER BY event_date DESC, start_time DESC
      LIMIT $1
    `;
    const fallbackResult = await pool.query(fallbackQuery, [limit]);
    return fallbackResult.rows;
  }

  static async update(id, data) {
    const allowedFields = ['name', 'event_date', 'location', 'start_time', 'end_time', 'description', 'status', 'cover_image_url'];
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
      UPDATE events
      SET ${setClauses.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE events
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  static async delete(id) {
    const query = 'DELETE FROM events WHERE id = $1';
    await pool.query(query, [id]);
  }
}
