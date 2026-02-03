"use server";

import { db } from "@/db";
import { properties, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAgentProperties(agentEmail: string) {
  try {
    // 1. Find Chris by his email
    const agent = await db.query.agents.findFirst({
      where: eq(agents.email, agentEmail),
    });

    if (!agent) return [];

    // 2. Fetch all properties linked to Chris
    const data = await db
      .select()
      .from(properties)
      .where(eq(properties.agentId, agent.id));

    return data;
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const row = await db.query.properties.findFirst({
      where: eq(properties.id, id),
    });
    return row ?? null;
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }
}
