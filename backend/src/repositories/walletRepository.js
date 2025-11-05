import pool from '../config/database.js';

export class WalletRepository {
  static async create(walletData) {
    const { user_id, address, private_key_encrypted, mnemonic_encrypted, network } = walletData;
    
    const query = `
      INSERT INTO wallets (user_id, address, private_key_encrypted, mnemonic_encrypted, network)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, address, network, created_at
    `;
    
    const result = await pool.query(query, [
      user_id,
      address,
      private_key_encrypted,
      mnemonic_encrypted,
      network || 'sepolia'
    ]);
    
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT id, user_id, address, network, created_at
      FROM wallets
      WHERE user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async findById(walletId) {
    const query = `
      SELECT id, user_id, address, private_key_encrypted, mnemonic_encrypted, network, created_at
      FROM wallets
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [walletId]);
    return result.rows[0] || null;
  }

  static async findByAddress(address) {
    const query = `
      SELECT id, user_id, address, network, created_at
      FROM wallets
      WHERE LOWER(address) = LOWER($1)
    `;
    
    const result = await pool.query(query, [address]);
    return result.rows[0] || null;
  }
}

