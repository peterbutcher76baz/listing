-- RISO data dictionary v2.0: BedCount, BathCount, list price (P), living area (A)
-- Rename bedrooms -> bed_count, bathrooms -> bath_count (safe if columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
    ALTER TABLE "properties" RENAME COLUMN "bedrooms" TO "bed_count";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
    ALTER TABLE "properties" RENAME COLUMN "bathrooms" TO "bath_count";
  END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "list_price" numeric(14, 2);
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'living_area') THEN
    ALTER TABLE "properties" ALTER COLUMN "living_area" TYPE integer USING ("living_area"::integer);
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'living_area') THEN
    ALTER TABLE "properties" ADD COLUMN "living_area" integer;
  END IF;
END $$;
