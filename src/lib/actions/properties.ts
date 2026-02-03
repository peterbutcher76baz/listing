"use server";

import { db } from "@/db";
import { properties, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

// Only columns that exist in Neon: id, agent_id, address, suburb, postcode, bedrooms
type AgentProperty = Pick<
  typeof properties.$inferSelect,
  "id" | "agentId" | "address" | "suburb" | "postcode" | "bedrooms"
>;

const propertySelection = {
  id: properties.id,
  agentId: properties.agentId,
  address: properties.address,
  suburb: properties.suburb,
  postcode: properties.postcode,
  bedrooms: properties.bedrooms,
};

export async function getAgentProperties(agentEmail: string): Promise<AgentProperty[]> {
  try {
    // 1. Find Chris by his email
    const agent = await db.query.agents.findFirst({
      where: eq(agents.email, agentEmail),
    });

    if (!agent) return [];

    // 2. Fetch all properties linked to Chris
    const data = await db
      .select(propertySelection)
      .from(properties)
      .where(eq(properties.agentId, agent.id));

    return data as AgentProperty[];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<AgentProperty | null> {
  try {
    const row = await db
      .select(propertySelection)
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);

    return (row[0] as AgentProperty | undefined) ?? null;
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }
}
