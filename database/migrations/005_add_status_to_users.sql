-- Migración: Agregar columna status a usuarios
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'activo';

-- Actualizar registros existentes a 'activo' si estuvieran en NULL
UPDATE users
SET status = 'activo'
WHERE status IS NULL;

-- Índice opcional para búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);


