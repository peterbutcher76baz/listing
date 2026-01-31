import { z } from "zod";
import { AddressSchema } from "./location.schema";

const ImprovementsSchema = z.object({
  BedroomsTotal: z.number().int().nonnegative().optional(),
  BathroomsFull: z.number().int().nonnegative().optional(),
  LivingArea: z.number().positive().optional(), // RESO 2.0: Living Area (sqft)
}).strict().optional();

const LandSchema = z.object({
  LotSizeSquareFeet: z.number().positive().optional(),
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
