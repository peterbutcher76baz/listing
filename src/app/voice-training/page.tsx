import DashboardShell from "@/components/layout/dashboard-shell";

export default function VoiceTrainingPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <header className="overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              Voice Training
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              Train the AI to match your signature voice. RealInfo · RESO-compliant.
            </p>
          </div>
        </header>
        <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-normal text-muted-foreground font-sans">
            Voice training features will be available here. Upload samples or fine-tune style weights to align listing copy with your brand.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
