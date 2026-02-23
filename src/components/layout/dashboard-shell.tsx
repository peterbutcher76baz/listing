"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Mic,
  FileText,
  PenLine,
  Settings,
  LogOut,
  FilePlus,
  LayoutDashboard,
} from "lucide-react";
import { usePropertyStore } from "@/store/usestore";
import { useVoiceSettings, clearVoiceStorage } from "@/contexts/listing-context";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/landingPage", icon: Home, label: "Home" },
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/property-entry", icon: PenLine, label: "Property Entry" },
  { href: "/listing-style-selection", icon: Mic, label: "Listing Style Selection" },
  { href: "/listing-generator", icon: FileText, label: "Listing Generator" },
  { href: "/agent-style-training", icon: Settings, label: "Agent Style Training" },
] as const;

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAll = usePropertyStore((s) => s.clearAll);
  const { setVoice } = useVoiceSettings();

  /** Clears all property and agent state, then redirects to property entry for a fresh start. */
  const resetState = useCallback(() => {
    clearAll();
    clearVoiceStorage();
    setVoice({ styleId: null, styleIntensity: 50 });
    router.replace("/property-entry");
  }, [clearAll, setVoice, router]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="no-print w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight font-sans">RealInfo</h1>
          <p className="text-xs text-sidebar-foreground/70 font-sans">Agent Command Centre</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-sans ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button className="flex items-center space-x-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent px-4 py-2 w-full rounded-lg transition-colors font-sans">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

<main className="flex-1 flex flex-col min-h-0 bg-background">
          <header className="no-print shrink-0 h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/landingPage"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              title="Return to landing page"
            >
              <Home size={18} />
              Home
            </Link>
            <h2 className="text-lg font-bold text-card-foreground font-sans">
              Welcome Back
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={resetState}
              className="bg-[#007BFF] hover:bg-[#007BFF]/90"
            >
              <FilePlus size={16} className="mr-1.5" />
              New listing
            </Button>
            <Link
              href="/agent-style-training"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Login
            </Link>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              CR
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 min-h-0">{children}</div>
      </main>
    </div>
  );
}
