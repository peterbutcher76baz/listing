CREATE TABLE "agents" (
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
--> statement-breakpoint
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
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"address" text NOT NULL,
	"suburb" text NOT NULL,
	"postcode" text NOT NULL,
	"property_type" text ,
	"bed_count" integer,
	"bath_count" integer,
	"garage_spaces" integer,
	"car_port_spaces" integer,
	"parking_count" integer,
	"list_price" numeric(14, 2),
	"living_area" integer,
	"official_brand" text DEFAULT 'Place P',
	"corelogic_id" text,
	"rea_group_id" text,
	"domain_id" text,
	"state_property_id" text,
	"lot_plan_number" text,
	"agent_crm_id" text,
	"key_features" jsonb DEFAULT '[]'::jsonb,
	"coords" geography(Point, 4326),
	"status" text DEFAULT 'Draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "locations" ADD CONSTRAINT "locations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_analysis" ADD CONSTRAINT "property_analysis_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_rea_group_id_idx" ON "properties" USING btree ("rea_group_id");--> statement-breakpoint
CREATE INDEX "properties_corelogic_id_idx" ON "properties" USING btree ("corelogic_id");