// src/schemas/location.schema.ts
import { z } from "zod";

export const AddressSchema = z.object({
  StreetNumber: z.string(),
  StreetName: z.string().min(1, "Street name is required"),
  UnitNumber: z.string().optional(),
  City: z.string().min(1, "City is required"),
  StateOrProvince: z.string(),
  PostalCode: z.string(),
  Country: z.string(),
  Latitude: z.number().optional(),
  Longitude: z.number().optional()
});

export const ZoningSchema = z.object({
  Zoning: z.string().optional().describe("RESO 2.0: The local zoning code"),
  ZoningDescription: z.string().optional(),
  HeritageOverlayYN: z.boolean().optional(), // Standard RESO Boolean suffix
  FloodZone: z.string().optional()
});
