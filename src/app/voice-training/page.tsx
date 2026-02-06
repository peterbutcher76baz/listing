"use client";

import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoiceSettings, ANTIPODEAN_STYLES } from "@/contexts/listing-context";

const STYLE_TOOLTIPS: Record<string, string> = {
  coastal: "Relaxed, breezy, beachside tone",
  heritage: "Classic, period, character focus",
  urban: "Sharp, city, contemporary",
  bush: "Natural, outdoors, rural",
};

export default function VoiceTrainingPage() {
  const { voice, setVoice } = useVoiceSettings();
  const { styleId, styleIntensity } = voice;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              Voice Training
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              Train the AI to match your signature voice. RealInfo · Premium.
            </p>
          </div>
        </header>

        <Card className="mt-6 overflow-visible rounded-lg border border-border bg-card shadow-sm">
          <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
            <CardTitle className="text-base font-bold text-card-foreground font-sans">
              Voice persona
            </CardTitle>
            <p className="text-sm font-normal text-muted-foreground font-sans mt-1">
              Style intensity 0–100% and Antipodean style presets. Used by the Listing Generator.
            </p>
          </CardHeader>
          <CardContent className="overflow-visible px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground font-sans mb-2">
                Style intensity: {styleIntensity}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={styleIntensity}
                onChange={(e) =>
                  setVoice((prev) => ({
                    ...prev,
                    styleIntensity: Number(e.target.value),
                  }))
                }
                className="w-full h-2 rounded-lg appearance-none bg-muted accent-[#003366]"
              />
            </div>
            <div>
              <span className="block text-sm font-medium text-card-foreground font-sans mb-2">
                Antipodean styles
              </span>
              <div className="flex flex-wrap gap-3">
                {ANTIPODEAN_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className="group relative inline-block"
                  >
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
                      onClick={() =>
                        setVoice((prev) => ({
                          ...prev,
                          styleId: style.id,
                        }))
                      }
                      className={`h-[48px] w-[200px] rounded-md border-2 font-sans font-medium transition-colors ${
                        styleId === style.id
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
            Voice training features (upload samples, fine-tune style weights) will be available here. Your chosen style and intensity are saved and used when you generate listings.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
