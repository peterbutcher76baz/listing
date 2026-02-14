"use client";

import { useState, useCallback } from "react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentStyleTrainingPage() {
  const [trainedText, setTrainedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!trainedText.trim()) return;
    setSubmitted(true);
    setProgress(0);
    const duration = 800;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [trainedText]);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              Agent Style Training
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              Submit your trained text to build the agent&apos;s style profile. RealInfo · Premium.
            </p>
          </div>
        </header>

        <Card className="mt-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <CardHeader className="rounded-t-lg border-b border-border bg-primary/5 px-6 py-4">
            <CardTitle className="text-base font-bold text-card-foreground font-sans">
              Style gestation
            </CardTitle>
            <p className="text-sm font-normal text-muted-foreground font-sans mt-1">
              When you submit trained text, the progress bar below fills to show style generation is in progress.
            </p>
          </CardHeader>
          <CardContent className="px-6 py-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-card-foreground font-sans mb-2">
                Trained text
              </label>
              <textarea
                value={trainedText}
                onChange={(e) => setTrainedText(e.target.value)}
                placeholder="Paste or type sample listing copy that reflects your desired voice…"
                rows={5}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-sans text-card-foreground bg-card focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!trainedText.trim()}
              className="h-[48px] min-w-[180px] rounded-md font-sans font-medium text-white bg-[#003366] hover:bg-[#003366]/90 disabled:opacity-50"
            >
              Submit trained text
            </Button>
            {submitted && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-sans text-muted-foreground">
                  <span>Style generation progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div
                  className="h-3 w-full rounded-full bg-muted overflow-hidden"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-[#003366] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
