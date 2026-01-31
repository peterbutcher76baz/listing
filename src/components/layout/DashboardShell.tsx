import React from 'react';
import { Home, Building2, MessageSquare, PieChart, Settings, LogOut } from 'lucide-react';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const menuItems = [
    { icon: <Home size={20} />, label: 'Overview', active: true },
    { icon: <Building2 size={20} />, label: 'Properties', active: false },
    { icon: <MessageSquare size={20} />, label: 'AI Chats', active: false },
    { icon: <PieChart size={20} />, label: 'Reports', active: false },
    { icon: <Settings size={20} />, label: 'Settings', active: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR - The Navy Anchor */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">RealInfo</h1>
          <p className="text-xs text-slate-400">Agent Command Center</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 text-slate-400 hover:text-white px-4 py-2 w-full">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">Welcome Back, Chris</h2>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              CR
            </div>
          </div>
        </header>

        {/* Dynamic Content Area (Where the properties will appear) */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
