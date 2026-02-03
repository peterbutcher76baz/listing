import { PropertySchema } from "../src/schemas/property.schema";

describe("RESO 2.0 Compliance", () => {
  it("PropertySchema structure must not drift from RESO 2.0 baseline", () => {
    // This captures the 'contract' the AI must follow.
    // If the AI renames 'BedroomsTotal' to 'beds', this test fails.
    expect(PropertySchema.shape).toMatchSnapshot();
  });
});
