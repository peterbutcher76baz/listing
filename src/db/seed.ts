import "dotenv/config";
import { db } from "./index";
import { agents, properties } from "./schema";

async function main() {
  console.log("🌱 Starting Seeding...");

  // 1. Create the Agent (The Parent)
  const [newAgent] = await db
    .insert(agents)
    .values({
      fullName: "Chris RealEstate",
      email: "chris@realinfo.au",
      agencyName: "RealInfo Advisors",
      tonePreference: "Professional",
    })
    .returning();

  if (!newAgent) {
    throw new Error("Failed to create agent");
  }

  console.log(`✅ Created Agent: ${newAgent.fullName} (ID: ${newAgent.id})`);

  // 2. Create Properties (The Children) linked to the Agent
  await db.insert(properties).values([
    {
      agentId: newAgent.id,
      address: "123 Massey Terrace",
      suburb: "Palmerston North",
      postcode: "4410",
      propertyType: "House",
      bedCount: 4,
      bathCount: 2,
      carSpaces: 2,
      listPrice: "850000",
      livingArea: 180,
    },
    {
      agentId: newAgent.id,
      address: "45 Bungie Way",
      suburb: "Sydney",
      postcode: "2000",
      propertyType: "Unit",
      bedCount: 2,
      bathCount: 1,
      carSpaces: 1,
      listPrice: "650000",
      livingArea: 95,
    },
  ]);

  console.log("✅ Created 2 RESO 2.0 Properties linked to Agent.");
  console.log("🚀 Seeding Complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
