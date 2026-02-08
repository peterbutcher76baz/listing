import { z } from "zod";
import { AddressSchema } from "./location.schema";

const ImprovementsSchema = z.object({
  BedroomsTotal: z.number().int().min(0, "Bedrooms cannot be less than 0").optional(),
  BathroomsFull: z.number().int().min(0, "Bathrooms cannot be less than 0").optional(),
  LivingArea: z.number().positive().optional(), // Living area (m²), Australian market
}).strict().optional();

const LandSchema = z.object({
  LotSizeSquareMeters: z.number().positive().optional(),
}).strict().optional();

export const propertySchema = z.object({
  propertyId: z.string(),
  lastSalePrice: z.number().optional(),
  address: AddressSchema,
  improvements: ImprovementsSchema,
  land: LandSchema,
  source: z.string().optional(),
  dataConfidence: z.number().min(0).max(10).optional(),
  createdAt: z.date().optional(),
}).strict();

export const PropertySchema = propertySchema;
export type Property = z.infer<typeof propertySchema>;
