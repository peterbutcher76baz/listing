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
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  // FILE 45: Linking the property to the agent
  agentId: uuid("agent_id").references(() => agents.id),

  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  postcode: text("postcode").notNull(),
  propertyType: text("property_type").notNull(), // e.g., House, Unit
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  carSpaces: integer("car_spaces"),

  status: text("status").default("Draft"), // Draft, Published, Archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Only columns that exist in Neon: id, agent_id, address, suburb, postcode, bedrooms
export const selectPropertySchema = createSelectSchema(properties).pick({
  id: true,
  agentId: true,
  address: true,
  suburb: true,
  postcode: true,
  bedrooms: true,
});
