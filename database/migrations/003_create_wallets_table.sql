-- Migración: Crear tabla de wallets
CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(42) UNIQUE NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    mnemonic_encrypted TEXT,
    network VARCHAR(50) NOT NULL DEFAULT 'sepolia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_one_wallet UNIQUE (user_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_network ON wallets(network);

