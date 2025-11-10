import pool from '../config/database.js';

const parseMetadata = (metadata) => {
  if (!metadata) return null;
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
};

const mapRow = (row) => ({
  id: row.id,
  user_id: row.user_id,
  action: row.action,
  entity: row.entity,
  entity_id: row.entity_id,
  description: row.description,
  metadata: parseMetadata(row.metadata),
  ip_address: row.ip_address,
  user_agent: row.user_agent,
  created_at: row.created_at,
  user: row.user_id
    ? {
        id: row.user_id,
        nombres: row.nombres,
        apellidos: row.apellidos,
        email: row.email,
        carnet_universitario: row.carnet_universitario
      }
    : null
});

const buildFilters = ({ search, action, entity, userId, dateFrom, dateTo }) => {
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(
      LOWER(a.description) LIKE $${params.length - 2}
      OR LOWER(a.action) LIKE $${params.length - 1}
      OR LOWER(a.entity) LIKE $${params.length}
    )`);
  }

  if (action) {
    params.push(action);
    where.push(`a.action = $${params.length}`);
  }

  if (entity) {
    params.push(entity);
    where.push(`a.entity = $${params.length}`);
  }

  if (userId) {
    params.push(userId);
    where.push(`a.user_id = $${params.length}`);
  }

  if (dateFrom) {
    params.push(dateFrom);
    where.push(`a.created_at >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    where.push(`a.created_at <= $${params.length}`);
  }

  const whereSQL = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  return { whereSQL, params };
};

export class AuditLogRepository {
  static async create(data) {
    const query = `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity,
        entity_id,
        description,
        metadata,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.user_id ?? null,
      data.action,
      data.entity ?? null,
      data.entity_id ?? null,
      data.description ?? null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.ip_address ?? null,
      data.user_agent ?? null
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];
    row.metadata = parseMetadata(row.metadata);
    return row;
  }

  static async findAll({ search, action, entity, userId, dateFrom, dateTo, limit = 50, offset = 0 } = {}) {
    const normalizedLimit = Number.isNaN(Number(limit)) ? 50 : Math.min(Number(limit), 200);
    const normalizedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

    const { whereSQL, params } = buildFilters({ search, action, entity, userId, dateFrom, dateTo });
    params.push(normalizedLimit);
    params.push(normalizedOffset);

    const query = `
      SELECT
        a.*,
        u.nombres,
        u.apellidos,
        u.email,
        u.carnet_universitario
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ${whereSQL}
      ORDER BY a.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await pool.query(query, params);
    return result.rows.map(mapRow);
  }

  static async countAll(filters = {}) {
    const { whereSQL, params } = buildFilters(filters);
    const query = `
      SELECT COUNT(*)::int AS total
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ${whereSQL}
    `;
    const result = await pool.query(query, params);
    return result.rows[0]?.total ?? 0;
  }
}

