import { listingSchema } from "../src/schemas/listing.schema";

describe("Schema Snapshot", () => {
  it("listing schema structure must match the RESO v2.0 baseline", () => {
    // This will create a __snapshots__ folder. 
    // If you intentionally change the schema, run 'npm test -- -u' to update.
    expect(listingSchema.shape).toMatchSnapshot();
  });
});
