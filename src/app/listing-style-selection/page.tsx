"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePropertyStore, useStoreHydrated } from "@/store/usestore";

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

const HYDRATION_TIMEOUT_MS = 50;

/** Returns a short label for the style intensity (for slider tooltip). Left = agent voice dominant, middle = balanced blend, right = antipodean style dominant. */
function getIntensityLabel(percent: number): string {
  if (percent <= 0) return "Agent voice dominant";
  if (percent < 34) return "Subtle";
  if (percent < 67) return "Balanced blend";
  if (percent < 100) return "Strong";
  return "Antipodean style dominant";
}

export default function ListingStyleSelectionPage() {
  const hydrated = useStoreHydrated();
  const [mounted, setMounted] = useState(false);
  const [hydrationTimeout, setHydrationTimeout] = useState(false);
  const voiceStyle = usePropertyStore((s) => s.voiceStyle);
  const setVoiceStyle = usePropertyStore((s) => s.setVoiceStyle);
  const styleLevel = usePropertyStore((s) => s.styleLevel);
  const setStyleLevel = usePropertyStore((s) => s.setStyleLevel);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setHydrationTimeout(true), HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mounted]);

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
              Listing Style Selection
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              Set style intensity and Antipodean voice. Used by the Listing Generator.
            </p>
          </div>
        </header>

        <Card className="mt-6 overflow-visible rounded-lg border border-border bg-card shadow-sm">
          <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
            <CardTitle className="text-base font-bold text-card-foreground font-sans">
              Style intensity
            </CardTitle>
            <p className="text-sm font-normal text-muted-foreground font-sans mt-1">
              Choose how much voice and style to apply when generating listing copy.
            </p>
          </CardHeader>
          <CardContent className="overflow-visible px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground font-sans mb-2">
                Style intensity: {styleLevel}%
              </label>
              <div className="group/slider flex items-center gap-4 cursor-pointer">
                <span className="text-sm font-normal text-muted-foreground font-sans w-12 shrink-0 pointer-events-none select-none">
                  0%
                </span>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={styleLevel}
                    onChange={(e) => setStyleLevel(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none bg-muted accent-[#003366] cursor-pointer"
                    aria-describedby="intensity-desc"
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 z-[100] opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 rounded-md px-2 py-1 text-[11px] font-medium font-sans text-white bg-[#003366] shadow-lg whitespace-nowrap"
                  >
                    {styleLevel}% — {getIntensityLabel(styleLevel)}
                  </span>
                </div>
                <span className="text-sm font-normal text-muted-foreground font-sans w-12 shrink-0 pointer-events-none select-none">
                  100%
                </span>
              </div>
              <p id="intensity-desc" className="sr-only">
                0% is agent voice dominant. 50% is balanced blend. 100% is antipodean style dominant. Hover over the slider to see the current level.
              </p>
            </div>
            <div>
              <span className="block text-sm font-medium text-card-foreground font-sans mb-2">
                Antipodean styles
              </span>
              <div className="flex flex-wrap justify-center gap-3">
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
                      variant="outline"
                      onClick={() => setVoiceStyle(voiceStyle === style.id ? null : style.id)}
                      className={`h-[48px] w-[200px] rounded-md border-2 font-sans font-medium transition-colors ${
                        voiceStyle === style.id
                          ? "border-[#003366] bg-[#003366] text-white hover:bg-[#003366]/90"
                          : "border-[#003366] bg-transparent text-[#003366] hover:bg-[#003366]/5"
                      }`}
                    >
                      {style.label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-normal text-muted-foreground font-sans">
            Your chosen style and intensity are saved and used when you generate listings on the Listing Generator page.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
