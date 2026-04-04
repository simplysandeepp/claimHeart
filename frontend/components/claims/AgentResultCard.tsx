"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import type { AgentResult } from "@/types";

type AgentResultCardProps = {
  agentName: string;
  status: AgentResult["status"];
  reason: string;
  confidence?: number;
  highlights?: string[];
  compact?: boolean;
  showTitle?: boolean;
};

const toneMap = {
  pass: {
    border: "border-emerald-200",
    surface: "bg-[linear-gradient(180deg,#ffffff_0%,#f5fbf7_100%)]",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconWrap: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-500",
    icon: CheckCircle2,
    label: "Pass",
  },
  flag: {
    border: "border-rose-200",
    surface: "bg-[linear-gradient(180deg,#ffffff_0%,#fff5f6_100%)]",
    badge: "border-rose-200 bg-rose-50 text-rose-600",
    iconWrap: "bg-rose-100 text-rose-600",
    accent: "bg-rose-500",
    icon: ShieldAlert,
    label: "Flag",
  },
  pending: {
    border: "border-slate-200",
    surface: "bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]",
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    iconWrap: "bg-slate-100 text-slate-500",
    accent: "bg-slate-300",
    icon: Clock3,
    label: "Pending",
  },
} as const;

export default function AgentResultCard({ agentName, status, reason, confidence, highlights, compact = false, showTitle = true }: AgentResultCardProps) {
  const tone = toneMap[status];
  const Icon = tone.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-[1.45rem] border ${tone.border} ${tone.surface} ${compact ? "p-4" : "p-5"} shadow-[0_12px_30px_rgba(15,23,42,0.05)]`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${tone.accent}`} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3 pr-2">
            <div className={`flex ${compact ? "h-10 w-10" : "h-11 w-11"} shrink-0 items-center justify-center rounded-2xl ${tone.iconWrap}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              {showTitle ? <h3 className={`${compact ? "text-base" : "text-lg"} font-bold tracking-[-0.03em] text-slate-900`}>{agentName}</h3> : null}
              <p className={`${showTitle ? "mt-1" : "mt-0.5"} text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ch-subtle)]`}>Decision Rationale</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.badge}`}>
              <Icon className="h-3.5 w-3.5" />
              {tone.label}
            </span>
            {typeof confidence === "number" ? (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                Confidence {confidence}%
              </span>
            ) : null}
          </div>
        </div>

        <p className={`rounded-[1.15rem] border border-white/80 bg-white/80 ${compact ? "px-4 py-3 text-sm leading-6" : "px-4 py-4 text-[15px] leading-7"} text-slate-700 backdrop-blur-sm`}>
          {reason}
        </p>

        {highlights?.length ? (
          <div className="flex flex-wrap gap-2">
            {highlights.map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium leading-5 text-slate-600">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}
