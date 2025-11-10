import pool from '../config/database.js';

const mapRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name,
  entity: row.entity,
  filters: row.filters ? JSON.parse(row.filters) : {},
  columns: row.columns ? JSON.parse(row.columns) : [],
  file_path: row.file_path,
  format: row.format,
  status: row.status,
  error_message: row.error_message,
  created_at: row.created_at,
  user: row.user_id
    ? {
        id: row.user_id,
        nombres: row.nombres,
        apellidos: row.apellidos,
        email: row.email
      }
    : null
});

export class ReportRepository {
  static async create(report) {
    const query = `
      INSERT INTO reports (user_id, name, entity, filters, columns, file_path, format, status, error_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      report.user_id ?? null,
      report.name,
      report.entity,
      report.filters ? JSON.stringify(report.filters) : JSON.stringify({}),
      report.columns ? JSON.stringify(report.columns) : JSON.stringify([]),
      report.file_path ?? null,
      report.format ?? 'csv',
      report.status ?? 'generado',
      report.error_message ?? null
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];
    return mapRow(row);
  }

  static async findAll({ limit = 20, offset = 0 } = {}) {
    const query = `
      SELECT
        r.*,
        u.nombres,
        u.apellidos,
        u.email
      FROM reports r
      LEFT JOIN users u ON u.id = r.user_id
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [limit, offset]);
    return result.rows.map(mapRow);
  }
}

