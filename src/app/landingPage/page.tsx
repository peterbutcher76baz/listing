import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewListingButton } from "@/components/new-listing-button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-sans">
          RealInfo
        </h1>
        <p className="text-lg text-slate-600 font-sans">
          Agent Command Centre — RESO-compliant listing generator, property gallery, and vendor strategy tools for agents.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-[#007BFF] hover:bg-[#007BFF]/90 font-sans">
            <Link href="/">
              Enter Dashboard
              <ArrowRight className="ml-2 size-5" aria-hidden />
            </Link>
          </Button>
          <NewListingButton variant="outline" size="lg" className="font-sans" />
        </div>
      </div>
    </div>
  );
}
