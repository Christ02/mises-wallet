-- Migración: agregar campo de array de imágenes a eventos

ALTER TABLE events
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Migrar cover_image_url existente al array images si existe
UPDATE events
SET images = CASE 
  WHEN cover_image_url IS NOT NULL THEN jsonb_build_array(cover_image_url)
  ELSE '[]'::jsonb
END
WHERE images = '[]'::jsonb OR images IS NULL;

-- Índice para búsquedas en el array de imágenes
CREATE INDEX IF NOT EXISTS idx_events_images ON events USING GIN (images);

