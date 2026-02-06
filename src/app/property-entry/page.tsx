"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import DashboardShell from "@/components/layout/dashboard-shell";
import { PropertySchema, Property } from "@/schemas/property.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyEntry } from "@/contexts/listing-context";

export default function PropertyEntryPage() {
  const { setProperty } = usePropertyEntry();

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

  const onSubmit = useCallback(
    (data: Property) => {
      setProperty(data);
    },
    [setProperty]
  );

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              Property Entry
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              RESO-compliant property data. Factual only — no style or voice.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-card-foreground font-sans">
                Address (RESO 2.0)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.StreetNumber")}
                  placeholder="Street Number"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
                <input
                  {...register("address.StreetName")}
                  placeholder="Street Name"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.City")}
                  placeholder="City"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
                <input
                  {...register("address.StateOrProvince")}
                  placeholder="State / Province"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.PostalCode")}
                  placeholder="Postal Code"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
                <input
                  {...register("address.Country")}
                  placeholder="Country"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>
              {errors.address?.StreetName && (
                <p className="text-destructive text-xs mt-1 font-sans">
                  {errors.address.StreetName.message}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-card-foreground font-sans">
                Property Features
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  min={0}
                  {...register("improvements.BedroomsTotal", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Beds"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
                <input
                  type="number"
                  min={0}
                  {...register("improvements.BathroomsFull", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Baths"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
                <input
                  type="number"
                  min={0}
                  {...register("improvements.LivingArea", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Living Area (sqm)"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              className="h-[48px] w-[200px] rounded-md bg-[#003366] font-sans font-medium text-white hover:bg-[#003366]/90"
            >
              Save property
            </Button>
            <Link href="/dataentry">
              <Button
                type="button"
                variant="outline"
                className="h-[48px] w-[200px] rounded-md border-2 border-[#003366] bg-transparent font-sans font-medium text-[#003366] hover:bg-[#003366]/5"
              >
                Go to Listing Generator
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
