import { z } from "zod";
import { AddressSchema, locationsTableSchema, type LocationsTableRow } from "./location.schema";

/** RESO 2.0: parking breakdown for AI copywriter (metadata). Not the single DB total. */
export const ParkingMetadataSchema = z.object({
  GarageCount: z.number().int().min(0),
  CarportCount: z.number().int().min(0),
  WorkshopAlcove: z.boolean().optional(),
  StandaloneShed: z.boolean().optional(),
  StandaloneShedBays: z.number().int().min(0).optional(),
}).strict();

const ImprovementsSchema = z.object({
  BedroomsTotal: z.number().int().min(0, "Bedrooms cannot be less than 0").optional(),
  BathroomsFull: z.number().int().min(0, "Bathrooms cannot be less than 0").optional(),
  LivingArea: z.number().positive().optional(), // Living area (m²), Australian market
  /** Total lock-up garages: 1 = SLUG, 2 = DLUG, 3+ = DLUG + additional (RESO). Integer. */
  GarageCount: z.number().int().min(0, "Garage count cannot be negative").optional(),
  /** Car port / covered spaces (RESO). Integer. */
  CarportCount: z.number().int().min(0, "Carport count cannot be negative").optional(),
  /** Internal workshop/storage associated with main garage. */
  WorkshopAlcove: z.boolean().optional(),
  /** Detached shed/workshop. */
  StandaloneShed: z.boolean().optional(),
  /** Number of bays when StandaloneShed is true. */
  StandaloneShedBays: z.number().int().min(0, "Shed bays cannot be negative").optional(),
}).strict().optional();

const LandSchema = z.object({
  LotSizeSquareMeters: z.number().positive().optional(),
}).strict().optional();

/** External identity hooks for 3NF (corelogic, REA, Domain, state VGID, lot/plan, CRM). */
/** Community amenities (location intelligence): school catchment, shopping, transport. */
export const IdentitySchema = z.object({
  corelogicId: z.string().optional(),
  reaGroupId: z.string().optional(),
  domainId: z.string().optional(),
  statePropertyId: z.string().optional(),
  lotPlanNumber: z.string().optional(),
  /** Local zoning code (e.g. BCC City Plan). */
  zoning: z.string().optional(),
  agentCrmId: z.string().optional(),
  schoolCatchment: z.string().optional(),
  shoppingCentre: z.string().optional(),
  /** Distance to nearest major shopping centre in km (for report and future distance automation). */
  shoppingCentreDistanceKm: z.union([z.string(), z.number()]).optional(),
  publicTransport: z.string().optional(),
  /** Populated by future geo script: suggested school catchment. */
  suggestedCatchment: z.string().optional(),
  /** Populated by future geo script: estimated drive to major shops (e.g. "5 km"). */
  estimatedDriveToShops: z.string().optional(),
}).strict().optional();

/** Computes total parking count (garage + carport + shed bays) and metadata for DB vs AI. */
function computeParking(improvements: z.infer<typeof ImprovementsSchema>): {
  ParkingCount: number;
  parkingMetadata: z.infer<typeof ParkingMetadataSchema>;
} {
  const g = improvements?.GarageCount ?? 0;
  const c = improvements?.CarportCount ?? 0;
  const s = improvements?.StandaloneShedBays ?? 0;
  const total = g + c + s;
  return {
    ParkingCount: total,
    parkingMetadata: {
      GarageCount: g,
      CarportCount: c,
      WorkshopAlcove: improvements?.WorkshopAlcove,
      StandaloneShed: improvements?.StandaloneShed,
      StandaloneShedBays: improvements?.StandaloneShedBays,
    },
  };
}

const propertySchemaBase = z.object({
  propertyId: z.string(),
  lastSalePrice: z.number().optional(),
  address: AddressSchema,
  improvements: ImprovementsSchema,
  land: LandSchema,
  source: z.string().optional(),
  dataConfidence: z.number().min(0).max(10).optional(),
  /** Accept Date or string from persisted JSON so rehydration does not lose data. */
  createdAt: z.union([z.date(), z.string()]).optional().transform((d) => (d == null ? undefined : typeof d === "string" ? new Date(d) : d)),
  /** RESO 2.0: which brand guidelines the AI follows. Default "Place P". */
  OfficialBrand: z.string().default("Place P"),
  /** External identity vault (REA, Domain, CoreLogic, state VGID, lot/plan, CRM). */
  identity: IdentitySchema,
  /** Key features checklist for final report: Solar Power, Swimming pool, etc. */
  keyFeatures: z.array(z.string()).optional(),
}).strip(); // strip computed ParkingCount/parkingMetadata when form re-submits so transform recomputes

/** Property schema with RESO-aligned ParkingCount (DB) and parkingMetadata (AI). */
export const propertySchema = propertySchemaBase.transform((data) => {
  const { ParkingCount, parkingMetadata } = computeParking(data.improvements);
  return {
    ...data,
    ParkingCount,
    parkingMetadata,
  };
});

export const PropertySchema = propertySchema;
export type Property = z.infer<typeof propertySchema>;
/** Form input type (before transform). Use for useForm; submit handler receives Property. */
export type PropertyFormInput = z.input<typeof propertySchema>;

// --- Zod schemas for 3NF DB tables (RESO 2.0) ---

/** Properties table: core details only. garageSpaces and carPortSpaces are RESO sum fields. */
export const propertiesTableSchema = z.object({
  id: z.string().uuid().optional(),
  agentId: z.string().uuid().nullable().optional(),
  address: z.string().min(1, "Address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  postcode: z.string().min(1, "Postcode is required"),
  propertyType: z.string().min(1, "Property type is required"),
  bedCount: z.number().int().min(0).nullable().optional(),
  bathCount: z.number().int().min(0).nullable().optional(),
  garageSpaces: z.number().int().min(0).nullable().optional(),
  carPortSpaces: z.number().int().min(0).nullable().optional(),
  parkingCount: z.number().int().min(0).nullable().optional(),
  listPrice: z.string().nullable().optional(),
  livingArea: z.number().int().positive().nullable().optional(),
  officialBrand: z.string().default("Place P"),
  /** External identity hooks (nullable). */
  corelogicId: z.string().nullable().optional(),
  reaGroupId: z.string().nullable().optional(),
  domainId: z.string().nullable().optional(),
  statePropertyId: z.string().nullable().optional(),
  lotPlanNumber: z.string().nullable().optional(),
  agentCrmId: z.string().nullable().optional(),
  keyFeatures: z.array(z.string()).nullable().optional(),
  status: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).strict();

/** Property_features table: parking matrix and workshop/shed toggles. */
export const propertyFeaturesTableSchema = z.object({
  id: z.string().uuid().optional(),
  propertyId: z.string().uuid(),
  garageCount: z.number().int().min(0),
  carportCount: z.number().int().min(0),
  workshopAlcove: z.boolean().default(false),
  standaloneShed: z.boolean().default(false),
  standaloneShedBays: z.number().int().min(0).default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).strict();

export type PropertiesTableRow = z.infer<typeof propertiesTableSchema>;
export type PropertyFeaturesTableRow = z.infer<typeof propertyFeaturesTableSchema>;

/** Composite payload to save Property form data to all three tables at once. */
export type CompositePropertyInsert = {
  property: z.infer<typeof propertiesTableSchema>;
  features: Omit<z.infer<typeof propertyFeaturesTableSchema>, "propertyId">;
  location: Omit<LocationsTableRow, "propertyId">;
};

/** Map form Property (composite schema output) to three table rows for DB insert. RESO: GarageSpaces and CarPortSpaces from improvements. */
export function propertyToThreeTables(property: Property, options?: { agentId?: string | null; propertyType?: string }): CompositePropertyInsert {
  const addr = property.address;
  const imp = property.improvements ?? {};
  const g = imp.GarageCount ?? 0;
  const c = imp.CarportCount ?? 0;
  const s = imp.StandaloneShedBays ?? 0;
  const addressLine = [addr?.StreetNumber, addr?.StreetName].filter(Boolean).join(" ").trim() || "";
  const suburb = addr?.City ?? "";
  const postcode = addr?.PostalCode ?? "";

  const { ParkingCount } = computeParking(property.improvements);

  const id = property.identity;
  const propertyRow = propertiesTableSchema.parse({
    agentId: options?.agentId ?? null,
    address: addressLine || "—",
    suburb: suburb || "—",
    postcode: postcode || "—",
    propertyType: options?.propertyType ?? "House",
    bedCount: imp.BedroomsTotal ?? null,
    bathCount: imp.BathroomsFull ?? null,
    garageSpaces: g,
    carPortSpaces: c,
    parkingCount: ParkingCount,
    livingArea: imp.LivingArea ?? null,
    officialBrand: property.OfficialBrand ?? "Place P",
    corelogicId: id?.corelogicId ?? null,
    reaGroupId: id?.reaGroupId ?? null,
    domainId: id?.domainId ?? null,
    statePropertyId: id?.statePropertyId ?? null,
    lotPlanNumber: id?.lotPlanNumber ?? null,
    agentCrmId: id?.agentCrmId ?? null,
    keyFeatures: property.keyFeatures ?? [],
    status: "Draft",
  });

  const featuresRow = propertyFeaturesTableSchema.omit({ propertyId: true }).parse({
    garageCount: g,
    carportCount: c,
    workshopAlcove: imp.WorkshopAlcove ?? false,
    standaloneShed: imp.StandaloneShed ?? false,
    standaloneShedBays: s,
  });

  const schoolCatchment = id?.schoolCatchment ?? addr?.PrimarySchoolCatchment ?? null;
  const secondaryCatchment = addr?.SecondarySchoolCatchment ?? null;
  const shoppingDist = id?.shoppingCentreDistanceKm != null ? String(id.shoppingCentreDistanceKm) : null;
  const locationRow = locationsTableSchema.omit({ propertyId: true }).parse({
    primarySchoolCatchment: schoolCatchment,
    secondarySchoolCatchment: secondaryCatchment,
    primarySchoolProximity: null,
    secondarySchoolProximity: null,
    shoppingCentre: id?.shoppingCentre ?? null,
    shoppingCentreDistanceKm: shoppingDist,
  });

  return { property: propertyRow, features: featuresRow, location: locationRow };
}
