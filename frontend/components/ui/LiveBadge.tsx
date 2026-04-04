"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function LiveBadge() {
  const lastSyncAt = useAppStore((state) => state.lastSyncAt);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!lastSyncAt) {
      return;
    }

    setFlash(true);
    const timer = window.setTimeout(() => setFlash(false), 900);
    return () => window.clearTimeout(timer);
  }, [lastSyncAt]);

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${flash ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-600"}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${flash ? "animate-pulse-dot bg-green-500" : "bg-green-500"}`} />
      Live
    </div>
  );
}
