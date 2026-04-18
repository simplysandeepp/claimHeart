"use client";

import { create } from "zustand";
import type { Claim, Notification } from "@/types";

const CLAIMS_KEY = "claims";
const NOTIFICATIONS_KEY = "notifications";

const dedupeById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
};

interface AppStore {
  claims: Claim[];
  claimsLoading: boolean;
  claimsError: string | null;
  notifications: Notification[];
  lastSyncAt: number;
  setClaims: (claims: Claim[]) => void;
  setClaimsLoading: (loading: boolean) => void;
  setClaimsError: (message: string | null) => void;
  addClaim: (claim: Claim) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: string, userId?: string) => void;
  syncFromStorage: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  claims: [],
  claimsLoading: false,
  claimsError: null,
  notifications: [],
  lastSyncAt: 0,

  setClaims: (claims: Claim[]) => {
    const updated = dedupeById(claims);
    set({ claims: updated, claimsError: null, lastSyncAt: Date.now() });
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));
  },

  setClaimsLoading: (claimsLoading: boolean) => {
    set({ claimsLoading });
  },

  setClaimsError: (claimsError: string | null) => {
    set({ claimsError, lastSyncAt: Date.now() });
  },

  addClaim: (claim: Claim) => {
    const updated = dedupeById([claim, ...get().claims]);
    set({ claims: updated, lastSyncAt: Date.now() });
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));
  },

  updateClaim: (id: string, updates: Partial<Claim>) => {
    const updated = dedupeById(get().claims.map((claim) => (claim.id === id ? { ...claim, ...updates } : claim)));
    set({ claims: updated, lastSyncAt: Date.now() });
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(updated));
  },

  setNotifications: (notifications: Notification[]) => {
    set({ notifications: dedupeById(notifications), lastSyncAt: Date.now() });
  },

  addNotification: (notification: Notification) => {
    const updated = dedupeById([notification, ...get().notifications]);
    set({ notifications: updated, lastSyncAt: Date.now() });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  markNotificationRead: (id: string) => {
    const alreadyRead = get().notifications.find((notification) => notification.id === id)?.read;
    if (alreadyRead) {
      return;
    }

    const updated = get().notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    set({ notifications: updated, lastSyncAt: Date.now() });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  markAllNotificationsRead: (role: string, userId?: string) => {
    const updated = get().notifications.map((notification) => {
      const matchesRole = notification.targetRole === role || notification.targetRole === "all";
      const matchesUser = !notification.targetUserId || notification.targetUserId === userId;
      return matchesRole && matchesUser ? { ...notification, read: true } : notification;
    });

    set({ notifications: updated, lastSyncAt: Date.now() });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  },

  syncFromStorage: () => {
    const claims = dedupeById(JSON.parse(localStorage.getItem(CLAIMS_KEY) || "[]") as Claim[]);
    const notifications = dedupeById(JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]") as Notification[]);
    set({ claims, notifications, lastSyncAt: Date.now() });
  },
}));
