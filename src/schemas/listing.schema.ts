import { z } from "zod";

/**
 * Based on RESO Data Dictionary v2.0 - Property Resource
 * This schema is LOCKED. AI must not add custom fields without 
 * checking the RESO Wiki first.
 */
export const listingSchema = z.object({
  // RESO Standard Field: ListingId
  ListingId: z.string().describe("The unique identifier for the listing."),
  
  // RESO Standard Field: ListPrice
  ListPrice: z.number().positive().describe("The current price of the property."),
  
  // RESO Standard Field: BedRoomsTotal
  BedroomsTotal: z.number().int().min(0).optional(),
  
  // RESO Standard Field: BathroomsFull
  BathroomsFull: z.number().int().min(0).optional(),
  
  // RESO Standard Field: StandardStatus (Enumeration)
  StandardStatus: z.enum([
    "Active", "Active Under Contract", "Canceled", 
    "Closed", "Expired", "Pending", "Withdrawn"
  ]),

  ModificationTimestamp: z.string().datetime().describe("Last time the record was changed."),
}).strict(); // .strict() ensures the AI doesn't hallucinate extra fields.

export type Listing = z.infer<typeof listingSchema>;
