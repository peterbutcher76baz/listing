-- Current schema: agents + properties (bedrooms, bathrooms, landSize, livingArea, etc.)
CREATE TABLE IF NOT EXISTS "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"agency_name" text NOT NULL,
	"agency_logo_url" text,
	"writing_samples" jsonb DEFAULT '[]'::jsonb,
	"tone_preference" text DEFAULT 'Professional',
	"subscription_status" text DEFAULT 'Trial',
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agents_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"address" text NOT NULL,
	"suburb" text NOT NULL,
	"postcode" text NOT NULL,
	"property_type" text NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"car_spaces" integer,
	"land_size" numeric,
	"living_area" numeric,
	"status" text DEFAULT 'Draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_agent_id_agents_id_fk'
  ) THEN
    ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk"
      FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;
