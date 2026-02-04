import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Car } from "lucide-react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getPropertyById } from "@/lib/actions/properties";
import {
  generateVendorStrategy,
  getAnalysesByPropertyId,
} from "@/lib/actions/property-analysis";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintStrategyButton } from "@/components/PrintStrategyButton";

function formatPrice(value: string | number | null | undefined): string | null {
  if (value == null || value === "") return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/** Parse strategy content into sections by ## headings. */
function parseStrategySections(content: string): { title: string; body: string }[] {
  const raw = content.split(/\n## /).filter(Boolean);
  return raw.map((block) => {
    const firstNewline = block.indexOf("\n");
    const title = firstNewline === -1 ? block.trim() : block.slice(0, firstNewline).trim();
    const body = firstNewline === -1 ? "" : block.slice(firstNewline).trim();
    return { title, body };
  });
}

function StrategyReportCard({
  content,
  createdAt,
}: {
  content: string;
  createdAt: Date;
}) {
  const sections = parseStrategySections(content);
  const generatedDate = new Date(createdAt).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <div className="print-strategy-report strategy-report-card overflow-hidden rounded-lg border-2 border-[#003366] bg-white text-[#003366] shadow-sm">
      <div className="border-b border-[#003366]/20 bg-[#003366] px-4 py-3">
        <h3 className="text-base font-bold tracking-tight text-white font-sans">
          RealInfo | Strategic Property Analysis
        </h3>
        <span className="mt-1 block text-xs text-white/80 font-sans">
          Vendor strategy · {new Date(createdAt).toLocaleString("en-AU")}
        </span>
      </div>
      <div className="px-4 py-4">
        {sections.map((sec) => (
          <section key={sec.title} className="mb-5 last:mb-0">
            <h4 className="text-sm font-bold text-[#003366] font-sans mb-2">{sec.title}</h4>
            <div className="whitespace-pre-wrap text-sm font-normal leading-relaxed text-[#003366] font-sans">
              {sec.body}
            </div>
          </section>
        ))}
        <p className="mt-4 pt-3 border-t border-[#003366]/20 text-xs text-[#455A64] font-sans">
          Strategy generated on {generatedDate} to support our audit trail.
        </p>
      </div>
    </div>
  );
}

async function submitVendorStrategy(formData: FormData) {
  "use server";
  const propertyId = formData.get("propertyId");
  if (typeof propertyId === "string") await generateVendorStrategy(propertyId);
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);
  const analyses = await getAnalysesByPropertyId(id);

  if (!property) notFound();

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 no-print">
          <Link
            href="/"
            className="text-sm font-medium text-[#007BFF] hover:underline font-sans"
          >
            ← Back to Property Gallery
          </Link>
        </div>

        <header className="no-print overflow-hidden rounded-lg border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="px-6 py-5">
            <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
              {property.address}, {property.suburb}
            </h1>
            <p className="mt-1 text-sm font-normal text-primary-foreground/80 font-sans">
              {property.postcode}
            </p>
            {formatPrice(property.listPrice) && (
              <p className="mt-2 text-lg font-bold tabular-nums text-primary-foreground font-sans">
                {formatPrice(property.listPrice)}
              </p>
            )}
            {!formatPrice(property.listPrice) && (
              <p className="mt-2 text-sm text-primary-foreground/80 font-sans">
                Price on request
              </p>
            )}
          </div>
        </header>

        <section className="no-print mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground font-sans mb-2">
              Address
            </h2>
            <p className="text-sm font-normal text-muted-foreground font-sans">
              {property.address}, {property.suburb} {property.postcode}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-base font-bold text-card-foreground font-sans mb-2">
              Key specs
            </h2>
            <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground font-sans">
              {property.bedCount != null && (
                <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                  <BedDouble className="size-3.5 text-primary" aria-hidden />
                  {property.bedCount} beds
                </Badge>
              )}
              {property.bathCount != null && (
                <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                  <Bath className="size-3.5 text-primary" aria-hidden />
                  {property.bathCount} baths
                </Badge>
              )}
              {property.livingArea != null && (
                <li>{property.livingArea} m² living</li>
              )}
              {property.carSpaces != null && (
                <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                  <Car className="size-3.5 text-primary" aria-hidden />
                  {property.carSpaces} cars
                </Badge>
              )}
              {property.bedCount == null &&
                property.bathCount == null &&
                property.livingArea == null &&
                property.carSpaces == null && (
                  <li className="text-muted-foreground">—</li>
                )}
            </ul>
          </div>
        </section>

        <section className="ai-analysis-section mt-8 border-t border-border pt-8">
          <h2 className="no-print text-lg font-bold text-foreground font-sans mb-3">
            AI Analysis
          </h2>
          <p className="no-print text-sm font-normal text-muted-foreground font-sans mb-4">
            Generate a vendor strategy and talking points for this listing using
            the property&apos;s RESO-compliant data. Results are saved as a
            permanent auditable record.
          </p>
          <div className="no-print flex flex-wrap items-center gap-3 mb-6">
            <form action={submitVendorStrategy}>
              <input type="hidden" name="propertyId" value={property.id} />
              <Button
                type="submit"
                className="bg-[#007BFF] hover:bg-[#007BFF]/90 font-sans font-medium text-white"
              >
                Generate Vendor Strategy
              </Button>
            </form>
            <PrintStrategyButton />
          </div>

          {analyses.length > 0 && (
            <>
              {/* Only the latest strategy is in the print area so Print outputs a single report */}
              <div className="print-strategy-report mt-6">
                <StrategyReportCard
                  key={analyses[0].id}
                  content={analyses[0].content}
                  createdAt={analyses[0].createdAt}
                />
              </div>
              {analyses.length > 1 && (
                <details className="no-print mt-6 group">
                  <summary className="cursor-pointer list-none rounded-md border border-[#003366]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#003366] font-sans hover:bg-[#003366]/5">
                    <span className="inline-flex items-center gap-2">
                      View previous versions ({analyses.length - 1})
                    </span>
                  </summary>
                  <div className="mt-3 space-y-4 border-l-2 border-[#003366]/20 pl-4">
                    {analyses.slice(1).map((a) => (
                      <StrategyReportCard
                        key={a.id}
                        content={a.content}
                        createdAt={a.createdAt}
                      />
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
