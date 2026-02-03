"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertySchema, Property } from "@/schemas/property.schema";

export default function DataEntryPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Property>({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      source: "Manual",
      dataConfidence: 5,
      createdAt: new Date(),
      propertyId: "",
      address: {
        StreetNumber: "",
        StreetName: "",
        City: "",
        StateOrProvince: "",
        PostalCode: "",
        Country: "AU",
      },
      improvements: {},
      land: {},
    },
  });

  const onSubmit = (data: Property) => {
    console.log("RESO 2.0 Validated Data:", data);
    // Here you would call your Drizzle service to save to the DB
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Listing Entry</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Info Section */}
        <section className="p-4 border rounded-md">
          <h2 className="font-semibold mb-3">Address (RESO 2.0)</h2>
          <div className="grid grid-cols-2 gap-4">
            <input {...register("address.StreetNumber")} placeholder="Street Number" className="border p-2" />
            <input {...register("address.StreetName")} placeholder="Street Name" className="border p-2" />
          </div>
          {errors.address?.StreetName && <p className="text-red-500 text-xs mt-1">{errors.address.StreetName.message}</p>}
        </section>

        {/* Improvements Section - Note: User inputs SqM, we handle conversion later */}
        <section className="p-4 border rounded-md">
          <h2 className="font-semibold mb-3">Property Features</h2>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" {...register("improvements.BedroomsTotal", { valueAsNumber: true })} placeholder="Beds" className="border p-2" />
            <input type="number" {...register("improvements.BathroomsFull", { valueAsNumber: true })} placeholder="Baths" className="border p-2" />
            <input type="number" {...register("improvements.LivingArea", { valueAsNumber: true })} placeholder="Living Area (sqft)" className="border p-2" />
          </div>
        </section>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Generate Listing Report
        </button>
      </form>
    </div>
  );
}
