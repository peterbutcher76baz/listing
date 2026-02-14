import "dotenv/config";
import { db } from "./index";
import { agents, properties, propertyFeatures, locations } from "./schema";

async function main() {
  console.log("🌱 Starting Seeding...");

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

  // 3NF: insert property core, then features and location per property
  const propsToSeed = [
    {
      property: {
        agentId: newAgent.id,
        address: "123 Massey Terrace",
        suburb: "Palmerston North",
        postcode: "4410",
        propertyType: "House",
        bedCount: 4,
        bathCount: 2,
        garageSpaces: 2,
        carPortSpaces: 0,
        parkingCount: 2,
        listPrice: "850000",
        livingArea: 180,
      },
      features: { garageCount: 2, carportCount: 0, workshopAlcove: false, standaloneShed: false, standaloneShedBays: 0 },
      location: { primarySchoolCatchment: null, secondarySchoolCatchment: null, primarySchoolProximity: null, secondarySchoolProximity: null },
    },
    {
      property: {
        agentId: newAgent.id,
        address: "45 Bungie Way",
        suburb: "Sydney",
        postcode: "2000",
        propertyType: "Unit",
        bedCount: 2,
        bathCount: 1,
        garageSpaces: 1,
        carPortSpaces: 0,
        parkingCount: 1,
        listPrice: "650000",
        livingArea: 95,
      },
      features: { garageCount: 1, carportCount: 0, workshopAlcove: false, standaloneShed: false, standaloneShedBays: 0 },
      location: { primarySchoolCatchment: null, secondarySchoolCatchment: null, primarySchoolProximity: null, secondarySchoolProximity: null },
    },
  ];

  for (const { property: p, features, location: loc } of propsToSeed) {
    const [inserted] = await db.insert(properties).values(p).returning({ id: properties.id });
    if (!inserted) throw new Error("Failed to insert property");
    await db.insert(propertyFeatures).values({ propertyId: inserted.id, ...features });
    await db.insert(locations).values({ propertyId: inserted.id, ...loc });
  }

  console.log("✅ Created 2 RESO 2.0 Properties (3NF) with features and locations.");
  console.log("🚀 Seeding Complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
