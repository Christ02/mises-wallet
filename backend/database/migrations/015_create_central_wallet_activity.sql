-- Migración: crear tabla de actividad de la wallet central

CREATE TABLE IF NOT EXISTS central_wallet_activity (
    id SERIAL PRIMARY KEY,
    type VARCHAR(40) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    amount NUMERIC(36, 18) NOT NULL DEFAULT 0,
    currency VARCHAR(12) NOT NULL DEFAULT 'ETH',
    counterparty VARCHAR(120),
    reference VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_central_wallet_activity_type ON central_wallet_activity(type);
CREATE INDEX IF NOT EXISTS idx_central_wallet_activity_direction ON central_wallet_activity(direction);
CREATE INDEX IF NOT EXISTS idx_central_wallet_activity_created_at ON central_wallet_activity(created_at);

