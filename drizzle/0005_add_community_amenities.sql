-- Add community amenities and key features columns.

-- Locations: shopping centre and distance
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "shopping_centre" text;
ALTER TABLE "locations" ADD COLUMN IF NOT EXISTS "shopping_centre_distance_km" text;

-- Properties: key features checklist (JSON array)
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "key_features" jsonb DEFAULT '[]'::jsonb;
