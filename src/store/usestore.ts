"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Property } from "@/schemas/property.schema";

const PERSIST_NAME = "real-state-dash-info-dot-volt";

type PropertyStore = {
  propertyData: Property | null;
  setPropertyData: (p: Property | null) => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set) => ({
      propertyData: null,
      setPropertyData: (p) => set({ propertyData: p }),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: PERSIST_NAME,
      partialize: (state) => ({ propertyData: state.propertyData }),
      onRehydrateStorage: () => (state, err) => {
        if (err) console.warn("[real-state-dash-info-dot-volt] rehydration error", err);
        usePropertyStore.getState().setHasHydrated(true);
      },
    }
  )
);

/** Use this to wait until the persisted store has loaded from localStorage before rendering. */
export function useStoreHydrated(): boolean {
  return usePropertyStore((s) => s._hasHydrated);
}
