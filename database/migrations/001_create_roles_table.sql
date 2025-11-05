-- Migración: Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
    ('super_admin', 'Super Administrador - Acceso completo al sistema'),
    ('admin', 'Administrador - Acceso administrativo limitado'),
    ('usuario', 'Usuario - Acceso básico')
ON CONFLICT (name) DO NOTHING;

