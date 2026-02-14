"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Property } from "@/schemas/property.schema";
import { propertySchema } from "@/schemas/property.schema";

const PERSIST_NAME = "real-state-dash-info-dot-volt";

type PropertyStore = {
  propertyData: Property | null;
  setPropertyData: (p: Property | null) => void;
  clearPropertyData: () => void;
  /** Clears propertyData and voiceStyle in one go so persisted storage is updated for a blank slate. */
  clearAll: () => void;
  voiceStyle: string | null;
  setVoiceStyle: (v: string | null) => void;
  styleLevel: number;
  setStyleLevel: (n: number) => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

/** Normalize rehydrated property data so ParkingCount, parkingMetadata, OfficialBrand exist and data is not lost on refresh. */
function normalizePersistedProperty(raw: unknown): Property | null {
  if (raw == null) return null;
  const parsed = propertySchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set) => ({
      propertyData: null,
      setPropertyData: (p) => set({ propertyData: p }),
      clearPropertyData: () => set({ propertyData: null }),
      clearAll: () => set({ propertyData: null, voiceStyle: null, styleLevel: 50 }),
      voiceStyle: null,
      setVoiceStyle: (v) => set({ voiceStyle: v }),
      styleLevel: 50,
      setStyleLevel: (n) => set({ styleLevel: Math.max(0, Math.min(100, n)) }),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: PERSIST_NAME,
      partialize: (state) => ({ propertyData: state.propertyData, voiceStyle: state.voiceStyle, styleLevel: state.styleLevel }),
      onRehydrateStorage: () => (state, err) => {
        if (err) console.warn("[real-state-dash-info-dot-volt] rehydration error", err);
        // Normalize propertyData from schema so persisted data has ParkingCount, parkingMetadata, OfficialBrand
        if (state?.propertyData != null) {
          const normalized = normalizePersistedProperty(state.propertyData);
          if (normalized) requestAnimationFrame(() => usePropertyStore.getState().setPropertyData(normalized));
        }
        requestAnimationFrame(() => {
          usePropertyStore.getState().setHasHydrated(true);
        });
      },
      skipHydration: false,
    }
  )
);

/** Use this to wait until the persisted store has loaded from localStorage before rendering. */
export function useStoreHydrated(): boolean {
  return usePropertyStore((s) => s._hasHydrated);
}
