"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import type { Property } from "@/schemas/property.schema";

export const ANTIPODEAN_STYLES = [
  { id: "coastal", label: "Coastal" },
  { id: "heritage", label: "Heritage" },
  { id: "urban", label: "Urban" },
  { id: "bush", label: "Bush" },
] as const;

export type VoiceSettings = {
  styleId: string | null;
  styleIntensity: number;
};

type PropertyEntryContextValue = {
  property: Property | null;
  setProperty: (p: Property | null) => void;
};

type VoiceSettingsContextValue = {
  voice: VoiceSettings;
  setVoice: (v: VoiceSettings | ((prev: VoiceSettings) => VoiceSettings)) => void;
};

const PropertyEntryContext = createContext<PropertyEntryContextValue | null>(null);
const VoiceSettingsContext = createContext<VoiceSettingsContextValue | null>(null);

const VOICE_STORAGE_KEY = "realinfo-voice-settings";

function loadVoiceFromStorage(): VoiceSettings {
  if (typeof window === "undefined")
    return { styleId: null, styleIntensity: 50 };
  try {
    const raw = localStorage.getItem(VOICE_STORAGE_KEY);
    if (!raw) return { styleId: null, styleIntensity: 50 };
    const parsed = JSON.parse(raw) as VoiceSettings;
    return {
      styleId: parsed.styleId ?? null,
      styleIntensity: typeof parsed.styleIntensity === "number" ? Math.max(0, Math.min(100, parsed.styleIntensity)) : 50,
    };
  } catch {
    return { styleId: null, styleIntensity: 50 };
  }
}

export function ListingProviders({ children }: { children: React.ReactNode }) {
  const [property, setPropertyState] = useState<Property | null>(null);
  const [voice, setVoiceState] = useState<VoiceSettings>(loadVoiceFromStorage);

  const setProperty = useCallback((p: Property | null) => {
    setPropertyState(p);
  }, []);

  const setVoice = useCallback((v: VoiceSettings | ((prev: VoiceSettings) => VoiceSettings)) => {
    setVoiceState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      if (typeof window !== "undefined")
        localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <PropertyEntryContext.Provider value={{ property, setProperty }}>
      <VoiceSettingsContext.Provider value={{ voice, setVoice }}>
        {children}
      </VoiceSettingsContext.Provider>
    </PropertyEntryContext.Provider>
  );
}

export function usePropertyEntry() {
  const ctx = useContext(PropertyEntryContext);
  if (!ctx) throw new Error("usePropertyEntry must be used within ListingProviders");
  return ctx;
}

export function useVoiceSettings() {
  const ctx = useContext(VoiceSettingsContext);
  if (!ctx) throw new Error("useVoiceSettings must be used within ListingProviders");
  return ctx;
}
