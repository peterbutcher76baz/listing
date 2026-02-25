import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // This tells Drizzle: "Only touch tables I've actually defined"
  tablesFilter: ["agents", "locations", "properties", "property_analysis", "property_features"],
});
