"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { usePropertyStore, useStoreHydrated } from "@/store/usestore";
import { generateVendorStrategy, generateListingFromStore } from "@/lib/actions/property-analysis";

const HYDRATION_TIMEOUT_MS = 50;

const ANTIPODEAN_STYLES = [
  { id: "contemporary", label: "Contemporary" },
  { id: "heritage", label: "Heritage" },
  { id: "coastal", label: "Coastal" },
  { id: "urban", label: "Urban" },
] as const;

function downloadPlainText(content: string, filename: string = "listing.txt") {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ListingGeneratorPage() {
  const hydrated = useStoreHydrated();
  const [mounted, setMounted] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const propertyData = usePropertyStore((s) => s.propertyData);
  const voiceStyle = usePropertyStore((s) => s.voiceStyle);
  const activePropertyId = usePropertyStore((s) => s.activePropertyId);
  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setHydrationTimeout(true), HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mounted]);

  const styleLabel = voiceStyle
    ? ANTIPODEAN_STYLES.find((s) => s.id === voiceStyle)?.label ?? "Coastal"
    : "Coastal";

  const generateFromStore = useCallback(async () => {
    setGenerateError(null);
    setIsGenerating(true);
    try {
      if (activePropertyId) {
        const result = await generateVendorStrategy(activePropertyId, styleLabel);
        if (result.ok) {
          setGeneratedText(result.content);
        } else {
          setGenerateError(result.error);
          setGeneratedText("");
        }
      } else {
        const result = await generateListingFromStore(propertyData, styleLabel);
        if (result.ok) {
          setGeneratedText(result.content);
        } else {
          setGenerateError(result.error);
          setGeneratedText("");
        }
      }
    } finally {
      setIsGenerating(false);
    }
  }, [activePropertyId, propertyData, styleLabel]);

  const handleCopyToClipboard = useCallback(async () => {
    const text = generatedText || "No listing text generated yet. Choose style above and click Generate.";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [generatedText]);

  const handleDownloadTxt = useCallback(() => {
    const text = generatedText || "No listing text generated yet. Choose style above and click Generate.";
    downloadPlainText(text, "realinfo-listing.txt");
  }, [generatedText]);

  const canRender = mounted && (hydrated || hydrationTimeout);

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
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              Listing Generator
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              RealInfo · RESO-compliant listing copy. Infosource.com.au
            </p>
          </div>
        </header>

        {propertyData && (
          <div className="mt-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden" aria-label="Property summary">
            <div className="border-b border-border bg-muted/30 px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
                Property summary
              </h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm font-sans text-card-foreground">
              <p className="font-medium text-base leading-snug">
                {[propertyData.address?.StreetNumber, propertyData.address?.StreetName].filter(Boolean).join(" ").trim() || "—"}
              </p>
              <p className="text-muted-foreground">
                {[propertyData.address?.City, propertyData.address?.StateOrProvince].filter(Boolean).join(", ") || "—"}
                {propertyData.address?.PostalCode && ` ${propertyData.address.PostalCode}`}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-muted-foreground">
                {propertyData.improvements?.BedroomsTotal != null && (
                  <span>{propertyData.improvements.BedroomsTotal} bed{propertyData.improvements.BedroomsTotal !== 1 ? "s" : ""}</span>
                )}
                {propertyData.improvements?.BathroomsFull != null && (
                  <span>{propertyData.improvements.BathroomsFull} bath{propertyData.improvements.BathroomsFull !== 1 ? "s" : ""}</span>
                )}
                {propertyData.improvements?.LivingArea != null && (
                  <span>{propertyData.improvements.LivingArea} m²</span>
                )}
                {(() => {
                  const g = propertyData.improvements?.GarageCount ?? 0;
                  const c = propertyData.improvements?.CarportCount ?? 0;
                  const wa = propertyData.improvements?.WorkshopAlcove ?? false;
                  const ss = propertyData.improvements?.StandaloneShed ?? false;
                  const sb = propertyData.improvements?.StandaloneShedBays ?? 0;
                  if (g === 0 && c === 0 && !wa && !ss) return <span>No covered parking</span>;
                  const bits: React.ReactNode[] = [];
                  if (g > 0) bits.push(<span key="g">{g === 1 ? "SLUG" : g === 2 ? "DLUG" : `DLUG + ${g - 2} additional`}</span>);
                  if (c > 0) bits.push(<span key="c">{c} car port{c !== 1 ? "s" : ""}</span>);
                  if (wa) bits.push(<span key="wa">workshop</span>);
                  if (ss) bits.push(<span key="ss">{sb > 0 ? `${sb} bay standalone shed` : "standalone shed"}</span>);
                  return <>{bits}</>;
                })()}
              </div>
            </div>
          </div>
        )}

        {!propertyData && (
          <div className="mt-6 rounded-lg border border-border bg-muted/30 px-5 py-4 text-sm text-muted-foreground font-sans">
            No property data in store.{" "}
            <Link href="/property-entry" className="text-[#003366] font-medium underline hover:no-underline">
              Go to Property Entry
            </Link>{" "}
            to enter address and features, then use &quot;Go to Listing Generator&quot; to come back here.
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground font-sans">
          Style and intensity are set on{" "}
          <Link href="/listing-style-selection" className="text-[#003366] font-medium underline hover:no-underline">
            Listing Style Selection
          </Link>.
        </p>

        <div className="mt-6 space-y-6">
          {generateError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive font-sans">
              {generateError}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={generateFromStore}
              disabled={isGenerating || !propertyData}
              className="h-[48px] w-[200px] rounded-md font-sans font-medium text-white bg-[#003366] hover:bg-[#003366]/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                  Generating…
                </>
              ) : (
                "Generate listing copy"
              )}
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
      </div>
    </DashboardShell>
  );
}
