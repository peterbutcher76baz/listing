"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, MapPin, Clipboard, GraduationCap, BedDouble, Bath, Car, Ruler, Sparkles, FileText } from "lucide-react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { PropertySchema, Property, PropertyFormInput } from "@/schemas/property.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePropertyStore, useStoreHydrated } from "@/store/usestore";
import { sniffIds, fetchStateData } from "@/lib/importers/identitySniffer";

const HYDRATION_TIMEOUT_MS = 50;

/** Default reference listing text for agent voice training (Place-branded sample). */
const NUMIA_PLACE_TEXT =
  "Nestled in a sought-after location, this property offers the perfect blend of comfort and convenience. Ideally positioned close to schools, shopping, and transport, it presents an exceptional opportunity for families and professionals alike.";

/** Build a property narrative from property data and reference voice. Placeholder until AI integration. */
function buildPropertyNarrative(
  addressLine: string,
  bedrooms: number,
  bathrooms: number,
  keyFeatures: string[],
  schoolCatchment: string,
  referenceText: string,
  livingAreaSqm?: number,
  landAreaSqm?: number
): string {
  const suburb = addressLine.split(",").map((s) => s.trim())[1] ?? "";
  const paragraphs: string[] = [];

  // 1. Bold all-caps headline: "STUNNING OPPORTUNITY IN [SUBURB]"
  const headline = suburb
    ? `STUNNING OPPORTUNITY IN ${suburb.toUpperCase()}`
    : "STUNNING OPPORTUNITY";
  paragraphs.push(headline);

  // 2. Paragraph 1: property DNA (bed/bath/area) and general lifestyle appeal
  const specs: string[] = [];
  if (bedrooms > 0) specs.push(`${bedrooms} bedroom${bedrooms !== 1 ? "s" : ""}`);
  if (bathrooms > 0) specs.push(`${bathrooms} bathroom${bathrooms !== 1 ? "s" : ""}`);
  if (livingAreaSqm && livingAreaSqm > 0) specs.push(`${livingAreaSqm} m² living`);
  if (landAreaSqm && landAreaSqm > 0) specs.push(`${landAreaSqm} m² land`);

  const dnaSentence = specs.length
    ? `This ${specs.join(" and ")} home${suburb ? ` in ${suburb}` : ""} presents an exceptional opportunity for families and professionals alike.`
    : suburb
      ? `This sought-after property in ${suburb} presents an exceptional opportunity for families and professionals alike.`
      : "This property presents an exceptional opportunity for families and professionals alike.";
  paragraphs.push(dnaSentence);

  // 3. Paragraph 2: benefit-driven — lifestyle essentials + school catchment integration
  const parts: string[] = [];
  if (keyFeatures.length) {
    const featureList = keyFeatures.slice(0, 4).join(", ");
    const more = keyFeatures.length > 4 ? " and more" : "";
    parts.push(`The lifestyle is further enhanced by essential features including ${featureList}${more}.`);
  }
  if (schoolCatchment?.trim()) {
    const firstSchool = schoolCatchment.split(",").map((s) => s.trim()).filter(Boolean)[0] ?? schoolCatchment.trim();
    parts.push(`Positioned perfectly within the ${firstSchool} catchment, this home is ideal for growing families!`);
  }
  if (parts.length) paragraphs.push(parts.join(" "));

  // 4. Professional closer
  paragraphs.push(
    "A rare find in the current market. Contact Agent today to arrange your inspection."
  );

  return paragraphs.join("\n\n");
}

/** Key features checklist options (saved in store for final report). */
const KEY_FEATURES_LIST = [
  "Solar Power",
  "Swimming pool",
  "Air conditioning",
  "Side access",
  "Fully fenced",
  "Outdoor entertaining",
  "Renovated kitchen",
  "Granny flat potential",
] as const;

export default function PropertyEntryPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const propertyData = usePropertyStore((s) => s.propertyData);
  const setPropertyData = usePropertyStore((s) => s.setPropertyData);
  const mergeIdentity = usePropertyStore((s) => s.mergeIdentity);
  const clearAll = usePropertyStore((s) => s.clearAll);
  const agentVoiceReference = usePropertyStore((s) => s.agentVoiceReference);
  const setAgentVoiceReference = usePropertyStore((s) => s.setAgentVoiceReference);
  const propertyNarrative = usePropertyStore((s) => s.propertyNarrative);
  const setPropertyNarrative = usePropertyStore((s) => s.setPropertyNarrative);
  const [saveNotification, setSaveNotification] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const [glowRea, setGlowRea] = useState(false);
  const [glowDomain, setGlowDomain] = useState(false);
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

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm<PropertyFormInput>({
    resolver: zodResolver(PropertySchema),
    defaultValues: defaultFormValues,
  });

  const streetNumber = watch("address.StreetNumber") ?? "";
  const streetName = watch("address.StreetName") ?? "";
  const city = watch("address.City") ?? "";
  const stateOrProvince = watch("address.StateOrProvince") ?? "";
  const postalCode = watch("address.PostalCode") ?? "";
  const garageCount = watch("improvements.GarageCount") ?? 0;
  const carportCount = watch("improvements.CarportCount") ?? 0;
  const totalCarSpaces = garageCount + carportCount;
  const bedrooms = watch("improvements.BedroomsTotal") ?? 0;
  const bathrooms = watch("improvements.BathroomsFull") ?? 0;
  const livingAreaSqm = watch("improvements.LivingArea");
  const landAreaSqm = watch("land.LotSizeSquareMeters");

  /** Expand street abbreviations for exact search (e.g. St → Street) so QLD GLOBE returns one result. */
  const expandStreetSuffix = useCallback((name: string): string => {
    if (!name?.trim()) return name ?? "";
    const trimmed = name.trim();
    const suffixMap: Record<string, string> = {
      " St ": " Street ", " St.": " Street", " St": " Street",
      " Rd ": " Road ", " Rd.": " Road", " Rd": " Road",
      " Ave ": " Avenue ", " Ave.": " Avenue", " Ave": " Avenue",
      " Dr ": " Drive ", " Dr.": " Drive", " Dr": " Drive",
      " Pl ": " Place ", " Pl.": " Place", " Pl": " Place",
      " Ct ": " Court ", " Ct.": " Court", " Ct": " Court",
      " Pde ": " Parade ", " Pde.": " Parade", " Pde": " Parade",
      " Crs ": " Crescent ", " Crs.": " Crescent", " Crs": " Crescent",
      " Tce ": " Terrace ", " Tce.": " Terrace", " Tce": " Terrace",
      " Pkwy ": " Parkway ", " Pkwy.": " Parkway", " Pkwy": " Parkway",
      " Hwy ": " Highway ", " Hwy.": " Highway", " Hwy": " Highway",
      " Cct ": " Circuit ", " Cct.": " Circuit", " Cct": " Circuit",
      " Cl ": " Close ", " Cl.": " Close", " Cl": " Close",
      " Bvd ": " Boulevard ", " Bvd.": " Boulevard", " Bvd": " Boulevard",
    };
    let out = ` ${trimmed} `;
    for (const [abbr, full] of Object.entries(suffixMap)) {
      out = out.replace(new RegExp(abbr.replace(".", "\\."), "gi"), full);
    }
    return out.trim();
  }, []);

  /** Exact address for map search: number + street name (expanded) + suburb — reduces multiple pins. */
  const getExactAddressForSearch = useCallback(() => {
    const num = (streetNumber ?? "").toString().trim();
    const street = expandStreetSuffix((streetName ?? "").toString());
    const suburb = (city ?? "").toString().trim();
    const parts = [num, street, suburb].filter(Boolean);
    return parts.join(" ") || "";
  }, [streetNumber, streetName, city, expandStreetSuffix]);

  /** Build single-line address from form for clipboard / QLD GLOBE. */
  const getCurrentAddressLine = useCallback(() => {
    const parts = [streetNumber, streetName, city, stateOrProvince, postalCode].filter(Boolean);
    return parts.join(", ") || "";
  }, [streetNumber, streetName, city, stateOrProvince, postalCode]);

  const toastStyle = {
    backgroundColor: "#E3F2FD",
    color: "#1e293b",
    border: "1px solid #1565C0",
  } as const;

  /** Copy exact address, show toast, open QLD Globe. Format: number + street + suburb for top result. */
  const handleQldGlobe = useCallback(async () => {
    const address = getExactAddressForSearch();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success("Search ready, exact address copied. Click search • Paste • Select the top result.", {
          icon: <MapPin className="size-5 shrink-0" />,
          style: toastStyle,
        });
      } catch {
        toast.error("Could not copy address");
      }
    } else {
      toast.info("Enter street number, street name and suburb first, then use QLD GLOBE.");
    }
    window.open("https://qldglobe.information.qld.gov.au/", "_blank", "noopener,noreferrer");
  }, [getExactAddressForSearch]);

  /** BCC toast: 8s, clipboard icon, pale blue + deep navy. Shown when BCC Dev.i or City Plan need manual paste. */
  const bccToastStyle = {
    backgroundColor: "#E3F2FD",
    color: "#003366",
    border: "1px solid #1565C0",
  } as const;
  const bccToastMessage =
    "Address copied to clipboard. Once the BCC page loads, click the search bar and press Cmd+V or Ctrl+V.";

  /** Copy exact address, show toast (8s), open BCC Development.i for development applications. */
  const handleBccDevelopmenti = useCallback(async () => {
    const address = getExactAddressForSearch();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success(bccToastMessage, {
          duration: 8000,
          icon: <Clipboard className="size-5 shrink-0" />,
          style: bccToastStyle,
        });
      } catch {
        toast.error("Could not copy address");
      }
    } else {
      toast.info("Enter street number, street name and suburb first.");
    }
    window.open("https://developmenti.brisbane.qld.gov.au/", "_blank", "noopener,noreferrer");
  }, [getExactAddressForSearch]);

  const EDMAP_URL = "https://www.qgso.qld.gov.au/maps/edmap/";
  /** Copy address → pale blue/navy toast 8s → wait 3s → open QGSO Edmap. User: click Search → paste → confirm school catchments. */
  const handleCheckCatchmentEdmap = useCallback(async () => {
    const address = getCurrentAddressLine();
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.success("Address copied. In 3 seconds Edmap will open — then click Search, paste, and confirm school catchments.", {
          duration: 8000,
          icon: <Clipboard className="size-5 shrink-0" />,
          style: { backgroundColor: "#E3F2FD", color: "#003366", border: "1px solid #1565C0" },
        });
        setTimeout(() => {
          window.open(EDMAP_URL, "_blank", "noopener,noreferrer");
        }, 3000);
      } catch {
        toast.error("Could not copy address");
      }
    } else {
      toast.info("Enter address first, then use Check Catchment Edmap.");
    }
  }, [getCurrentAddressLine]);

  /** Generate AI narrative from property data and agent voice reference; output flows to Property Narrative. */
  const handleGenerateNarrative = useCallback(() => {
    const addressLine = [streetNumber, streetName, city, stateOrProvince, postalCode].filter(Boolean).join(", ");
    const narrative = buildPropertyNarrative(
      addressLine,
      bedrooms ?? 0,
      bathrooms ?? 0,
      propertyData?.keyFeatures ?? [],
      propertyData?.identity?.schoolCatchment ?? "",
      agentVoiceReference ?? NUMIA_PLACE_TEXT,
      typeof livingAreaSqm === "number" ? livingAreaSqm : undefined,
      typeof landAreaSqm === "number" ? landAreaSqm : undefined
    );
    setPropertyNarrative(narrative);
    toast.success("Narrative generated. View in Listing Brief tab.", {
      icon: <Sparkles className="size-5 shrink-0" />,
      style: { backgroundColor: "#E3F2FD", color: "#003366", border: "1px solid #1565C0" },
    });
  }, [
    streetNumber,
    streetName,
    city,
    stateOrProvince,
    postalCode,
    bedrooms,
    bathrooms,
    livingAreaSqm,
    landAreaSqm,
    propertyData?.keyFeatures,
    propertyData?.identity?.schoolCatchment,
    agentVoiceReference,
    setPropertyNarrative,
  ]);

  /** Toggle a key feature in the store (array of selected labels). */
  const toggleKeyFeature = useCallback(
    (feature: string) => {
      const current = propertyData?.keyFeatures ?? [];
      const next = current.includes(feature)
        ? current.filter((f) => f !== feature)
        : [...current, feature];
      if (propertyData) {
        setPropertyData({ ...propertyData, keyFeatures: next });
      } else {
        const minimal: Property = {
          propertyId: "",
          createdAt: new Date(),
          address: { StreetNumber: "", StreetName: "", City: "", StateOrProvince: "", PostalCode: "", Country: "AU" },
          improvements: {},
          land: {},
          OfficialBrand: "Place P",
          identity: {},
          keyFeatures: next,
          ParkingCount: 0,
          parkingMetadata: { GarageCount: 0, CarportCount: 0 },
        };
        setPropertyData(minimal);
      }
    },
    [propertyData, setPropertyData]
  );

  /** Copy exact address, show toast (8s), open BCC City Plan. Same workflow as Dev.i. */
  const handleBccCityPlan = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      const address = getExactAddressForSearch();
      if (address) {
        try {
          await navigator.clipboard.writeText(address);
          toast.success(bccToastMessage, {
            duration: 8000,
            icon: <Clipboard className="size-5 shrink-0" />,
            style: bccToastStyle,
          });
        } catch {
          toast.error("Could not copy address");
        }
      } else {
        toast.info("Enter street number, street name and suburb first.");
      }
      window.open("https://cityplan.brisbane.qld.gov.au", "_blank", "noopener,noreferrer");
    },
    [getExactAddressForSearch]
  );
  const workshopAlcove = watch("improvements.WorkshopAlcove") ?? false;
  const standaloneShed = watch("improvements.StandaloneShed") ?? false;
  const standaloneShedBays = watch("improvements.StandaloneShedBays") ?? 0;
  /** Total lock-up garages beyond SLUG/DLUG (0 when garageCount is 0, 1, or 2). */
  const totalBeyondSlugDlug = Math.max(0, garageCount - 2);

  /** Save to Zustand store and show notification. Preserve identity vault (e.g. sniffed REA/Domain IDs). */
  const onSubmit = useCallback(
    (data: Property) => {
      setPropertyData({
        ...data,
        identity: data.identity ?? propertyData?.identity ?? undefined,
      });
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    },
    [setPropertyData, propertyData?.identity]
  );

  /** Save to Zustand store and navigate to Listing Generator. Preserve identity vault. */
  const onSaveAndGoToGenerator = useCallback(
    (data: Property) => {
      setPropertyData({
        ...data,
        identity: data.identity ?? propertyData?.identity ?? undefined,
      });
      router.push("/listing-generator");
    },
    [setPropertyData, propertyData?.identity, router]
  );

  /** Clears both the Zustand store (and persisted vault) and all UI fields for a blank slate. */
  const handleClearForm = useCallback(() => {
    clearAll();
    reset(defaultFormValues);
    setImportUrl("");
  }, [clearAll, reset]);

  /**
   * When REA or Domain listing API is available: capture property latitude and longitude here
   * (e.g. from listing geo data) and merge into identity for distance calculations (e.g. to
   * nearest major shopping centre). Example: mergeIdentity({ latitude: -27.5, longitude: 153.0 });
   */
  const runImportFromUrl = useCallback(
    (url: string) => {
      fetchStateData();
      const ids = sniffIds(url);
      if (!ids.reaGroupId && !ids.domainId) return;
      mergeIdentity({
        ...(ids.reaGroupId && { reaGroupId: ids.reaGroupId }),
        ...(ids.domainId && { domainId: ids.domainId }),
      });
      if (ids.reaGroupId) {
        const current = usePropertyStore.getState().propertyData;
        if (current) setPropertyData({ ...current, OfficialBrand: "Place" });
      }
      if (ids.reaGroupId) {
        setGlowRea(true);
        setTimeout(() => setGlowRea(false), 1000);
      }
      if (ids.domainId) {
        setGlowDomain(true);
        setTimeout(() => setGlowDomain(false), 1000);
      }
      const parts: string[] = [];
      if (ids.reaGroupId) parts.push("REA ID synced to vault");
      if (ids.domainId) parts.push("Domain ID synced to vault");
      const message = parts.length
        ? `Identity hook found. ${parts.join(". ")}.${ids.reaGroupId ? " Place." : ""}`
        : "";
      if (message)
        toast.success(message, {
          icon: <Building2 className="size-5 shrink-0" />,
          style: {
            backgroundColor: "#E3F2FD",
            color: "#1e293b",
            border: "1px solid #1565C0",
          },
        });
    },
    [mergeIdentity, setPropertyData]
  );

  /** Run on Import button or blur. */
  const handleImportFromUrl = useCallback(() => {
    runImportFromUrl(importUrl);
    setImportUrl("");
  }, [importUrl, runImportFromUrl]);

  /** Format lot/plan on blur: uppercase and normalize "5 on Sp123" → "5/Sp123". */
  const handleLotPlanBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = (e.target.value ?? "").trim();
      if (!raw) return;
      const withSlash = raw.replace(/\s+on\s+/gi, "/");
      const formatted = withSlash.toUpperCase();
      mergeIdentity({ lotPlanNumber: formatted });
    },
    [mergeIdentity]
  );

  /** Run immediately when user pastes into the quick import box. */
  const handlePasteImport = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      if (text?.trim()) {
        runImportFromUrl(text);
        setImportUrl(text);
      }
    },
    [runImportFromUrl]
  );

  /** Build summary string and copy to clipboard for CRM/email. Uses getState() and getValues() at click time so we always have the latest. */
  const handleCopySummary = useCallback(async () => {
    const store = usePropertyStore.getState();
    const data = store.propertyData;
    const identity = data?.identity;

    // Address: read form at click time (getValues) then fall back to store
    const formValues = getValues();
    const formAddr = formValues?.address;
    const formAddressLine = [
      formAddr?.StreetNumber,
      formAddr?.StreetName,
      formAddr?.City,
      formAddr?.StateOrProvince,
      formAddr?.PostalCode,
    ]
      .filter(Boolean)
      .map(String)
      .join(", ")
      .trim();
    const storeAddr = data?.address;
    const storeAddressLine = [
      storeAddr?.StreetNumber,
      storeAddr?.StreetName,
      storeAddr?.City,
      storeAddr?.StateOrProvince,
      storeAddr?.PostalCode,
    ]
      .filter(Boolean)
      .map(String)
      .join(", ")
      .trim();
    const address = (formAddressLine || storeAddressLine || "").trim();
    const addressDisplay = address || "-";

    // Identity: exact store field names (reaGroupId, domainId, lotPlanNumber). Use dash when empty for clean output.
    const reaID = (identity?.reaGroupId ?? "").toString().trim() || "-";
    const domainID = (identity?.domainId ?? "").toString().trim() || "-";
    const lotPlan = (identity?.lotPlanNumber ?? "").toString().trim() || "-";

    console.log("Current state: ", [address, reaID, domainID, lotPlan]);

    // Place professional style: address as plain text (no extra brackets), then REA, DOM, Lot. Empty = dash.
    const line = `${addressDisplay} | REA: ${reaID} | DOM: ${domainID} | Lot: ${lotPlan}`;
    try {
      await navigator.clipboard.writeText(line);
      toast.success("Summary copied to CRM/Email", {
        icon: <Clipboard className="size-5 shrink-0" />,
        style: {
          backgroundColor: "#E3F2FD",
          color: "#003366",
          border: "1px solid #1565C0",
        },
      });
    } catch {
      toast.error("Could not copy summary");
    }
  }, [getValues]);

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
      <div className="mx-auto w-full max-w-5xl">
        <header className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
          <div className="rounded-t-lg px-6 py-5 flex items-start justify-between gap-4 bg-[#E3F2FD]/30">
            <div>
              <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl text-[#003366]">
                Property Entry
              </h1>
              <p className="mt-1 text-sm font-normal text-[#455A64] font-sans">
                RESO-compliant property data. Factual only — no style or voice.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearForm}
              className="shrink-0 rounded-md border border-[#455A64] bg-transparent px-3 py-2 text-sm font-sans font-medium text-[#455A64] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#455A64]/40"
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
          <Tabs defaultValue="property-dna" className="w-full">
            <TabsList className="w-full justify-start gap-1 rounded-lg border border-border bg-[#E3F2FD]/30 p-1">
              <TabsTrigger value="property-dna" className="data-[state=active]:bg-[#E3F2FD] data-[state=active]:text-[#003366]">
                Property DNA
              </TabsTrigger>
              <TabsTrigger value="location-intel" className="data-[state=active]:bg-[#E3F2FD] data-[state=active]:text-[#003366]">
                Location Intel
              </TabsTrigger>
              <TabsTrigger value="voice-profile" className="data-[state=active]:bg-[#E3F2FD] data-[state=active]:text-[#003366]">
                Voice Profile
              </TabsTrigger>
              <TabsTrigger value="listing-brief" className="data-[state=active]:bg-[#E3F2FD] data-[state=active]:text-[#003366]">
                Listing Brief
              </TabsTrigger>
            </TabsList>

            <TabsContent value="property-dna" className="mt-4 space-y-6 max-w-2xl">
              <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-[2px] border-t-dashed border-t-[#FFD700]">
            <CardHeader className="rounded-t-lg border-b border-border bg-[#E3F2FD]/30 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-[#003366] font-sans">
                    Quick import
                  </CardTitle>
                  <p className="text-sm text-[#455A64] font-sans mt-1">
                    Paste a realestate.com.au or domain.com.au listing URL to fill REA ID and Domain ID into the identity vault.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopySummary}
                  className="shrink-0 rounded-md border border-[#003366]/30 bg-[#E3F2FD] text-[#003366] hover:bg-[#BBDEFB] font-sans font-medium text-sm"
                >
                  Copy summary
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-3">
              <div className="flex rounded-md border border-border bg-card focus-within:ring-2 focus-within:ring-[#003366] focus-within:border-[#003366] overflow-hidden">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onPaste={handlePasteImport}
                  onBlur={handleImportFromUrl}
                  placeholder="https://realestate.com.au/... or https://domain.com.au/..."
                  className="flex-1 min-w-0 border-0 rounded-none px-3 py-2 text-sm font-sans text-[#003366] bg-transparent focus:outline-none focus:ring-0 placeholder:text-[#455A64]"
                  aria-label="Paste listing URL to import IDs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportFromUrl}
                  className="shrink-0 rounded-none border-0 border-l border-border bg-[#E3F2FD] text-[#003366] hover:bg-[#BBDEFB] font-sans font-medium"
                >
                  Scan
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">REA ID</label>
                  <input
                    type="text"
                    value={propertyData?.identity?.reaGroupId ?? ""}
                    onChange={(e) => mergeIdentity({ reaGroupId: e.target.value || undefined })}
                    placeholder="—"
                    className={`w-full border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366] transition-shadow duration-300 ${glowRea ? "shadow-[0_0_0_2px_#2E7D32]" : "border-border"}`}
                    aria-label="REA Group ID"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Domain ID</label>
                  <input
                    type="text"
                    value={propertyData?.identity?.domainId ?? ""}
                    onChange={(e) => mergeIdentity({ domainId: e.target.value || undefined })}
                    placeholder="—"
                    className={`w-full border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366] transition-shadow duration-300 ${glowDomain ? "shadow-[0_0_0_2px_#2E7D32]" : "border-border"}`}
                    aria-label="Domain ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-[#003366] font-sans">
                Address (RESO 2.0)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.StreetNumber")}
                  placeholder="Street Number"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  {...register("address.StreetName")}
                  placeholder="Street Name"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.City")}
                  placeholder="City"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  {...register("address.StateOrProvince")}
                  placeholder="State / Province"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("address.PostalCode")}
                  placeholder="Postal Code"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  {...register("address.Country")}
                  placeholder="Country"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
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

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-[#003366] font-sans">
                Property Features
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <input
                  type="number"
                  min={0}
                  {...register("improvements.BedroomsTotal", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Beds"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  type="number"
                  min={0}
                  {...register("improvements.BathroomsFull", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Baths"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  type="number"
                  min={0}
                  {...register("improvements.LivingArea", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Living area (m²)"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <input
                  type="number"
                  min={0}
                  {...register("land.LotSizeSquareMeters", {
                    setValueAs: (v) =>
                      v === "" || Number.isNaN(Number(v)) ? undefined : Number(v),
                  })}
                  placeholder="Land (m²)"
                  className="border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-[#003366] font-sans">
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
            </TabsContent>

            <TabsContent value="location-intel" className="mt-4 space-y-6 max-w-2xl">
          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-[#003366] font-sans">
                Location intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-3">
                <div className="flex items-center gap-3 flex-nowrap">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Lot / plan number</label>
                  <input
                    type="text"
                    value={propertyData?.identity?.lotPlanNumber ?? ""}
                    onChange={(e) => mergeIdentity({ lotPlanNumber: e.target.value || undefined })}
                    onBlur={handleLotPlanBlur}
                    placeholder="e.g. 5 on Sp123 or 1/RP12345"
                    className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    aria-label="Lot plan number"
                  />
                </div>
                <div className="shrink-0 flex items-center gap-1.5 pt-6">
                  <span className="inline-flex rounded border-2 border-[#FFD700] bg-[#FFD700]/5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleQldGlobe}
                      className="border-0 bg-transparent text-[#003366] hover:bg-[#FFD700]/20 font-sans font-medium h-8 px-2.5 text-xs"
                    >
                      <MapPin className="mr-1 size-3.5" />
                      QLD GLOBE
                    </Button>
                  </span>
                  <span className="inline-flex rounded border-2 border-[#FFD700] bg-[#FFD700]/5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBccDevelopmenti}
                      className="border-0 bg-transparent text-[#003366] hover:bg-[#FFD700]/20 font-sans font-medium h-8 px-2.5 text-xs"
                    >
                      BCC Dev.i
                    </Button>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBccCityPlan}
                className="text-xs font-sans text-[#007BFF] hover:underline bg-transparent border-0 cursor-pointer p-0"
              >
                Brisbane City Plan →
              </button>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Zoning</label>
                <input
                  type="text"
                  value={propertyData?.identity?.zoning ?? ""}
                  onChange={(e) => mergeIdentity({ zoning: e.target.value || undefined })}
                  placeholder="e.g. Low density residential"
                  className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-card-foreground bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  aria-label="Zoning"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-base font-bold text-[#003366] font-sans mb-3">Community amenities</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">School catchment</label>
                      <input
                        type="text"
                        value={propertyData?.identity?.schoolCatchment ?? ""}
                        onChange={(e) => mergeIdentity({ schoolCatchment: e.target.value || undefined })}
                        placeholder="e.g. Polara State School, Forest Lake High School"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        aria-label="School catchment (comma-separated for multiple schools)"
                      />
                      <p className="text-[10px] text-[#455A64] font-sans mt-0.5">Multiple schools: separate with commas.</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCheckCatchmentEdmap}
                        className="border-2 border-[#FFD700] bg-transparent text-[#003366] hover:bg-[#FFD700]/20 font-sans font-medium h-8 px-2.5 text-xs"
                      >
                        Check Catchment Edmap
                      </Button>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Nearest major shopping centre</label>
                      <input
                        type="text"
                        value={propertyData?.identity?.shoppingCentre ?? ""}
                        onChange={(e) => mergeIdentity({ shoppingCentre: e.target.value || undefined })}
                        placeholder="e.g. Forest Lake Town Centre"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        aria-label="Nearest major shopping centre"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={propertyData?.identity?.shoppingCentreDistanceKm ?? ""}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            mergeIdentity({ shoppingCentreDistanceKm: v ? (Number(v) || v) : undefined });
                          }}
                          placeholder="Distance (km)"
                          className="w-24 border border-border rounded-md px-2 py-1.5 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                          aria-label="Distance to shopping centre in km"
                        />
                        <span className="text-[10px] text-[#455A64] font-sans">km</span>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#FFD700] bg-transparent text-[#003366] hover:bg-[#FFD700]/20 font-sans font-medium h-8 px-2.5 text-xs"
                      >
                        Scout location
                      </Button>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Public transport</label>
                      <input
                        type="text"
                        value={propertyData?.identity?.publicTransport ?? ""}
                        onChange={(e) => mergeIdentity({ publicTransport: e.target.value || undefined })}
                        placeholder="—"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        aria-label="Public transport"
                      />
                    </div>
                    <span className="inline-flex shrink-0 items-center pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-2 border-[#FFD700] bg-transparent text-[#003366] hover:bg-[#FFD700]/20 font-sans font-medium h-8 px-2.5 text-xs"
                      >
                        Scout location
                      </Button>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Suggested catchment</label>
                      <input
                        type="text"
                        readOnly
                        value={propertyData?.identity?.suggestedCatchment ?? ""}
                        placeholder="pending geodata"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none cursor-default"
                        aria-label="Suggested catchment (from future script)"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-[#455A64] font-sans block mb-1">Estimated drive to shops</label>
                      <input
                        type="text"
                        readOnly
                        value={propertyData?.identity?.estimatedDriveToShops ?? ""}
                        placeholder="pending geodata"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none cursor-default"
                        aria-label="Estimated drive to shops (from future script)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
            <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
              <CardTitle className="text-base font-bold text-[#003366] font-sans">
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="grid grid-cols-3 gap-4">
                {KEY_FEATURES_LIST.map((feature) => {
                  const selected = (propertyData?.keyFeatures ?? []).includes(feature);
                  return (
                    <label
                      key={feature}
                      className="flex items-center gap-2 cursor-pointer font-sans text-sm text-[#003366]"
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleKeyFeature(feature)}
                        className="size-4 rounded border-2 border-[#007BFF] bg-white text-[#007BFF] focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-0 accent-[#007BFF]"
                        aria-label={feature}
                      />
                      <span>{feature}</span>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="voice-profile" className="mt-4 space-y-6 max-w-2xl">
              <Card className="overflow-hidden rounded-lg border border-border bg-card shadow-sm border-t-2 border-t-[#007BFF]">
                <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
                  <CardTitle className="text-base font-bold text-[#003366] font-sans">
                    Agent voice training
                  </CardTitle>
                  <p className="text-sm text-[#455A64] font-sans mt-1">
                    Paste a reference listing to train the AI on your preferred tone and style.
                  </p>
                </CardHeader>
                <CardContent className="px-6 py-5 space-y-4">
                  {/* Persisted via zustand persist (agentVoiceReference) — survives navigation and refresh */}
                  <Textarea
                    value={agentVoiceReference ?? NUMIA_PLACE_TEXT}
                    onChange={(e) => setAgentVoiceReference(e.target.value || null)}
                    placeholder={NUMIA_PLACE_TEXT}
                    className="min-h-[200px] w-full border border-border rounded-md px-3 py-2 text-sm font-sans text-[#003366] bg-[#E3F2FD] focus:outline-none focus:ring-2 focus:ring-[#003366] resize-y"
                    aria-label="Reference listing for voice training (Agent Voice Reference)"
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateNarrative}
                    className="h-12 w-full sm:w-auto min-w-[220px] rounded-md bg-[#003366] font-sans font-medium text-white hover:bg-[#003366]/90 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="size-5 shrink-0" aria-hidden />
                    Generate AI narrative
                  </Button>
                  <p className="text-xs text-[#455A64] font-sans">
                    The generated narrative will appear in the Property Narrative section of the Listing Brief tab.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listing-brief" className="mt-4 w-full max-w-full">
              <div className="space-y-4 w-full max-w-full">
                <ReportPreview
                  addressLine={[streetNumber, streetName, city, stateOrProvince, postalCode].filter(Boolean).join(", ") || ""}
                  bedrooms={bedrooms}
                  bathrooms={bathrooms}
                  carSpaces={totalCarSpaces}
                  landAreaSqm={landAreaSqm}
                  keyFeatures={propertyData?.keyFeatures ?? []}
                  schoolCatchment={propertyData?.identity?.schoolCatchment ?? ""}
                  shoppingCentre={propertyData?.identity?.shoppingCentre ?? ""}
                  shoppingCentreDistanceKm={propertyData?.identity?.shoppingCentreDistanceKm ?? ""}
                  lotPlanNumber={propertyData?.identity?.lotPlanNumber ?? ""}
                  zoning={propertyData?.identity?.zoning ?? ""}
                  reaGroupId={propertyData?.identity?.reaGroupId ?? ""}
                  domainId={propertyData?.identity?.domainId ?? ""}
                  propertyNarrative={propertyNarrative ?? ""}
                />
              </div>
            </TabsContent>
          </Tabs>

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

          {/* Print styles: Listing Brief tab Report Preview uses report-preview-print class */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden; }
              .report-preview-print, .report-preview-print * { visibility: visible; }
              .report-preview-print .no-print { visibility: hidden !important; display: none !important; }
              .report-preview-print { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; }
              .report-preview-print .logo-placeholder-print { border-color: #003366 !important; border-width: 2px !important; }
              .report-preview-print .logo-placeholder-print span { color: #003366 !important; }
            }
          `}} />
        </form>
      </div>
    </DashboardShell>
  );
}

const EMPTY_PLACEHOLDER = "Pending data entry";

/** Live report preview: premium Marketing Brief layout. Place-branded white card. */
function ReportPreview({
  addressLine,
  bedrooms,
  bathrooms,
  carSpaces,
  landAreaSqm,
  keyFeatures,
  schoolCatchment,
  shoppingCentre,
  shoppingCentreDistanceKm,
  lotPlanNumber,
  zoning,
  reaGroupId,
  domainId,
  propertyNarrative,
}: {
  addressLine: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landAreaSqm?: number;
  keyFeatures: string[];
  schoolCatchment: string;
  shoppingCentre: string;
  shoppingCentreDistanceKm: string | number;
  lotPlanNumber: string;
  zoning: string;
  reaGroupId: string;
  domainId: string;
  propertyNarrative: string;
}) {
  const distanceStr = shoppingCentreDistanceKm != null && String(shoppingCentreDistanceKm).trim() !== ""
    ? String(shoppingCentreDistanceKm).trim()
    : null;
  const iconClass = "size-4 shrink-0 text-[#003366]";
  const reaDomains = [reaGroupId && `REA: ${reaGroupId}`, domainId && `Domain: ${domainId}`].filter(Boolean).join(" / ") || null;

  return (
    <Card className="report-preview-print mt-8 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
      <div className="rounded-t-lg border-b-2 border-b-[#E3F2FD] bg-white px-6 py-4">
        <h3 className="text-center text-2xl sm:text-3xl font-bold text-[#003366] font-sans underline decoration-2 decoration-[#E3F2FD] underline-offset-4">
          Report Preview
        </h3>
      </div>
      {/* Header: logo placeholder left, address right (reduced font size per polish). logo-placeholder-print: darker border when printing for agency branding. */}
      <div className="flex items-start justify-between gap-8 border-b-2 border-[#E3F2FD] bg-white px-6 py-5">
        <div className="logo-placeholder-print w-28 h-20 shrink-0 rounded-lg border-2 border-dashed border-[#E3F2FD] bg-[#E3F2FD]/20 flex items-center justify-center">
          <span className="text-xs font-sans text-[#94a3b8]">Logo</span>
        </div>
        <h2 className="text-right text-base sm:text-lg font-bold text-[#003366] font-sans leading-tight flex-1 tracking-tight">
          {addressLine || <span className="text-[#94a3b8] italic font-normal">{EMPTY_PLACEHOLDER}</span>}
        </h2>
      </div>
      {/* Hard specs bar: bed, bath, car, land with icons — horizontal bar below header, icons aligned */}
      <div className="flex flex-wrap items-center gap-8 px-6 py-4 border-b border-border bg-[#E3F2FD]/25">
        <ul className="flex flex-wrap items-center gap-8 font-sans text-sm text-[#1e293b]">
          <li className="flex items-center gap-2">
            <BedDouble className={iconClass} aria-hidden />
            <span>Beds: {bedrooms != null && bedrooms > 0 ? bedrooms : <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}</span>
          </li>
          <li className="flex items-center gap-2">
            <Bath className={iconClass} aria-hidden />
            <span>Baths: {bathrooms != null && bathrooms > 0 ? bathrooms : <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}</span>
          </li>
          <li className="flex items-center gap-2">
            <Car className={iconClass} aria-hidden />
            <span>Cars: {carSpaces != null && carSpaces > 0 ? carSpaces : <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}</span>
          </li>
          <li className="flex items-center gap-2">
            <Ruler className={iconClass} aria-hidden />
            <span>Land: {landAreaSqm != null && landAreaSqm > 0 ? `${landAreaSqm} m²` : <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}</span>
          </li>
        </ul>
      </div>
      {/* Two-column body: left = identity & land, right = location & lifestyle — premium padding */}
      <CardContent className="px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: identity and land (lot/plan, zoning, REA/domains) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#003366] font-sans mb-3">Identity & Land</h4>
            <div className="space-y-3">
              <p className="font-sans text-sm text-[#1e293b]">
                <span className="font-medium text-[#455A64]">Lot / Plan:</span>{" "}
                {lotPlanNumber.trim() || <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}
              </p>
              <p className="font-sans text-sm text-[#1e293b]">
                <span className="font-medium text-[#455A64]">Zoning:</span>{" "}
                {zoning.trim() || <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}
              </p>
              <p className="font-sans text-sm text-[#1e293b]">
                <span className="font-medium text-[#455A64]">REA / Domains:</span>{" "}
                {reaDomains || <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}
              </p>
            </div>
          </div>
          {/* Right column: location and lifestyle (schools, shopping, key ticket features) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#003366] font-sans mb-3">Location & Lifestyle</h4>
            <ul className="space-y-3">
              <li>
                <h5 className="text-xs font-medium text-[#455A64] font-sans flex items-center gap-2 mb-0.5">
                  <GraduationCap className="size-3.5 text-[#003366]" aria-hidden />
                  School Catchment Area
                </h5>
                <p className="font-sans text-sm text-[#1e293b] pl-5">
                  {schoolCatchment.trim() || <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}
                </p>
              </li>
              <li>
                <h5 className="text-xs font-medium text-[#455A64] font-sans mb-0.5">Nearest Major Shopping Centre</h5>
                <p className="font-sans text-sm text-[#1e293b] pl-5">
                  {shoppingCentre.trim()
                    ? `${shoppingCentre.trim()}${distanceStr != null ? ` (${distanceStr} km)` : ""}`
                    : distanceStr != null
                      ? `${distanceStr} km`
                      : <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>}
                </p>
              </li>
              <li>
                <h5 className="text-xs font-medium text-[#455A64] font-sans mb-1">Key Features</h5>
                {keyFeatures.length > 0 ? (
                  <ul className="space-y-0.5 pl-5">
                    {keyFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-2 font-sans text-sm text-[#1e293b]">
                        <span className="size-1.5 shrink-0 rounded-full bg-[#007BFF]" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-sans text-sm pl-5">
                    <span className="text-[#94a3b8] italic">{EMPTY_PLACEHOLDER}</span>
                  </p>
                )}
              </li>
            </ul>
          </div>
        </div>
        {/* Property Narrative: slate-50 box with rounded corners, headline — premium brochure feel */}
        <div className="mt-10 w-full rounded-xl bg-slate-50 border border-slate-200 px-10 py-8 shadow-sm">
          <h4 className="text-sm font-semibold text-[#003366] font-sans mb-3">Property Narrative</h4>
          {propertyNarrative?.trim() ? (
            <div className="font-sans text-sm text-[#1e293b] leading-[1.7] space-y-4">
              {propertyNarrative.trim().split("\n\n").map((para, i) => (
                <p key={i} className={i === 0 ? "font-bold text-[#003366] text-base tracking-tight" : "font-normal"}>
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[#94a3b8] italic font-sans text-sm">{EMPTY_PLACEHOLDER}</p>
          )}
        </div>
        {/* Agent signature footer: inside print area, at bottom with elegant separator */}
        <footer className="mt-10 border-t-2 border-[#E3F2FD] pt-6 pb-8">
          <p className="font-serif text-xs text-[#455A64] tracking-wide">Presented by: Brendan Lewington</p>
        </footer>
        {/* Export PDF: natural next step at bottom, primary blue with icon — no-print so excluded from PDF */}
        <div className="flex justify-end px-8 pb-8 pt-4 no-print">
          <Button
            type="button"
            onClick={() => window.print()}
            className="h-11 min-w-[180px] rounded-md bg-[#003366] font-sans font-medium text-white hover:bg-[#003366]/90 flex items-center justify-center gap-2 shadow-md"
          >
            <FileText className="size-5 shrink-0" aria-hidden />
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
