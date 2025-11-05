-- Migración: Agregar wallet_id a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL;

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_wallet_id ON users(wallet_id);

-- Comentario para documentación
COMMENT ON COLUMN users.wallet_id IS 'Referencia a la wallet del usuario (relación 1:1)';

