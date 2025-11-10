CREATE TABLE IF NOT EXISTS central_wallet_settings (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL DEFAULT 'Banco Central',
    network VARCHAR(100) NOT NULL DEFAULT 'sepolia',
    wallet_address VARCHAR(255) NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    public_api_key TEXT,
    secret_api_key_encrypted TEXT,
    token_symbol VARCHAR(50) NOT NULL DEFAULT 'HC',
    token_address VARCHAR(255) NOT NULL,
    token_decimals INTEGER NOT NULL DEFAULT 18,
    updated_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_central_wallet_settings_singleton ON central_wallet_settings((true));


