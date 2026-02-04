"use server";

import { db } from "@/db";
import { propertyAnalysis, properties } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PropertyAnalysisRow = {
  id: string;
  propertyId: string;
  type: string;
  content: string;
  metadata: unknown;
  createdAt: Date;
};

const SECTION_HEADER = "## ";

/** Build vendor strategy text from property RESO-compliant data, structured in three sections (deterministic; can be replaced with AI later). */
function buildVendorStrategyContent(property: {
  address: string;
  suburb: string;
  postcode: string;
  propertyType: string;
  bedCount: number | null;
  bathCount: number | null;
  carSpaces: number | null;
  listPrice: string | null;
  livingArea: number | null;
}): string {
  const overview: string[] = [];
  overview.push(`${property.address}, ${property.suburb} ${property.postcode}`);
  overview.push("");
  overview.push(`Property type: ${property.propertyType}`);
  if (property.bedCount != null) overview.push(`Bedrooms: ${property.bedCount}`);
  if (property.bathCount != null) overview.push(`High-utility bathroom layout: ${property.bathCount} bathrooms`);
  if (property.carSpaces != null) overview.push(`Car spaces: ${property.carSpaces}`);
  if (property.livingArea != null) overview.push(`Substantial ${property.livingArea} m² landholding.`);
  if (property.listPrice != null && property.listPrice !== "") {
    const num = Number(property.listPrice);
    if (!Number.isNaN(num)) overview.push(`List price: $${num.toLocaleString("en-AU")}`);
  }

  const market: string[] = [];
  market.push(`Position as a quality offering in ${property.suburb}.`);
  market.push("");
  market.push("Key differentiators from RESO-compliant data:");
  if (property.bedCount != null) market.push(`• ${property.bedCount} bedrooms — highlight space and layout.`);
  if (property.bathCount != null) market.push(`• ${property.bathCount} bathrooms — high-utility bathroom layout.`);
  if (property.carSpaces != null) market.push(`• ${property.carSpaces} car spaces — appeal to families and commuters.`);
  if (property.livingArea != null) market.push(`• Substantial ${property.livingArea} m² landholding — quantify liveability.`);
  if (property.listPrice != null && property.listPrice !== "") {
    const num = Number(property.listPrice);
    if (!Number.isNaN(num)) market.push(`• Price guidance: $${num.toLocaleString("en-AU")} — align vendor expectations with market.`);
  }

  const strategy: string[] = [];
  strategy.push("Use the above specs in listing copy and vendor discussions.");
  strategy.push("");
  strategy.push("Recommendation: Lead with liveability and location; reinforce with exact bedroom, bathroom and parking numbers from the RESO data set.");

  return [
    SECTION_HEADER + "Property overview",
    overview.join("\n"),
    SECTION_HEADER + "Market positioning",
    market.join("\n"),
    SECTION_HEADER + "Vendor strategy",
    strategy.join("\n"),
  ].join("\n\n");
}

/** Generate a vendor strategy using the property's RESO-compliant data and save to Property Analysis table (NEON). */
export async function generateVendorStrategy(propertyId: string): Promise<
  | { ok: true; analysisId: string; content: string }
  | { ok: false; error: string }
> {
  try {
    const [property] = await db
      .select({
        address: properties.address,
        suburb: properties.suburb,
        postcode: properties.postcode,
        propertyType: properties.propertyType,
        bedCount: properties.bedCount,
        bathCount: properties.bathCount,
        carSpaces: properties.carSpaces,
        listPrice: properties.listPrice,
        livingArea: properties.livingArea,
      })
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property) {
      return { ok: false, error: "Property not found." };
    }

    const content = buildVendorStrategyContent({
      address: property.address,
      suburb: property.suburb,
      postcode: property.postcode,
      propertyType: property.propertyType,
      bedCount: property.bedCount,
      bathCount: property.bathCount,
      carSpaces: property.carSpaces,
      listPrice: property.listPrice != null ? String(property.listPrice) : null,
      livingArea: property.livingArea,
    });

    const [inserted] = await db
      .insert(propertyAnalysis)
      .values({
        propertyId,
        type: "vendor_strategy",
        content,
        metadata: { source: "vendor_strategy_generation", propertyAddress: `${property.address}, ${property.suburb}` },
      })
      .returning({ id: propertyAnalysis.id });

    if (!inserted) {
      return { ok: false, error: "Failed to save analysis." };
    }

    revalidatePath(`/properties/${propertyId}`);
    return { ok: true, analysisId: inserted.id, content };
  } catch (err) {
    console.error("generateVendorStrategy:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to generate strategy." };
  }
}

/** Fetch all analyses for a property (newest first) for display. */
export async function getAnalysesByPropertyId(propertyId: string): Promise<PropertyAnalysisRow[]> {
  try {
    const rows = await db
      .select({
        id: propertyAnalysis.id,
        propertyId: propertyAnalysis.propertyId,
        type: propertyAnalysis.type,
        content: propertyAnalysis.content,
        metadata: propertyAnalysis.metadata,
        createdAt: propertyAnalysis.createdAt,
      })
      .from(propertyAnalysis)
      .where(eq(propertyAnalysis.propertyId, propertyId))
      .orderBy(desc(propertyAnalysis.createdAt));

    return rows as PropertyAnalysisRow[];
  } catch (error) {
    console.error("getAnalysesByPropertyId:", error);
    return [];
  }
}
