import Link from "next/link";
import DashboardShell from "@/components/layout/dashboard-shell";
import { getAgentProperties } from "@/lib/actions/properties";

export default async function Page() {
  const properties = await getAgentProperties("chris@realinfo.au");

  return (
    <DashboardShell>
      <div className="p-4">
        <h1 className="text-4xl font-bold text-blue-900 underline">
          REALINFO DASHBOARD IS LIVE
        </h1>
        <p className="mt-4 text-xl">Found {properties.length} properties for Chris.</p>
        <div className="mt-4">
          <Link
            href="/settings"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Get started
          </Link>
        </div>
        
        <div className="mt-8 grid gap-4">
          {properties.map((p) => (
            <div key={p.id} className="p-4 border-2 border-slate-800 rounded flex items-center justify-between">
              <span>{p.address} – {p.suburb}</span>
              <Link
                href={`/properties/${p.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
