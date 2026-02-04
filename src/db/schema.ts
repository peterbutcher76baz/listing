import { pgTable, text, timestamp, uuid, jsonb, integer, decimal } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

// --- AGENTS TABLE ---
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").unique().notNull(),
  agencyName: text("agency_name").notNull(),
  agencyLogoUrl: text("agency_logo_url"),
  writingSamples: jsonb("writing_samples").default([]),
  tonePreference: text("tone_preference").default("Professional"),
  subscriptionStatus: text("subscription_status").default("Trial"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// --- PROPERTIES TABLE ---
// RISO data dictionary v2.0: BedCount (bedrooms), BathCount (bathrooms), list price (P), living area (A)
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id),

  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  postcode: text("postcode").notNull(),
  propertyType: text("property_type").notNull(),
  bedCount: integer("bed_count"),   // Standard Name: bedrooms
  bathCount: integer("bath_count"), // Standard Name: bathrooms
  carSpaces: integer("car_spaces"),

  listPrice: decimal("list_price", { precision: 14, scale: 2 }), // List price (P)
  livingArea: integer("living_area"), // Living area (A) in sqm

  status: text("status").default("Draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const selectPropertySchema = createSelectSchema(properties).pick({
  id: true,
  agentId: true,
  address: true,
  suburb: true,
  postcode: true,
  propertyType: true,
  bedCount: true,
  bathCount: true,
  carSpaces: true,
  status: true,
  listPrice: true,
  livingArea: true,
  createdAt: true,
  updatedAt: true,
});
