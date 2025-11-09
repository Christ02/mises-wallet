-- Migración: agregar campo de imagen de portada a eventos

ALTER TABLE events
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Asegurar que las entradas existentes tengan valor nulo explícito
UPDATE events
SET cover_image_url = NULL
WHERE cover_image_url IS NULL;

