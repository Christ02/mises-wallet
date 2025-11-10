import pool from '../config/database.js';

export class CentralWalletSettingsRepository {
  static async getSettings() {
    const query = `
      SELECT
        id,
        bank_name,
        network,
        wallet_address,
        private_key_encrypted,
        public_api_key,
        secret_api_key_encrypted,
        token_symbol,
        token_address,
        token_decimals,
        updated_by,
        created_at,
        updated_at
      FROM central_wallet_settings
      ORDER BY id ASC
      LIMIT 1
    `;

    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  static async upsert(settings) {
    const existing = await this.getSettings();
    if (existing) {
      const updateQuery = `
        UPDATE central_wallet_settings
        SET
          bank_name = $1,
          network = $2,
          wallet_address = $3,
          private_key_encrypted = $4,
          public_api_key = $5,
          secret_api_key_encrypted = $6,
          token_symbol = $7,
          token_address = $8,
          token_decimals = $9,
          updated_by = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        settings.bank_name,
        settings.network,
        settings.wallet_address,
        settings.private_key_encrypted,
        settings.public_api_key || null,
        settings.secret_api_key_encrypted || null,
        settings.token_symbol,
        settings.token_address,
        settings.token_decimals,
        settings.updated_by || null,
        existing.id
      ]);

      return result.rows[0];
    }

    const insertQuery = `
      INSERT INTO central_wallet_settings (
        bank_name,
        network,
        wallet_address,
        private_key_encrypted,
        public_api_key,
        secret_api_key_encrypted,
        token_symbol,
        token_address,
        token_decimals,
        updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      settings.bank_name,
      settings.network,
      settings.wallet_address,
      settings.private_key_encrypted,
      settings.public_api_key || null,
      settings.secret_api_key_encrypted || null,
      settings.token_symbol,
      settings.token_address,
      settings.token_decimals,
      settings.updated_by || null
    ]);

    return result.rows[0];
  }
}


