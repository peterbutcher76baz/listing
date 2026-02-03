
'use client';

import React, { useState } from "react";
// Path 1: Looking in app/components
import DashboardShell from "@/components/layout/dashboard-shell";
// Path 2: Looking in the standard components folder (dropping the /app)
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [voiceText, setVoiceText] = useState("");

  const handleSave = () => {
    alert("Signature Voice Saved to Profile!");
  };

  return (
    <DashboardShell>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Agent Settings</h1>
        </header>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-navy-900">My Signature Voice</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <textarea
              className="w-full min-h-[300px] p-4 rounded-md border border-slate-200 bg-white text-slate-900"
              placeholder="Paste your best listing samples here..."
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                className="bg-[#001f3f] hover:bg-[#003366] text-white"
              >
                Save Style Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
