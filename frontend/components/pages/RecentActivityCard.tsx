"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { actorDotClasses, formatDateTime, formatRelativeTime } from "@/lib/claimUi";
import usePageReady from "@/hooks/usePageReady";
import type { Claim, UserRole } from "@/types";

function getRoleClaims(claims: Claim[], role: UserRole, identity?: string) {
  if (role === "patient") return claims.filter((claim) => claim.patientId === identity);
  if (role === "hospital") return claims.filter((claim) => claim.hospital === identity);
  return claims;
}

export default function RecentActivityCard({ role, identity }: { role: UserRole; identity?: string }) {
  const ready = usePageReady();
  const claims = useAppStore((state) => state.claims);
  const entries = useMemo(() => getRoleClaims(claims, role, identity)
    .flatMap((claim) => claim.timeline.map((entry) => ({ ...entry, claimId: claim.id })))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5), [claims, identity, role]);

  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
      <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Recent Activity</h2>
      <div className="mt-5 space-y-4">
        {entries.length === 0 ? <p className="text-sm text-[var(--ch-muted)]">No recent activity yet.</p> : entries.map((entry, index) => (
          <motion.div key={`${entry.claimId}-${entry.time}-${entry.label}-${index}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }} className="flex gap-3">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${actorDotClasses[entry.actor]}`} />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-6 text-slate-800">{entry.label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--ch-muted)]">
                <span>{ready ? formatRelativeTime(entry.time) : formatDateTime(entry.time)}</span>
                <Link href={role === "insurer" ? `/dashboard/insurer/review/${entry.claimId}` : `/dashboard/${role}/claims/${entry.claimId}`} className="font-semibold text-[var(--ch-blue)] transition-all hover:opacity-80">
                  {entry.claimId}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}
