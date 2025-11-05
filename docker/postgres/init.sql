-- Script de inicialización de PostgreSQL
-- Este archivo se ejecuta automáticamente al crear el contenedor

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE mises_wallet'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mises_wallet')\gexec

-- Conectar a la base de datos
\c mises_wallet

-- Aquí puedes agregar cualquier inicialización adicional
-- como creación de extensiones, esquemas, etc.

-- Ejemplo: Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

