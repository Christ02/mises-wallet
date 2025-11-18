CREATE TABLE IF NOT EXISTS event_business_members (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES event_businesses(id) ON DELETE CASCADE,
    carnet VARCHAR(50) NOT NULL,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_business_member UNIQUE (business_id, carnet)
);

CREATE INDEX IF NOT EXISTS idx_event_business_members_business_id ON event_business_members(business_id);
