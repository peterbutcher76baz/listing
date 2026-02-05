import Link from "next/link";
import { BedDouble, Bath, Car, ArrowRight } from "lucide-react";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getAllProperties } from "@/lib/actions/properties";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default async function Page() {
  const properties = await getAllProperties();

  return (
    <DashboardShell>
      <div className="min-h-screen">
        {/* Main container: overflow-hidden + rounded-lg so blue header respects corners (Real Info Design System) */}
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-card shadow-sm">
          {/* Navy header — rounded-t-lg to match container; content vertically centred */}
          <header className="rounded-t-lg border-b border-sidebar-border bg-primary text-primary-foreground shadow-sm">
            <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-h-[3.5rem] flex-col justify-center sm:min-h-0">
                <h1 className="text-xl font-bold tracking-tight font-sans sm:text-2xl">
                  Property Gallery
                </h1>
                <p className="mt-0.5 text-sm font-normal text-primary-foreground/80 font-sans">
                  {properties.length} propert{properties.length === 1 ? "y" : "ies"} · RESO-compliant data
                </p>
              </div>
              <div className="flex shrink-0 items-center sm:mt-0">
                <Button variant="outline" size="sm" asChild className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                  <Link href="/settings">Settings</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <Card
                key={p.id}
                className="flex flex-col gap-0 overflow-hidden rounded-lg border border-border bg-card py-0 shadow-sm transition-all hover:border-primary/20 hover:shadow-lg"
              >
                {/* Deep Navy header — rounded-t-lg; address perfectly centred vertically */}
                <CardHeader className="flex min-h-[4rem] flex-col items-center justify-center rounded-t-lg border-0 bg-primary px-4 py-2.5 text-center text-primary-foreground">
                  <CardTitle className="text-base font-bold leading-tight line-clamp-2 text-primary-foreground font-sans">
                    {p.address}
                  </CardTitle>
                  <CardDescription className="mt-0.5 text-xs text-primary-foreground/80 font-sans">
                    {p.suburb} {p.postcode}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3 px-4 pb-2 pt-3">
                  {/* Beds, baths, cars — RESO spec sits neatly below header */}
                  
                  <div className="flex flex-wrap gap-2">
                    {p.bedCount != null && (
                      <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                        <BedDouble className="size-3.5 text-primary" aria-hidden />
                        {p.bedCount}
                      </Badge>
                    )}
                    {p.bathCount != null && (
                      <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                        <Bath className="size-3.5 text-primary" aria-hidden />
                        {p.bathCount}
                      </Badge>
                    )}
                    {p.carSpaces != null && (
                      <Badge variant="secondary" className="gap-1.5 bg-muted font-medium text-muted-foreground">
                        <Car className="size-3.5 text-primary" aria-hidden />
                        {p.carSpaces}
                      </Badge>
                    )}
                    {p.bedCount == null && p.bathCount == null && p.carSpaces == null && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  {formatPrice(p.listPrice) && (
                    <p className="text-lg font-bold tabular-nums text-card-foreground">
                      {formatPrice(p.listPrice)}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border px-4 pb-3 pt-2">
                  <Button variant="default" size="sm" className="w-full group bg-[#007BFF] hover:bg-[#007BFF]/90" asChild>
                    <Link href={`/properties/${p.id}`}>
                      View Details
                      <ArrowRight className="size-3.5 opacity-90 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}
