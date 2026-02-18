// src/schemas/location.schema.ts
import { z } from "zod";

export const AddressSchema = z.object({
  StreetNumber: z.string(),
  StreetName: z.string().min(1, "Street name is required"),
  UnitNumber: z.string().optional(),
  City: z.string().min(1, "City is required"),
  StateOrProvince: z.string(),
  /** Australian market: 4-digit postcode (e.g. 3000). When provided, must be exactly 4 digits. */
  PostalCode: z
    .string()
    .refine((val) => !val || /^\d{4}$/.test(String(val).trim()), { message: "Postal code must be 4 digits" }),
  Country: z.string(),
  Latitude: z.number().optional(),
  Longitude: z.number().optional(),
  /** RESO 2.0 / location module: primary school catchment (e.g. school name or zone). */
  PrimarySchoolCatchment: z.string().optional(),
  /** RESO 2.0 / location module: secondary school catchment. */
  SecondarySchoolCatchment: z.string().optional(),
});

export const ZoningSchema = z.object({
  Zoning: z.string().optional().describe("RESO 2.0: The local zoning code"),
  ZoningDescription: z.string().optional(),
  HeritageOverlayYN: z.boolean().optional(), // Standard RESO Boolean suffix
  FloodZone: z.string().optional()
});

/** Locations table (3NF): school catchment, proximity, shopping. */
export const locationsTableSchema = z.object({
  id: z.string().uuid().optional(),
  propertyId: z.string().uuid(),
  primarySchoolCatchment: z.string().nullable().optional(),
  secondarySchoolCatchment: z.string().nullable().optional(),
  primarySchoolProximity: z.string().nullable().optional(),
  secondarySchoolProximity: z.string().nullable().optional(),
  shoppingCentre: z.string().nullable().optional(),
  shoppingCentreDistanceKm: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).strict();

export type LocationsTableRow = z.infer<typeof locationsTableSchema>;
