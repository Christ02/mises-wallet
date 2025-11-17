-- Migración: Agregar columna de permisos a usuarios
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb;

-- Índice para búsquedas en permisos
CREATE INDEX IF NOT EXISTS idx_users_permissions ON users USING GIN (permissions);

