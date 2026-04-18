"use client";

import { useEffect } from "react";
import { getClaims } from "@/lib/api/claims";
import { seedIfEmpty } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";

export function useSyncStore() {
  useEffect(() => {
    const store = useAppStore.getState();
    const syncFromStorage = store.syncFromStorage;

    seedIfEmpty({ includeDemoClaims: false });
    syncFromStorage();

    let cancelled = false;
    const syncClaims = async () => {
      const liveStore = useAppStore.getState();
      liveStore.setClaimsLoading(true);
      liveStore.setClaimsError(null);

      try {
        await getClaims();
        if (!cancelled) {
          useAppStore.getState().setClaimsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Unable to load claims from backend.";
          useAppStore.getState().setClaimsError(message);
        }
      } finally {
        if (!cancelled) {
          useAppStore.getState().setClaimsLoading(false);
        }
      }
    };

    void syncClaims();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "claims" || event.key === "notifications") {
        useAppStore.getState().syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
}
