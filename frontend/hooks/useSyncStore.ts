"use client";

import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";

export function useSyncStore() {
  useEffect(() => {
    const syncFromStorage = useAppStore.getState().syncFromStorage;

    seedIfEmpty();
    syncFromStorage();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "claims" || event.key === "notifications") {
        useAppStore.getState().syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
}
