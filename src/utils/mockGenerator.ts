import { PropertySchema } from "../src/schemas/property.schema";

export const generateMockProperty = (id: string) => {
  const mockData = {
    propertyId: id,
    address: {
      StreetNumber: "101",
      StreetName: "Collins St",
      City: "Melbourne",
      StateOrProvince: "VIC",
      PostalCode: "3000",
      Country: "AU",
      Latitude: -37.814,
      Longitude: 144.963
    },
    propertyType: "House",
    tenure: "Freehold",
    land: {
      LotSizeSquareMeters: 600,
    },
    improvements: {
      LivingArea: 200,
      BedroomsTotal: 3,
      BathroomsFull: 2,
      CarportSpaces: 2,
      YearBuilt: 2015
    },
    source: "RESO",
    dataConfidence: 5,
    createdAt: new Date(),
    lastUpdated: new Date()
  };

  return PropertySchema.parse(mockData);
};
