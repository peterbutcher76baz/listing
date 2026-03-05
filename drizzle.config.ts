import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Ensure we only look at YOUR tables and ignore PostGIS system tables
  tablesFilter: ["agents", "locations", "properties", "property_analysis", "property_features"],
  schemaFilter: ["public"], // Only look in the public schema
});
