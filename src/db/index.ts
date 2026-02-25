import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/** Requires DATABASE_URL in environment (e.g. .env) for PostgreSQL/PostGIS connection. */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool, schema });

/**
 * GUARDRAIL: 
 * Always use 'db.query' for read-only reports to maintain performance.
 * Use 'db.insert/update' only within Service files, never in UI components.
 */
