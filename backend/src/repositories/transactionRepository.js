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
  reference: row.reference,
  type: row.type,
  status: row.status,
  direction: row.direction,
  amount: row.amount,
  currency: row.currency,
  description: row.description,
  metadata: parseMetadata(row.metadata),
  created_at: row.created_at,
  updated_at: row.updated_at,
  completed_at: row.completed_at,
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

const buildFilters = ({ search, status, type, direction, dateFrom, dateTo }) => {
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(
      CAST(t.id AS TEXT) ILIKE $${params.length - 4}
      OR COALESCE(LOWER(t.reference), '') ILIKE $${params.length - 3}
      OR COALESCE(LOWER(u.nombres), '') ILIKE $${params.length - 2}
      OR COALESCE(LOWER(u.apellidos), '') ILIKE $${params.length - 1}
      OR COALESCE(LOWER(u.carnet_universitario), '') ILIKE $${params.length}
    )`);
  }

  if (status) {
    params.push(status);
    where.push(`t.status = $${params.length}`);
  }

  if (type) {
    params.push(type);
    where.push(`t.type = $${params.length}`);
  }

  if (direction) {
    params.push(direction);
    where.push(`t.direction = $${params.length}`);
  }

  if (dateFrom) {
    params.push(dateFrom);
    where.push(`t.created_at >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    where.push(`t.created_at <= $${params.length}`);
  }

  const whereSQL = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  return { whereSQL, params };
};

export class TransactionRepository {
  static async create(data) {
    const query = `
      INSERT INTO transactions (
        user_id,
        reference,
        type,
        status,
        direction,
        amount,
        currency,
        description,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.user_id ?? null,
      data.reference ?? null,
      data.type,
      data.status ?? 'pendiente',
      data.direction ?? 'saliente',
      data.amount ?? 0,
      data.currency ?? 'HC',
      data.description ?? null,
      data.metadata ? JSON.stringify(data.metadata) : null
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];
    row.metadata = parseMetadata(row.metadata);
    return row;
  }

  static async updateById(id, updates) {
    const sets = [];
    const params = [];
    let index = 1;

    const addSet = (field, value) => {
      sets.push(`${field} = $${index}`);
      params.push(value);
      index += 1;
    };

    if (updates.reference !== undefined) {
      addSet('reference', updates.reference);
    }

    if (updates.type !== undefined) {
      addSet('type', updates.type);
    }

    if (updates.status !== undefined) {
      addSet('status', updates.status);
    }

    if (updates.direction !== undefined) {
      addSet('direction', updates.direction);
    }

    if (updates.amount !== undefined) {
      addSet('amount', updates.amount);
    }

    if (updates.currency !== undefined) {
      addSet('currency', updates.currency);
    }

    if (updates.description !== undefined) {
      addSet('description', updates.description);
    }

    if (updates.metadata !== undefined) {
      addSet('metadata', updates.metadata ? JSON.stringify(updates.metadata) : null);
    }

    if (updates.completed_at !== undefined) {
      addSet('completed_at', updates.completed_at);
    }

    if (sets.length === 0) {
      return null;
    }

    addSet('updated_at', new Date());

    const query = `
      UPDATE transactions
      SET ${sets.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    params.push(id);

    const result = await pool.query(query, params);
    const row = result.rows[0] || null;
    if (row) {
      row.metadata = parseMetadata(row.metadata);
    }
    return row;
  }

  static async findAll({ search, status, type, direction, dateFrom, dateTo, limit = 50, offset = 0 } = {}) {
    const normalizedLimit = Number.isNaN(Number(limit)) ? 50 : Math.min(Number(limit), 200);
    const normalizedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

    const { whereSQL, params } = buildFilters({ search, status, type, direction, dateFrom, dateTo });
    params.push(normalizedLimit);
    params.push(normalizedOffset);

    const query = `
      SELECT
        t.*,
        u.nombres,
        u.apellidos,
        u.email,
        u.carnet_universitario
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ${whereSQL}
      ORDER BY t.created_at DESC
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
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      ${whereSQL}
    `;
    const result = await pool.query(query, params);
    return result.rows[0]?.total ?? 0;
  }

  static async findByUserId(userId, { limit = 25, offset = 0 } = {}) {
    const query = `
      SELECT
        t.*,
        u.nombres,
        u.apellidos,
        u.email,
        u.carnet_universitario
      FROM transactions t
      LEFT JOIN users u ON u.id = t.user_id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(mapRow);
  }

  static async findCentralWalletActivity(limit = 25) {
    const query = `
      SELECT
        t.*
      FROM transactions t
      WHERE t.metadata::text LIKE $1
      ORDER BY t.created_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, ['%"token_amount"%', limit]);
    return result.rows.map(mapRow);
  }

  static async sumAmountByUser(userId, { currency, type, direction, status } = {}) {
    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let index = 2;

    if (currency) {
      conditions.push(`t.currency = $${index}`);
      params.push(currency);
      index += 1;
    }

    if (type) {
      conditions.push(`t.type = $${index}`);
      params.push(type);
      index += 1;
    }

    if (direction) {
      conditions.push(`t.direction = $${index}`);
      params.push(direction);
      index += 1;
    }

    if (status) {
      if (Array.isArray(status)) {
        const placeholders = status.map((_, i) => `$${index + i}`).join(', ');
        conditions.push(`t.status IN (${placeholders})`);
        params.push(...status);
        index += status.length;
      } else {
        conditions.push(`t.status = $${index}`);
        params.push(status);
        index += 1;
      }
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT COALESCE(SUM(CAST(t.amount AS NUMERIC)), 0)::numeric AS total
      FROM transactions t
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    const total = result.rows[0]?.total ?? 0;
    return parseFloat(total);
  }
}

