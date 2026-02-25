"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Property } from "@/schemas/property.schema";
import { propertySchema } from "@/schemas/property.schema";

const PERSIST_NAME = "real-state-dash-info-dot-volt";

/**
 * Store alignment with 3NF: This store holds the composite Property type (address, improvements, identity, etc.).
 * It maps to the three DB tables (properties, property_features, locations) via propertyToThreeTables() on save.
 * No separate slices for property_features or locations—the composite Property carries all data for the form/UI.
 */

type IdentitySlice = NonNullable<Property["identity"]>;

type PropertyStore = {
  propertyData: Property | null;
  setPropertyData: (p: Property | null) => void;
  /** DB property ID when viewing/editing a saved property; null = fresh entry (no fetch). */
  activePropertyId: string | null;
  setActivePropertyId: (id: string | null) => void;
  /** Merge identity IDs (e.g. from URL sniff) into propertyData; creates minimal property if null. */
  mergeIdentity: (ids: Partial<IdentitySlice>) => void;
  clearPropertyData: () => void;
  /** Clears propertyData, voiceStyle, activePropertyId in one go so persisted storage is updated for a blank slate. */
  clearAll: () => void;
  voiceStyle: string | null;
  setVoiceStyle: (v: string | null) => void;
  /** Reference listing text for agent voice training (Voice Profile tab). */
  agentVoiceReference: string | null;
  setAgentVoiceReference: (v: string | null) => void;
  /** Generated AI narrative output, shown in Listing Brief Property Narrative. */
  propertyNarrative: string | null;
  setPropertyNarrative: (v: string | null) => void;
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
      activePropertyId: null,
      setActivePropertyId: (id) => set({ activePropertyId: id }),
      mergeIdentity: (ids) =>
        set((state) => {
          const nextIdentity = { ...state.propertyData?.identity, ...ids };
          if (state.propertyData) {
            return { propertyData: { ...state.propertyData, identity: nextIdentity } };
          }
          const minimal: Property = {
            propertyId: "",
            address: { StreetNumber: "", StreetName: "", City: "", StateOrProvince: "", PostalCode: "", Country: "AU" },
            improvements: {},
            land: {},
            OfficialBrand: "Place P",
            identity: nextIdentity,
          } as Property;
          const parsed = propertySchema.safeParse(minimal);
          return { propertyData: parsed.success ? parsed.data : minimal };
        }),
      clearPropertyData: () => set({ propertyData: null }),
      clearAll: () => {
        if (typeof window !== "undefined") {
          usePropertyStore.persist.clearStorage();
        }
        set({ propertyData: null, voiceStyle: null, agentVoiceReference: null, propertyNarrative: null, styleLevel: 50, activePropertyId: null });
      },
      voiceStyle: null,
      setVoiceStyle: (v) => set({ voiceStyle: v }),
      agentVoiceReference: null,
      setAgentVoiceReference: (v) => set({ agentVoiceReference: v }),
      propertyNarrative: null,
      setPropertyNarrative: (v) => set({ propertyNarrative: v }),
      styleLevel: 50,
      setStyleLevel: (n) => set({ styleLevel: Math.max(0, Math.min(100, n)) }),
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: PERSIST_NAME,
      version: 2, // Bump to invalidate cached data when switching databases
      migrate: (persistedState, _fromVersion) => {
        // When migrating from v0 (or any older version), clear propertyData to prevent ghost demo data
        const s = persistedState as Record<string, unknown>;
        if (s && typeof s === "object" && "propertyData" in s) {
          return { ...s, propertyData: null, activePropertyId: null };
        }
        return persistedState ?? {};
      },
      partialize: (state) => ({
        propertyData: state.propertyData,
        voiceStyle: state.voiceStyle,
        agentVoiceReference: state.agentVoiceReference,
        propertyNarrative: state.propertyNarrative,
        styleLevel: state.styleLevel,
        activePropertyId: state.activePropertyId,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (err) console.warn("[real-state-dash-info-dot-volt] rehydration error", err);
        // Normalize propertyData from schema so persisted data has ParkingCount, parkingMetadata, OfficialBrand.
        // No demo/mock data: only restore what was validly persisted. If parse fails, clear to prevent ghost data.
        if (state?.propertyData != null) {
          const normalized = normalizePersistedProperty(state.propertyData);
          requestAnimationFrame(() => {
            const store = usePropertyStore.getState();
            if (normalized) store.setPropertyData(normalized);
            else store.setPropertyData(null); // Invalid/corrupt persisted data — clear it
          });
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
