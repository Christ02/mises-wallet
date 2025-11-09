CREATE TABLE IF NOT EXISTS event_business_wallets (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES event_businesses(id) ON DELETE CASCADE,
    address VARCHAR(42) UNIQUE NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    mnemonic_encrypted TEXT,
    network VARCHAR(50) NOT NULL DEFAULT 'sepolia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_business_wallet UNIQUE (business_id)
);

CREATE INDEX IF NOT EXISTS idx_event_business_wallets_business_id ON event_business_wallets(business_id);
