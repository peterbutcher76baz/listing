import { Property } from "../schemas/property.schema";
import { formatArea, formatAUD } from "../utils/conversions";

interface Props {
  property: Property;
}

export const PropertyReport = ({ property }: Props) => {
  // At this point, 'property' has been through Zod and is 100% valid.
  
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg border-t-4 border-blue-600">
      <header className="flex justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Listing Report</h1>
          <p className="text-gray-500">RESO 2.0 Standardized Data</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{formatAUD(property.lastSalePrice)}</p>
          <p className="text-sm text-gray-400">ID: {property.propertyId}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-2">Location</h2>
          <p>{property.address.StreetNumber} {property.address.StreetName}</p>
          <p>{property.address.City}, {property.address.StateOrProvince} {property.address.PostalCode}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-bold mb-2">Key Specs</h2>
          <ul className="space-y-1 text-sm">
            <li>Bedrooms: {property.improvements?.BedroomsTotal ?? 'N/A'}</li>
            <li>Bathrooms: {property.improvements?.BathroomsFull ?? 'N/A'}</li>
            <li>Land Area: {formatArea(property.land?.LotSizeSquareFeet)}</li>
          </ul>
        </div>
      </section>

      <footer className="mt-12 pt-4 border-t text-[10px] text-gray-400">
        Certified RESO 2.0 Data Report • Generated {new Date().toLocaleDateString('en-AU')}
      </footer>
    </div>
  );
};
