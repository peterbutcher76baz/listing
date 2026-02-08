"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Property } from "@/schemas/property.schema";

const PERSIST_NAME = "real-state-dash-info-dot-volt";

type PropertyStore = {
  propertyData: Property | null;
  setPropertyData: (p: Property | null) => void;
  clearPropertyData: () => void;
  /** Clears propertyData and voiceStyle in one go so persisted storage is updated for a blank slate. */
  clearAll: () => void;
  voiceStyle: string | null;
  setVoiceStyle: (v: string | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set) => ({
      propertyData: null,
      setPropertyData: (p) => set({ propertyData: p }),
      clearPropertyData: () => set({ propertyData: null }),
      clearAll: () => set({ propertyData: null, voiceStyle: null }),
      voiceStyle: null,
      setVoiceStyle: (v) => set({ voiceStyle: v }),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: PERSIST_NAME,
      partialize: (state) => ({ propertyData: state.propertyData, voiceStyle: state.voiceStyle }),
      onRehydrateStorage: () => (state, err) => {
        if (err) console.warn("[real-state-dash-info-dot-volt] rehydration error", err);
        // Mark hydrated when rehydration finishes (state may be undefined if nothing was stored)
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
