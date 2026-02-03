// src/schemas/characteristics.schema.ts
export const ImprovementsSchema = z.object({
  LivingArea: z.number().positive().optional(), 
  YearBuilt: z.number().int().optional(),
  BedroomsTotal: z.number().int().nonnegative().optional(),
  BathroomsFull: z.number().int().nonnegative().optional(),
  CarportSpaces: z.number().int().nonnegative().optional(),
  Stories: z.number().int().positive().optional(),
  ConstructionMaterials: z.array(z.string()).optional() // RESO uses collections
});

export const LandSchema = z.object({
  LotSizeSquareFeet: z.number().positive().optional(),
  LotDimensions: z.string().optional(),
  Topography: z.enum(["Flat", "Sloping", "Steep"]).optional()
});


// src/schemas/characteristics.schema.ts
const SQFT_TO_SQM = 0.092903;

export const LandSchema = z.object({
  LotSizeSquareFeet: z.number().positive().optional(),
}).extend({
  // Use a 'transform' to automatically provide Sqm
  LotSizeSquareMeters: z.number().optional().default(0)
}).refine((data) => {
  // Logic: If we have Feet but no Meters, calculate it
  if (data.LotSizeSquareFeet && !data.LotSizeSquareMeters) {
    data.LotSizeSquareMeters = data.LotSizeSquareFeet * SQFT_TO_SQM;
  }
  return true;
});
