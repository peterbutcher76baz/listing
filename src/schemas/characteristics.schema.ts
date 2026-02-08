// src/schemas/characteristics.schema.ts
// Australian market: areas in square metres (m²) only. No square foot references.
import { z } from "zod";

export const ImprovementsSchema = z.object({
  LivingArea: z.number().positive().optional(),
  YearBuilt: z.number().int().optional(),
  BedroomsTotal: z.number().int().min(0).optional(),
  BathroomsFull: z.number().int().min(0).optional(),
  CarportSpaces: z.number().int().min(0).optional(),
  Stories: z.number().int().positive().optional(),
  ConstructionMaterials: z.array(z.string()).optional(),
});

export const LandSchema = z.object({
  LotSizeSquareMeters: z.number().positive().optional(),
  LotDimensions: z.string().optional(),
  Topography: z.enum(["Flat", "Sloping", "Steep"]).optional(),
});
