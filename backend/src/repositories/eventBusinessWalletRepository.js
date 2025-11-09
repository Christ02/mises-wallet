import pool from '../config/database.js';

export class EventBusinessWalletRepository {
  static async create({ business_id, address, private_key_encrypted, mnemonic_encrypted, network }) {
    const query = `
      INSERT INTO event_business_wallets (business_id, address, private_key_encrypted, mnemonic_encrypted, network)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      business_id,
      address,
      private_key_encrypted,
      mnemonic_encrypted ?? null,
      network ?? 'sepolia'
    ]);

    return result.rows[0];
  }

  static async findByBusinessId(businessId) {
    const query = `
      SELECT *
      FROM event_business_wallets
      WHERE business_id = $1
    `;

    const result = await pool.query(query, [businessId]);
    return result.rows[0] || null;
  }

  static async deleteByBusinessId(businessId) {
    const query = 'DELETE FROM event_business_wallets WHERE business_id = $1';
    await pool.query(query, [businessId]);
  }
}
