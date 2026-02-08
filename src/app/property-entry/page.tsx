"use client";

import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import { PropertySchema, Property } from "@/schemas/property.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyStore, useStoreHydrated } from "@/store/usestore";

const HYDRATION_TIMEOUT_MS = 50;

const ANTIPODEAN_STYLES = [
  { id: "contemporary", label: "Contemporary" },
  { id: "heritage", label: "Heritage" },
  { id: "coastal", label: "Coastal" },
  { id: "urban", label: "Urban" },
] as const;

const STYLE_TOOLTIPS: Record<string, string> = {
  contemporary: "Clean lines, modern, minimalist tone",
  heritage: "Classic, period, character focus",
  coastal: "Relaxed, breezy, beachside tone",
  urban: "Sharp, city, contemporary",
};

function downloadPlainText(content: string, filename: string = "listing.txt") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PropertyEntryPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const setPropertyData = usePropertyStore((s) => s.setPropertyData);
  const clearAll = usePropertyStore((s) => s.clearAll);
  const propertyData = usePropertyStore((s) => s.propertyData);
  const voiceStyle = usePropertyStore((s) => s.voiceStyle);
  const setVoiceStyle = usePropertyStore((s) => s.setVoiceStyle);
  const [saveNotification, setSaveNotification] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const [styleLevel, setStyleLevel] = useState(50);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setHydrationTimeout(true), HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mounted]);

  const defaultFormValues: Property = {
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
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Property>({
    resolver: zodResolver(PropertySchema),
    defaultValues: defaultFormValues,
  });

  /** Save to Zustand store and show notification. Used by form submit (Save property). */
  const onSubmit = useCallback(
    (data: Property) => {
      setPropertyData(data);
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 3000);
    },
    [setPropertyData]
  );

  /** Save to Zustand store and navigate to generator section (same page). Validation runs via handleSubmit. */
  const onSaveAndGoToGenerator = useCallback(
    (data: Property) => {
      setPropertyData(data);
      router.push("/property-entry#generator");
    },
    [setPropertyData, router]
  );

  /** Build listing copy text from a property and current style. Address formatted as number, street, suburb, state (state uppercase, max 3 letters). */
  const buildListingText = useCallback(
    (source: Property | null) => {
      const formatState = (state: string | undefined) =>
        (state ?? "").trim().toUpperCase().slice(0, 3);
      const parts: string[] = [];
      const addr = source?.address;
      const numberAndStreet = [addr?.StreetNumber, addr?.StreetName].filter(Boolean).join(" ").trim();
      const suburb = addr?.City?.trim() ?? "";
      const stateAbbrev = formatState(addr?.StateOrProvince);
      if (numberAndStreet || suburb || stateAbbrev) {
        const addressLine = [numberAndStreet, suburb, stateAbbrev].filter(Boolean).join(", ");
        parts.push(addressLine);
      }
      if (addr?.PostalCode) parts.push(addr.PostalCode);
      const imp = source?.improvements;
      if (imp) {
        if (imp.BedroomsTotal != null) parts.push(`${imp.BedroomsTotal} bedroom${imp.BedroomsTotal !== 1 ? "s" : ""}`);
        if (imp.BathroomsFull != null) parts.push(`${imp.BathroomsFull} bathroom${imp.BathroomsFull !== 1 ? "s" : ""}`);
        if (imp.LivingArea != null) parts.push(`${imp.LivingArea} m² living`);
      }
      const styleTag = (voiceStyle ?? selectedStyle)
        ? ANTIPODEAN_STYLES.find((s) => s.id === (voiceStyle ?? selectedStyle ?? ""))?.label ?? ""
        : "";
      const intro = styleTag
        ? `[${styleTag} style, ${styleLevel}%] `
        : `[Style level ${styleLevel}%] `;
      const body = parts.length ? parts.join(" · ") : "No property context — enter data above and save.";
      return intro + body + "\n\n— Generated by RealInfo Listing Generator (RESO-compliant).";
    },
    [voiceStyle, selectedStyle, styleLevel]
  );

  useEffect(() => {
    if (hydrated) setSelectedStyle(voiceStyle);
  }, [hydrated, voiceStyle]);

  /** Generate from current store (e.g. after navigation). Uses latest propertyData from store. */
  const generateFromStore = useCallback(() => {
    const text = buildListingText(propertyData ?? null);
    setGeneratedText(text);
  }, [propertyData, buildListingText]);

  /** Sync form to store via validation, then generate from that data. Ensures Generate uses current form input. */
  const onSaveThenGenerate = useCallback(
    (data: Property) => {
      setPropertyData(data);
      setGeneratedText(buildListingText(data));
    },
    [setPropertyData, buildListingText]
  );

  const handleDownloadTxt = useCallback(() => {
    const text = generatedText || "No listing text generated yet. Save property data above, then generate here.";
    downloadPlainText(text, "realinfo-listing.txt");
  }, [generatedText]);

  /** Clears both the Zustand store (and persisted vault) and all UI fields for a blank slate. */
  const handleClearForm = useCallback(() => {
    clearAll();
    reset(defaultFormValues);
    setGeneratedText("");
    setSelectedStyle(null);
    setStyleLevel(50);
  }, [clearAll, reset]);

  const handleCopyToClipboard = useCallback(async () => {
    const text = generatedText || "No listing text generated yet. Save property data above, then generate here.";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [generatedText]);

  const canRender = mounted && (hydrated || hydrationTimeout);

  useEffect(() => {
    if (!canRender || typeof window === "undefined") return;
    if (window.location.hash === "#generator") {
      const el = document.getElementById("generator");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [canRender]);

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
          onSubmit={handleSubmit(onSubmit)}
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
              onClick={handleSubmit(onSaveAndGoToGenerator)}
              className="h-[48px] w-[200px] rounded-md border-2 border-[#003366] bg-transparent font-sans font-medium text-[#003366] hover:bg-[#003366]/5"
            >
              Go to Listing Generator
            </Button>
          </div>
        </form>

        {/* Listing generator section — context card + style + generate */}
        <section id="generator" className="mt-10 scroll-mt-8" aria-label="Listing generator">
          <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
            <div className="px-6 py-5">
              <h2 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
                Listing Generator
              </h2>
              <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
                RealInfo · RESO-compliant listing copy. Infosource.com.au
              </p>
            </div>
          </header>

          {propertyData && (
            <div className="mt-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden" aria-label="Property summary">
              <div className="border-b border-border bg-muted/30 px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                  Property summary
                </h3>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm font-sans text-card-foreground">
                <p className="font-medium text-base leading-snug">
                  {[propertyData.address?.StreetNumber, propertyData.address?.StreetName].filter(Boolean).join(" ").trim() || "—"}
                </p>
                <p className="text-muted-foreground">
                  {[propertyData.address?.City, propertyData.address?.StateOrProvince].filter(Boolean).join(", ") || "—"}
                  {propertyData.address?.PostalCode && ` ${propertyData.address.PostalCode}`}
                </p>
                <div className="flex gap-4 pt-1 text-muted-foreground">
                  {propertyData.improvements?.BedroomsTotal != null && (
                    <span>{propertyData.improvements.BedroomsTotal} bed{propertyData.improvements.BedroomsTotal !== 1 ? "s" : ""}</span>
                  )}
                  {propertyData.improvements?.BathroomsFull != null && (
                    <span>{propertyData.improvements.BathroomsFull} bath{propertyData.improvements.BathroomsFull !== 1 ? "s" : ""}</span>
                  )}
                  {propertyData.improvements?.LivingArea != null && (
                    <span>{propertyData.improvements.LivingArea} m²</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-6">
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-base font-bold text-card-foreground font-sans mb-3">Style intensity</h3>
              <div className="flex items-center gap-4">
                <span title="Fact-focused — factual only, no style or voice" className="text-sm font-normal text-muted-foreground font-sans w-8 cursor-help">0%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={styleLevel}
                  onChange={(e) => setStyleLevel(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted accent-[#003366]"
                  aria-describedby="intensity-desc"
                />
                <span title="Style-focused — full voice and style applied" className="text-sm font-normal text-muted-foreground font-sans w-10 cursor-help">{styleLevel}%</span>
              </div>
              <p id="intensity-desc" className="sr-only">0% is fact-focused (factual only). 100% is style-focused (full voice and style).</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="text-base font-bold text-card-foreground font-sans mb-3">Antipodean styles</h3>
              <div className="flex flex-wrap gap-3">
                {ANTIPODEAN_STYLES.map((style) => (
                  <div key={style.id} className="group relative inline-block">
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-[100] flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span
                        aria-hidden
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#003366] -mb-[5px]"
                      />
                      <span className="whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg">
                        {STYLE_TOOLTIPS[style.id] ?? style.label}
                      </span>
                    </span>
                    <Button
                      type="button"
                      onClick={() => {
                        const next = selectedStyle === style.id ? null : style.id;
                        setSelectedStyle(next);
                        setVoiceStyle(next);
                      }}
                      className={`h-[48px] w-[200px] rounded-md font-sans font-medium text-white bg-[#003366] hover:bg-[#003366]/90 ${selectedStyle === style.id ? "ring-2 ring-[#007BFF] ring-offset-2" : ""}`}
                    >
                      {style.label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleSubmit(onSaveThenGenerate)}
                className="h-[48px] w-[200px] rounded-md font-sans font-medium text-white bg-[#003366] hover:bg-[#003366]/90"
              >
                Generate listing copy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyToClipboard}
                className="h-[48px] min-w-[160px] rounded-md font-sans font-medium border-2 border-[#003366] text-[#003366] bg-transparent hover:bg-[#003366]/5"
              >
                {copied ? "Quick Copied" : "Copy to clipboard"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTxt}
                className="h-[48px] w-[200px] rounded-md font-sans font-medium border-2 border-[#003366] text-[#003366] bg-transparent hover:bg-[#003366]/5"
              >
                Download Plain Text (.txt)
              </Button>
            </div>

            {generatedText && (
              <div
                className="relative rounded-lg border-2 border-[#003366]/20 bg-[#fdfcf9] shadow-[0_2px_8px_rgba(0,51,102,0.06),0_0_0_1px_rgba(0,51,102,0.04)] p-8 min-h-[140px]"
                style={{
                  boxShadow: "0 2px 8px rgba(0,51,102,0.06), 0 0 0 1px rgba(0,51,102,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                }}
                aria-label="Generated listing copy"
              >
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#003366]/20 to-transparent" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#003366]/50 font-sans mb-5">
                  RealInfo Listing Copy
                </p>
                <div className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#1a1a1a] font-sans antialiased">
                  {generatedText}
                </div>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#003366]/15 to-transparent" />
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
