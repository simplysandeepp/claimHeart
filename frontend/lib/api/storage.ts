"use client";

const hasWindow = () => typeof window !== "undefined";

export const readStorage = <T>(key: string, fallback: T): T => {
  if (!hasWindow()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

export const writeStorage = <T>(key: string, value: T) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};
