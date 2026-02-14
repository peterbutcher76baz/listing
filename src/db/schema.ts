import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

// --- PROPERTIES TABLE (3NF: core details only) ---
// RESO Data Dictionary 2.0: address (string), garageSpaces (integer), carPortSpaces (integer).
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id),

  /** Full street address. RESO 2.0. */
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  postcode: text("postcode").notNull(),
  propertyType: text("property_type").notNull(),
  bedCount: integer("bed_count"),
  bathCount: integer("bath_count"),
  /** Lock-up garage spaces only. Integer. RESO 2.0 GarageSpaces. */
  garageSpaces: integer("garage_spaces"),
  /** Car port / covered spaces. Integer. RESO 2.0 CarPortSpaces. */
  carPortSpaces: integer("car_port_spaces"),
  /** Total parking count (garage + carport + shed bays) for display. */
  parkingCount: integer("parking_count"),

  listPrice: decimal("list_price", { precision: 14, scale: 2 }),
  livingArea: integer("living_area"), // Living area in sqm (Australian market)

  /** Official brand for AI guidelines. Default Place P. */
  officialBrand: text("official_brand").default("Place P"),

  status: text("status").default("Draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- PROPERTY_FEATURES TABLE (3NF: parking matrix and feature toggles) ---
/** Detailed parking breakdown and workshop/shed toggles. Linked by propertyId. */
export const propertyFeatures = pgTable("property_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  /** Total lock-up garages (1 = SLUG, 2 = DLUG, 3+ = DLUG + additional). */
  garageCount: integer("garage_count").notNull().default(0),
  /** Car port / covered spaces. */
  carportCount: integer("carport_count").notNull().default(0),
  /** Internal workshop/storage associated with main garage. */
  workshopAlcove: boolean("workshop_alcove").notNull().default(false),
  /** Detached shed/workshop. */
  standaloneShed: boolean("standalone_shed").notNull().default(false),
  /** Number of bays when standaloneShed is true. */
  standaloneShedBays: integer("standalone_shed_bays").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- LOCATIONS TABLE (3NF: school catchments and proximity) ---
/** School catchment and proximity. Linked by propertyId. */
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  primarySchoolCatchment: text("primary_school_catchment"),
  secondarySchoolCatchment: text("secondary_school_catchment"),
  primarySchoolProximity: text("primary_school_proximity"), // e.g. "500m", "walking distance"
  secondarySchoolProximity: text("secondary_school_proximity"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- DRIZZLE RELATIONSHIPS ---
export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(agents),
  features: one(propertyFeatures),
  location: one(locations),
  analyses: many(propertyAnalysis),
}));

export const propertyFeaturesRelations = relations(propertyFeatures, ({ one }) => ({
  property: one(properties),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  property: one(properties),
}));

// --- PROPERTY ANALYSIS TABLE ---
export const propertyAnalysis = pgTable("property_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .references(() => properties.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull().default("vendor_strategy"),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const propertyAnalysisRelations = relations(propertyAnalysis, ({ one }) => ({
  property: one(properties),
}));

// --- SELECT SCHEMAS (for API / type safety) ---
export const selectPropertySchema = createSelectSchema(properties).pick({
  id: true,
  agentId: true,
  address: true,
  suburb: true,
  postcode: true,
  propertyType: true,
  bedCount: true,
  bathCount: true,
  garageSpaces: true,
  carPortSpaces: true,
  parkingCount: true,
  status: true,
  listPrice: true,
  livingArea: true,
  officialBrand: true,
  createdAt: true,
  updatedAt: true,
});

export const selectPropertyFeaturesSchema = createSelectSchema(propertyFeatures);
export const selectLocationsSchema = createSelectSchema(locations);
