"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
  Building2,
  MessageSquare,
  PieChart,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { icon: <Home size={20} />, label: "Overview", active: true },
    { icon: <Building2 size={20} />, label: "Properties", active: false },
    { icon: <MessageSquare size={20} />, label: "AI Chats", active: false },
    { icon: <PieChart size={20} />, label: "Reports", active: false },
    { icon: <Settings size={20} />, label: "Settings", active: false },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="no-print w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight font-sans">RealInfo</h1>
          <p className="text-xs text-sidebar-foreground/70 font-sans">Agent Command Centre</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button className="flex items-center space-x-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent px-4 py-2 w-full rounded-lg transition-colors">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

<main className="flex-1 overflow-y-auto bg-background">
          <header className="no-print h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-card-foreground font-sans">
            Welcome Back, Chris
          </h2>
          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Login
            </Link>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              CR
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
