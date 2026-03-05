CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"primary_school_catchment" text,
	"secondary_school_catchment" text,
	"primary_school_proximity" text,
	"secondary_school_proximity" text,
	"shopping_centre" text,
	"shopping_centre_distance_km" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_property_id_unique" UNIQUE("property_id")
);
--> statement-breakpoint
CREATE TABLE "property_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"type" text DEFAULT 'vendor_strategy' NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"garage_count" integer DEFAULT 0 NOT NULL,
	"carport_count" integer DEFAULT 0 NOT NULL,
	"workshop_alcove" boolean DEFAULT false NOT NULL,
	"standalone_shed" boolean DEFAULT false NOT NULL,
	"standalone_shed_bays" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "property_features_property_id_unique" UNIQUE("property_id")
);
--> statement-breakpoint
ALTER TABLE "properties" DROP CONSTRAINT "properties_external_id_unique";--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "living_area" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "agency_logo_url" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "writing_samples" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "tone_preference" text DEFAULT 'Professional';--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "subscription_status" text DEFAULT 'Trial';--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "last_updated" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "property_type" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "bed_count" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "bath_count" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "garage_spaces" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "car_port_spaces" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "parking_count" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "list_price" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "official_brand" text DEFAULT 'Place P';--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "corelogic_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "rea_group_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "domain_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "state_property_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "lot_plan_number" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "agent_crm_id" text;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "key_features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "status" text DEFAULT 'Draft';--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_analysis" ADD CONSTRAINT "property_analysis_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_rea_group_id_idx" ON "properties" USING btree ("rea_group_id");--> statement-breakpoint
CREATE INDEX "properties_corelogic_id_idx" ON "properties" USING btree ("corelogic_id");--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "coords" geography(Point, 4326);

