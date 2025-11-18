-- Migración: Agregar columna group_id a event_businesses

ALTER TABLE event_businesses
ADD COLUMN IF NOT EXISTS group_id VARCHAR(32);

UPDATE event_businesses
SET group_id = CONCAT('GRP-', UPPER(SUBSTRING(md5(random()::text), 1, 8)))
WHERE group_id IS NULL;

ALTER TABLE event_businesses
ALTER COLUMN group_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_businesses_group_id
ON event_businesses(group_id);

