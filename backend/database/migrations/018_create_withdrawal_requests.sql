CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(78, 18) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL DEFAULT 'HC',
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    notes TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);


