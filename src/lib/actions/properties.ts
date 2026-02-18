"use server";

import { db } from "@/db";
import { properties, propertyFeatures, locations, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

/** Gallery/API shape: properties core + parkingCount as carSpaces for backward compat. */
export type AgentProperty = {
  id: string;
  agentId: string | null;
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  bedCount: number | null;
  bathCount: number | null;
  garageSpaces: number | null;
  carPortSpaces: number | null;
  parkingCount: number | null;
  /** Alias for gallery: same as parkingCount. */
  carSpaces: number | null;
  status: string | null;
  listPrice: string | null;
  livingArea: number | null;
  officialBrand: string | null;
  /** External identity hooks. */
  corelogicId: string | null;
  reaGroupId: string | null;
  domainId: string | null;
  statePropertyId: string | null;
  lotPlanNumber: string | null;
  agentCrmId: string | null;
  createdAt: Date;
  updatedAt: Date;
  /** School catchments from locations (joined). */
  primarySchoolCatchment: string | null;
  secondarySchoolCatchment: string | null;
  /** Community amenities (ready for future geo script). */
  shoppingCentre: string | null;
  shoppingCentreDistanceKm: string | null;
  /** Key features checklist (e.g. Solar Power, Swimming pool). */
  keyFeatures: string[];
};

const propertySelection = {
  id: properties.id,
  agentId: properties.agentId,
  address: properties.address,
  suburb: properties.suburb,
  postcode: properties.postcode,
  propertyType: properties.propertyType,
  bedCount: properties.bedCount,
  bathCount: properties.bathCount,
  garageSpaces: properties.garageSpaces,
  carPortSpaces: properties.carPortSpaces,
  parkingCount: properties.parkingCount,
  status: properties.status,
  listPrice: properties.listPrice,
  livingArea: properties.livingArea,
  officialBrand: properties.officialBrand,
  corelogicId: properties.corelogicId,
  reaGroupId: properties.reaGroupId,
  domainId: properties.domainId,
  statePropertyId: properties.statePropertyId,
  lotPlanNumber: properties.lotPlanNumber,
  agentCrmId: properties.agentCrmId,
  keyFeatures: properties.keyFeatures,
  createdAt: properties.createdAt,
  updatedAt: properties.updatedAt,
};

/** Row shape from select (properties + locations join). */
type SelectRow = {
  id: string;
  agentId: string | null;
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  bedCount: number | null;
  bathCount: number | null;
  garageSpaces: number | null;
  carPortSpaces: number | null;
  parkingCount: number | null;
  status: string | null;
  listPrice: string | null;
  livingArea: number | null;
  officialBrand: string | null;
  corelogicId: string | null;
  reaGroupId: string | null;
  domainId: string | null;
  statePropertyId: string | null;
  lotPlanNumber: string | null;
  agentCrmId: string | null;
  keyFeatures: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  primarySchoolCatchment: string | null;
  secondarySchoolCatchment: string | null;
  shoppingCentre: string | null;
  shoppingCentreDistanceKm: string | null;
};

function mapRow(row: SelectRow): AgentProperty {
  return {
    ...row,
    carSpaces: row.parkingCount ?? null,
    primarySchoolCatchment: row.primarySchoolCatchment ?? null,
    secondarySchoolCatchment: row.secondarySchoolCatchment ?? null,
    shoppingCentre: row.shoppingCentre ?? null,
    shoppingCentreDistanceKm: row.shoppingCentreDistanceKm ?? null,
    keyFeatures: Array.isArray(row.keyFeatures) ? row.keyFeatures : [],
  };
}

export async function getAgentProperties(agentEmail: string): Promise<AgentProperty[]> {
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.email, agentEmail),
    });

    if (!agent) return [];

    const rows = await db
      .select({
        ...propertySelection,
        primarySchoolCatchment: locations.primarySchoolCatchment,
        secondarySchoolCatchment: locations.secondarySchoolCatchment,
        shoppingCentre: locations.shoppingCentre,
        shoppingCentreDistanceKm: locations.shoppingCentreDistanceKm,
      })
      .from(properties)
      .leftJoin(locations, eq(properties.id, locations.propertyId))
      .where(eq(properties.agentId, agent.id));

    return rows.map(mapRow) as AgentProperty[];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

/** Fetch all properties (RESO-compliant 3NF) for gallery. */
export async function getAllProperties(): Promise<AgentProperty[]> {
  try {
    const rows = await db
      .select({
        ...propertySelection,
        primarySchoolCatchment: locations.primarySchoolCatchment,
        secondarySchoolCatchment: locations.secondarySchoolCatchment,
        shoppingCentre: locations.shoppingCentre,
        shoppingCentreDistanceKm: locations.shoppingCentreDistanceKm,
      })
      .from(properties)
      .leftJoin(locations, eq(properties.id, locations.propertyId));

    return rows.map(mapRow) as AgentProperty[];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<AgentProperty | null> {
  try {
    const rows = await db
      .select({
        ...propertySelection,
        primarySchoolCatchment: locations.primarySchoolCatchment,
        secondarySchoolCatchment: locations.secondarySchoolCatchment,
        shoppingCentre: locations.shoppingCentre,
        shoppingCentreDistanceKm: locations.shoppingCentreDistanceKm,
      })
      .from(properties)
      .leftJoin(locations, eq(properties.id, locations.propertyId))
      .where(eq(properties.id, id))
      .limit(1);

    const row = rows[0];
    return row ? (mapRow(row) as AgentProperty) : null;
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return null;
  }
}

/** Save composite property (form) to all three tables. Returns new property id. */
export async function saveCompositeProperty(
  composite: import("@/schemas/property.schema").CompositePropertyInsert,
  agentId?: string | null
): Promise<{ ok: true; propertyId: string } | { ok: false; error: string }> {
  try {
    const [inserted] = await db
      .insert(properties)
      .values({
        agentId: agentId ?? composite.property.agentId ?? null,
        address: composite.property.address,
        suburb: composite.property.suburb,
        postcode: composite.property.postcode,
        propertyType: composite.property.propertyType,
        bedCount: composite.property.bedCount ?? null,
        bathCount: composite.property.bathCount ?? null,
        garageSpaces: composite.property.garageSpaces ?? null,
        carPortSpaces: composite.property.carPortSpaces ?? null,
        parkingCount: composite.property.parkingCount ?? null,
        listPrice: composite.property.listPrice ?? null,
        livingArea: composite.property.livingArea ?? null,
        officialBrand: composite.property.officialBrand ?? "Place P",
        corelogicId: composite.property.corelogicId ?? null,
        reaGroupId: composite.property.reaGroupId ?? null,
        domainId: composite.property.domainId ?? null,
        statePropertyId: composite.property.statePropertyId ?? null,
        lotPlanNumber: composite.property.lotPlanNumber ?? null,
        agentCrmId: composite.property.agentCrmId ?? null,
        keyFeatures: composite.property.keyFeatures ?? [],
        status: composite.property.status ?? "Draft",
      })
      .returning({ id: properties.id });

    if (!inserted) {
      return { ok: false, error: "Failed to insert property." };
    }

    const propertyId = inserted.id;

    await db.insert(propertyFeatures).values({
      propertyId,
      garageCount: composite.features.garageCount,
      carportCount: composite.features.carportCount,
      workshopAlcove: composite.features.workshopAlcove,
      standaloneShed: composite.features.standaloneShed,
      standaloneShedBays: composite.features.standaloneShedBays,
    });

    await db.insert(locations).values({
      propertyId,
      primarySchoolCatchment: composite.location.primarySchoolCatchment ?? null,
      secondarySchoolCatchment: composite.location.secondarySchoolCatchment ?? null,
      primarySchoolProximity: composite.location.primarySchoolProximity ?? null,
      secondarySchoolProximity: composite.location.secondarySchoolProximity ?? null,
      shoppingCentre: composite.location.shoppingCentre ?? null,
      shoppingCentreDistanceKm: composite.location.shoppingCentreDistanceKm ?? null,
    });

    return { ok: true, propertyId };
  } catch (err) {
    console.error("saveCompositeProperty:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to save property." };
  }
}
