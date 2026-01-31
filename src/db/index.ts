import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

/**
 * GUARDRAIL: 
 * Always use 'db.query' for read-only reports to maintain performance.
 * Use 'db.insert/update' only within Service files, never in UI components.
 */
