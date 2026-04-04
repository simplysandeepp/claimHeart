"use client";

import { useSyncExternalStore } from "react";
import type { Claim } from "@/types/claim";

type ClaimStoreState = {
  claims: Claim[];
  selectedClaim: Claim | null;
  hydrated: boolean;
};

let state: ClaimStoreState = {
  claims: [],
  selectedClaim: null,
  hydrated: false,
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (nextState: Partial<ClaimStoreState>) => {
  state = { ...state, ...nextState };
  emit();
};

export const claimStoreActions = {
  setClaims(claims: Claim[]) {
    const selectedClaim = state.selectedClaim
      ? claims.find((claim) => claim.id === state.selectedClaim?.id) ?? null
      : null;

    setState({ claims, selectedClaim, hydrated: true });
  },
  selectClaim(claim: Claim | null) {
    setState({ selectedClaim: claim });
  },
  updateClaim(updatedClaim: Claim) {
    const claims = state.claims.map((claim) => (claim.id === updatedClaim.id ? updatedClaim : claim));
    setState({
      claims,
      selectedClaim: state.selectedClaim?.id === updatedClaim.id ? updatedClaim : state.selectedClaim,
    });
  },
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => state;

export const useClaimStore = <T,>(selector: (snapshot: ClaimStoreState) => T) => {
  return useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getSnapshot()));
};

