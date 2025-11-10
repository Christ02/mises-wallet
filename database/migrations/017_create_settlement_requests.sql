CREATE TABLE IF NOT EXISTS settlement_requests (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    business_id INTEGER NOT NULL REFERENCES event_businesses(id) ON DELETE CASCADE,
    requested_amount NUMERIC(78, 18) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL DEFAULT 'HC',
    method VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    token_transfer_hash VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_settlement_requests_active
ON settlement_requests(business_id)
WHERE status IN ('pendiente', 'aprobada', 'pagada');


