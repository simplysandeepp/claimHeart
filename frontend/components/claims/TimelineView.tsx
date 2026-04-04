"use client";

import { motion } from "framer-motion";
import { actorDotClasses, formatDateTime, formatRelativeTime } from "@/lib/claimUi";
import usePageReady from "@/hooks/usePageReady";
import type { TimelineEntry } from "@/types";

export default function TimelineView({ timeline }: { timeline: TimelineEntry[] }) {
  const ready = usePageReady();

  return (
    <div className="space-y-3">
      {timeline.map((entry, index) => (
        <motion.div
          key={`${entry.time}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: index * 0.05, ease: "easeOut" }}
          className="grid grid-cols-[18px_minmax(0,1fr)] gap-3"
        >
          <div className="flex flex-col items-center">
            <motion.span
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18, delay: index * 0.05 }}
              className={`mt-1 h-3 w-3 rounded-full ${actorDotClasses[entry.actor]}`}
            />
            {index < timeline.length - 1 ? <span className="mt-2 h-full w-px bg-slate-200" /> : null}
          </div>

          <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
            <p className="text-sm font-semibold leading-6 text-slate-900">{entry.label}</p>
            <p className="mt-1 text-xs capitalize text-[var(--ch-muted)]">{entry.actor} · {ready ? formatRelativeTime(entry.time) : formatDateTime(entry.time)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
