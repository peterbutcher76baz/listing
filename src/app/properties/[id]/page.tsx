import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getPropertyById } from "@/lib/actions/properties";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) notFound();

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <header className="border-b pb-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {property.address}, {property.suburb}
          </h1>
          <p className="text-slate-500 mt-1">{property.postcode}</p>
          <p className="text-xl font-semibold text-blue-700 mt-2">
            Price on request
          </p>
        </header>

        <section className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Address
            </h2>
            <p className="text-slate-600">
              {property.address}, {property.suburb} {property.postcode}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Key specs
            </h2>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>Bedrooms: {property.bedrooms ?? "—"}</li>
            </ul>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            AI Analysis
          </h2>
          <p className="text-slate-600 text-sm mb-4">
            Generate a vendor strategy and talking points for this listing.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            🪄 Generate Vendor Strategy
          </button>
        </section>
      </div>
    </DashboardShell>
  );
}
