import DashboardShell from "@/components/layout/DashboardShell";
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
        
        <div className="mt-8 grid gap-4">
          {properties.map(p => (
            <div key={p.id} className="p-4 border-2 border-slate-800 rounded">
              {p.address} - {p.suburb}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
