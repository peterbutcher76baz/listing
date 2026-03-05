-- 3NF: property_features and locations tables; properties gets garage_spaces, car_port_spaces, parking_count (RESO 2.0).

-- New table: parking matrix and workshop/shed toggles
CREATE TABLE IF NOT EXISTS "property_features" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "property_id" uuid NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
  "garage_count" integer DEFAULT 0 NOT NULL,
  "carport_count" integer DEFAULT 0 NOT NULL,
  "workshop_alcove" boolean DEFAULT false NOT NULL,
  "standalone_shed" boolean DEFAULT false NOT NULL,
  "standalone_shed_bays" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "property_features_property_id_unique" UNIQUE("property_id")
);

-- New table: school catchments and proximity
CREATE TABLE IF NOT EXISTS "locations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "property_id" uuid NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
  "primary_school_catchment" text,
  "secondary_school_catchment" text,
  "primary_school_proximity" text,
  "secondary_school_proximity" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "locations_property_id_unique" UNIQUE("property_id")
);

-- Add RESO 2.0 sum columns to properties if missing (garageSpaces, carPortSpaces, parkingCount)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'garage_spaces') THEN
    ALTER TABLE "properties" ADD COLUMN "garage_spaces" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'car_port_spaces') THEN
    ALTER TABLE "properties" ADD COLUMN "car_port_spaces" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'parking_count') THEN
    ALTER TABLE "properties" ADD COLUMN "parking_count" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'official_brand') THEN
    ALTER TABLE "properties" ADD COLUMN "official_brand" text DEFAULT 'Place P';
  END IF;
END $$;
