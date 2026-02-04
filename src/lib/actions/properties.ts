"use server";

import { db } from "@/db";
import { properties, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

type AgentProperty = Pick<
  typeof properties.$inferSelect,
  | "id"
  | "agentId"
  | "address"
  | "suburb"
  | "postcode"
  | "propertyType"
  | "bedCount"
  | "bathCount"
  | "carSpaces"
  | "status"
  | "listPrice"
  | "livingArea"
  | "createdAt"
  | "updatedAt"
>;

const propertySelection = {
  id: properties.id,
  agentId: properties.agentId,
  address: properties.address,
  suburb: properties.suburb,
  postcode: properties.postcode,
  propertyType: properties.propertyType,
  bedCount: properties.bedCount,
  bathCount: properties.bathCount,
  carSpaces: properties.carSpaces,
  status: properties.status,
  listPrice: properties.listPrice,
  livingArea: properties.livingArea,
  createdAt: properties.createdAt,
  updatedAt: properties.updatedAt,
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
