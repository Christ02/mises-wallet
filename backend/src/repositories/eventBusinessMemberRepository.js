import pool from '../config/database.js';

export class EventBusinessMemberRepository {
  static async addMember({ business_id, carnet, role }) {
    const query = `
      INSERT INTO event_business_members (business_id, carnet, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (business_id, carnet) DO UPDATE
      SET role = EXCLUDED.role,
          updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const result = await pool.query(query, [business_id, carnet, role]);
    const memberId = result.rows[0].id;
    return this.findDetailedById(memberId);
  }

  static async findDetailedById(id) {
    const query = `
      SELECT ebm.id,
             ebm.business_id,
             ebm.carnet,
             ebm.role,
             ebm.created_at,
             ebm.updated_at,
             u.nombres,
             u.apellidos,
             u.email
      FROM event_business_members ebm
      LEFT JOIN users u ON u.carnet_universitario = ebm.carnet
      WHERE ebm.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByBusinessId(businessId) {
    const query = `
      SELECT ebm.id,
             ebm.business_id,
             ebm.carnet,
             ebm.role,
             ebm.created_at,
             ebm.updated_at,
             u.nombres,
             u.apellidos,
             u.email
      FROM event_business_members ebm
      LEFT JOIN users u ON u.carnet_universitario = ebm.carnet
      WHERE ebm.business_id = $1
      ORDER BY ebm.created_at DESC
    `;

    const result = await pool.query(query, [businessId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM event_business_members WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async removeMember(id) {
    const query = 'DELETE FROM event_business_members WHERE id = $1';
    await pool.query(query, [id]);
  }
}
