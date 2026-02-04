-- Property Analysis: permanent auditable record for AI-generated vendor strategies (RESO-compliant).
CREATE TABLE IF NOT EXISTS "property_analysis" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "property_id" uuid NOT NULL REFERENCES "properties"("id"),
  "type" text DEFAULT 'vendor_strategy' NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);
