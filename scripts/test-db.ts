import "dotenv/config";
import { Pool } from "pg";

/**
 * Test script for Singapore PostGIS database connection.
 * Run with: npx tsx scripts/test-db.ts
 */
async function testDbConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL is not set in .env");
    process.exit(1);
  }

  // Extract username for error reporting (without exposing password)
  let username = "unknown";
  try {
    const parsed = new URL(url.replace(/^postgresql:/, "postgres:"));
    username = parsed.username || "unknown";
  } catch {
    // ignore parse errors
  }

  console.log(`Attempting connection as user: ${username}`);
  console.log("Selecting one row from properties table...\n");

  const pool = new Pool({ connectionString: url });

  try {
    const result = await pool.query("SELECT * FROM properties LIMIT 1");
    console.log("SUCCESS: Connection and query succeeded.");
    if (result.rows.length === 0) {
      console.log("(Table is empty - no rows returned. This is expected for a fresh database.)");
    } else {
      console.log("Sample row:", JSON.stringify(result.rows[0], null, 2));
    }
  } catch (err) {
    console.error("FAILED: Connection or query failed.");
    console.error("Username used:", username);
    console.error("Exact error:", err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
      console.error("\nStack trace:", err.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDbConnection();
