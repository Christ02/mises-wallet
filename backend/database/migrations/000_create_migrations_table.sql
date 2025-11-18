-- Tabla para trackear migraciones ejecutadas
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);

