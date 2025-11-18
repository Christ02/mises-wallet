-- Migración: crear tabla de reportes generados

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    filters JSONB,
    columns JSONB,
    file_path TEXT,
    format VARCHAR(20) DEFAULT 'csv',
    status VARCHAR(30) DEFAULT 'generado',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_entity ON reports(entity);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

