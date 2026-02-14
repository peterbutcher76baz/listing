"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import { PropertySchema, Property, PropertyFormInput } from "@/schemas/property.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyStore, useStoreHydrated } from "@/store/usestore";

const HYDRATION_TIMEOUT_MS = 50;

export default function PropertyEntryPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const propertyData = usePropertyStore((s) => s.propertyData);
  const setPropertyData = usePropertyStore((s) => s.setPropertyData);
  const clearAll = usePropertyStore((s) => s.clearAll);
  const [saveNotification, setSaveNotification] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const didHydrateFormFromStore = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setHydrationTimeout(true), HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mounted]);

  const defaultFormValues: PropertyFormInput = {
    source: "Manual",
    dataConfidence: 5,
    createdAt: new Date(),
    propertyId: "",
    OfficialBrand: "Place P",
    address: {
      StreetNumber: "",
      StreetName: "",
      City: "",
      StateOrProvince: "",
      PostalCode: "",
      Country: "AU",
    },
    improvements: {
      GarageCount: 0,
      CarportCount: 0,
      WorkshopAlcove: false,
      StandaloneShed: false,
      StandaloneShedBays: 0,
    },
    land: {},
  };

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<PropertyFormInput>({
    resolver: zodResolver(PropertySchema),
    defaultValues: defaultFormValues,
  });

  const garageCount = watch("improvements.GarageCount") ?? 0;
  const carportCount = watch("improvements.CarportCount") ?? 0;
  const totalCarSpaces = garageCount + carportCount;
  const workshopAlcove = watch("improvements.WorkshopAlcove") ?? false;
  const standaloneShed = watch("improvements.StandaloneShed") ?? false;
  const standaloneShedBays = watch("improvements.StandaloneShedBays") ?? 0;
  /** Total lock-up garages beyond SLUG/DLUG (0 when garageCount is 0, 1, or 2). */
  const totalBeyondSlugDlug = Math.max(0, garageCount - 2);

  /** Save to Zustand store and show notification. zodResolver passes transformed Property. */
  const onSubmit = useCallback(
    (data: Property) => {
      setPropertyData(data);
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    },
    [setPropertyData]
  );

  /** Save to Zustand store and navigate to Listing Generator. zodResolver passes transformed Property. */
  const onSaveAndGoToGenerator = useCallback(
    (data: Property) => {
      setPropertyData(data);
      router.push("/listing-generator");
    },
    [setPropertyData, router]
  );

  /** Clears both the Zustand store (and persisted vault) and all UI fields for a blank slate. */
  const handleClearForm = useCallback(() => {
    clearAll();
    reset(defaultFormValues);
  }, [clearAll, reset]);

  const canRender = mounted && (hydrated || hydrationTimeout);

  /** Hydrate form from persisted store once per mount so data does not disappear when navigating back. No auto-clear on load. */
  useEffect(() => {
    if (!canRender || didHydrateFormFromStore.current || !propertyData) return;
    const { ParkingCount, parkingMetadata, ...rest } = propertyData;
    const dataToReset =
      rest.createdAt && typeof rest.createdAt === "string"
        ? { ...rest, createdAt: new Date(rest.createdAt) }
        : rest;
    reset(dataToReset as PropertyFormInput);
    didHydrateFormFromStore.current = true;
  }, [canRender, propertyData, reset]);

  if (!canRender) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-2xl flex items-center justify-center py-12 text-muted-foreground font-sans text-sm">
          Loading…
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
                Property Entry
              </h1>
              <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
                RESO-compliant property data. Factual only — no style or voice.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearForm}
              className="shrink-0 rounded-md border border-primary-foreground/30 bg-transparent px-3 py-2 text-sm font-sans font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
            >
              Clear form
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSubmit((d) => onSubmit(d as Property))}
          className="mt-6 space-y-6"
          noValidate
        >
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
              {errors.address?.PostalCode && (
                <p className="text-destructive text-xs mt-1 font-sans">
                  {errors.address.PostalCode.message}
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
                  placeholder="Living area (m²)"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-card-foreground font-sans">
                Garage, Car Ports and Workshops
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-4">
              <input
                type="hidden"
                {...register("improvements.GarageCount", {
                  setValueAs: (v) => (v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
                })}
              />
              <input
                type="hidden"
                {...register("improvements.CarportCount", {
                  setValueAs: (v) => (v === "" || Number.isNaN(Number(v)) ? 0 : Number(v)),
                })}
              />
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground font-sans w-full sm:w-auto">Lock-up garages</span>
                <div className="flex gap-2">
                  <div className="group relative inline-block">
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span
                        aria-hidden
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#003366] -mb-[5px]"
                      />
                      <span className="whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg">
                        Single Lock Up Garage
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("improvements.GarageCount", 1, { shouldValidate: true })}
                      className={`h-10 min-w-[88px] rounded-md border-2 font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 ${
                        garageCount === 1
                          ? "bg-[#003366] border-[#003366] text-white"
                          : "border-[#003366] bg-transparent text-[#003366] hover:bg-[#003366]/10"
                      }`}
                    >
                      SLUG
                    </button>
                  </div>
                  <div className="group relative inline-block">
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span
                        aria-hidden
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#003366] -mb-[5px]"
                      />
                      <span className="whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg">
                        Double Lock Up Garage
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setValue("improvements.GarageCount", 2, { shouldValidate: true })}
                      className={`h-10 min-w-[88px] rounded-md border-2 font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 ${
                        garageCount === 2
                          ? "bg-[#003366] border-[#003366] text-white"
                          : "border-[#003366] bg-transparent text-[#003366] hover:bg-[#003366]/10"
                      }`}
                    >
                      DLUG
                    </button>
                  </div>
                </div>
              </div>
              {/* Total lock-up garages beyond SLUG/DLUG: from 0, left-aligned */}
              <div className="flex flex-wrap items-center gap-3 text-left">
                <span className="text-sm text-muted-foreground font-sans">Total lock-up garages (beyond SLUG/DLUG)</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setValue("improvements.GarageCount", Math.max(0, garageCount - 1), { shouldValidate: true })}
                    className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    aria-label="Decrease total lock-up garages beyond SLUG/DLUG"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-sans text-card-foreground" aria-live="polite">
                    {totalBeyondSlugDlug}
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue("improvements.GarageCount", garageCount + 1, { shouldValidate: true })}
                    className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    aria-label="Increase total lock-up garages beyond SLUG/DLUG"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground font-sans">Car port / covered spaces</span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setValue("improvements.CarportCount", Math.max(0, carportCount - 1), { shouldValidate: true })}
                    className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    aria-label="Decrease car port spaces"
                  >
                    −
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-sans text-card-foreground" aria-live="polite">
                    {carportCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue("improvements.CarportCount", carportCount + 1, { shouldValidate: true })}
                    className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    aria-label="Increase car port spaces"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Workshop alcove: internal workshop/storage with main garage */}
              <div className="flex flex-wrap items-center gap-3 text-left">
                <div className="group relative inline-block">
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#003366] -mb-[5px]" aria-hidden />
                    <span className="whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg">
                      Internal workshop or storage space associated with the main garage
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground font-sans">One workshop alcove</span>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("improvements.WorkshopAlcove", !workshopAlcove, { shouldValidate: true })}
                  className={`h-10 min-w-[88px] rounded-md border-2 font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 ${
                    workshopAlcove ? "bg-[#003366] border-[#003366] text-white" : "border-[#003366] bg-transparent text-[#003366] hover:bg-[#003366]/10"
                  }`}
                >
                  {workshopAlcove ? "Yes" : "No"}
                </button>
              </div>
              {/* Standalone shed: detached shed/workshop + bays counter on new line when on */}
              <div className="flex flex-col items-start gap-3 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="group relative inline-block">
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#003366] -mb-[5px]" aria-hidden />
                      <span className="whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg">
                        Detached shed or workshop
                      </span>
                    </span>
                    <span className="text-sm text-muted-foreground font-sans">Standalone shed</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("improvements.StandaloneShed", !standaloneShed, { shouldValidate: true })}
                    className={`h-10 min-w-[88px] rounded-md border-2 font-sans font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 ${
                      standaloneShed ? "bg-[#003366] border-[#003366] text-white" : "border-[#003366] bg-transparent text-[#003366] hover:bg-[#003366]/10"
                    }`}
                  >
                    {standaloneShed ? "Yes" : "No"}
                  </button>
                </div>
                {standaloneShed && (
                  <div className="flex flex-wrap items-center gap-3 w-full">
                    <span className="text-sm text-muted-foreground font-sans">Number of bays</span>
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-1">
                      <button
                        type="button"
                        onClick={() => setValue("improvements.StandaloneShedBays", Math.max(0, standaloneShedBays - 1), { shouldValidate: true })}
                        className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        aria-label="Decrease shed bays"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5rem] text-center text-sm font-sans text-card-foreground" aria-live="polite">
                        {standaloneShedBays}
                      </span>
                      <button
                        type="button"
                        onClick={() => setValue("improvements.StandaloneShedBays", standaloneShedBays + 1, { shouldValidate: true })}
                        className="h-8 w-8 rounded border border-[#003366] bg-transparent text-[#003366] font-sans font-medium hover:bg-[#003366]/10 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        aria-label="Increase shed bays"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm font-sans text-muted-foreground pt-1 border-t border-border">
                {totalCarSpaces === 0 ? (
                  "No covered parking"
                ) : (
                  <>Total car spaces: <span className="font-semibold text-[#003366]">{totalCarSpaces}</span></>
                )}
              </p>
            </CardContent>
          </Card>

          {saveNotification && (
            <div
              role="status"
              className="rounded-md border border-[#003366] bg-[#003366]/10 px-4 py-2 text-sm font-sans text-[#003366]"
            >
              Data saved.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              className="h-[48px] w-[200px] rounded-md bg-[#003366] font-sans font-medium text-white hover:bg-[#003366]/90"
            >
              Save property
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((d) => onSaveAndGoToGenerator(d as Property))}
              className="h-[48px] w-[200px] rounded-md border-2 border-[#003366] bg-transparent font-sans font-medium text-[#003366] hover:bg-[#003366]/5"
            >
              Go to Listing Generator
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
