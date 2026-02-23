import "dotenv/config";

/**
 * Production seed: no demo data.
 * Run `npm run seed` to execute. Does not auto-run on app startup.
 * Add your own seed logic here when needed for development.
 */
async function main() {
  console.log("🌱 Starting seed (production mode — no demo data)...");
  // No automatic insertion of demo or test data.
  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
