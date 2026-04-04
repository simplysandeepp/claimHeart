"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MotionCard from "@/components/ui/MotionCard";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import { useAppStore } from "@/store/useAppStore";
import { isNewClaim } from "@/lib/claimUi";
import StatusBadge from "@/components/claims/StatusBadge";
import type { ClaimStatus } from "@/types";

const filters: { label: string; value: "all" | ClaimStatus }[] = [
  { label: "All Claims", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Under Review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
];

export default function ClaimsQueuePage() {
  const claims = useAppStore((state) => state.claims);
  const ready = usePageReady();
  const [activeFilter, setActiveFilter] = useState<"all" | ClaimStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const filteredClaims = useMemo(() => claims.filter((claim) => {
    const matchesFilter = activeFilter === "all" || claim.status === activeFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = q.length === 0 || claim.id.toLowerCase().includes(q) || claim.patientName.toLowerCase().includes(q) || claim.hospital.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  }), [activeFilter, claims, search]);

  if (!ready) {
    return (
      <div className="space-y-6">
        <div className="space-y-3"><SkeletonBlock className="h-9 w-56" /><SkeletonBlock className="h-5 w-80" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} lines={2} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.04em] text-slate-900 sm:text-3xl md:text-[2.1rem]">Claims Queue</h1>
        <p className="mt-2 text-sm text-[var(--ch-muted)] sm:text-base md:text-lg">Live insurer queue. New hospital submissions appear automatically.</p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            const count = filter.value === "all" ? claims.length : claims.filter((claim) => claim.status === filter.value).length;
            return (
              <button key={filter.value} type="button" onClick={() => setActiveFilter(filter.value)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${active ? "border-[var(--ch-blue)] bg-[var(--ch-blue)] text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                {filter.label} <span className={`ml-1 rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-[var(--ch-blue)]"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims, patients..." className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-12 xl:max-w-xs" />
      </div>

      <div className="hidden overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:block">
        <div className="grid grid-cols-[1.1fr_1.15fr_1.15fr_0.85fr_0.85fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span>Claim ID</span><span>Patient</span><span>Hospital</span><span>Status</span><span>Action</span>
        </div>
        <div>
          {filteredClaims.map((claim) => {
            const selected = selectedClaimId === claim.id;
            return (
              <div key={claim.id} onMouseEnter={() => setSelectedClaimId(claim.id)} className={`grid cursor-pointer grid-cols-[1.1fr_1.15fr_1.15fr_0.85fr_0.85fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm transition-all last:border-b-0 ${selected ? "bg-[var(--ch-blue-light)]" : "hover:bg-slate-50"}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--ch-blue)]">{claim.id}</p>
                    {isNewClaim(claim.submittedAt) ? <span className="rounded-full bg-[var(--ch-blue-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ch-blue-dark)]">New</span> : null}
                  </div>
                  <p className="mt-1 text-[var(--ch-subtle)]">Rs {claim.amount.toLocaleString("en-IN")}</p>
                </div>
                <div><p className="font-semibold text-slate-900">{claim.patientName}</p><p className="mt-1 text-[var(--ch-subtle)]">{claim.diagnosis}</p></div>
                <div><p className="font-medium text-slate-900">{claim.hospital}</p><p className="mt-1 text-[var(--ch-subtle)]">Risk {claim.riskScore}/100</p></div>
                <div><StatusBadge status={claim.status} /></div>
                <div><Link href={`/dashboard/insurer/review/${claim.id}`} className="text-sm font-semibold text-[var(--ch-blue)] transition-all hover:opacity-80">Review</Link></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {filteredClaims.map((claim) => (
          <MotionCard key={`mobile-${claim.id}`} className={`rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${selectedClaimId === claim.id ? "ring-2 ring-[var(--ch-blue-border)]" : ""}`}>
            <div onMouseEnter={() => setSelectedClaimId(claim.id)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><p className="font-semibold text-[var(--ch-blue)]">{claim.id}</p>{isNewClaim(claim.submittedAt) ? <span className="rounded-full bg-[var(--ch-blue-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--ch-blue-dark)]">New</span> : null}</div>
                  <p className="mt-1 text-sm text-[var(--ch-muted)]">{claim.patientName}</p>
                </div>
                <StatusBadge status={claim.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[var(--ch-subtle)]">Hospital</p><p className="mt-1 font-medium text-slate-900">{claim.hospital}</p></div>
                <div><p className="text-[var(--ch-subtle)]">Amount</p><p className="mt-1 font-medium text-slate-900">Rs {claim.amount.toLocaleString("en-IN")}</p></div>
              </div>
              <Link href={`/dashboard/insurer/review/${claim.id}`} className="mt-4 inline-flex h-10 items-center rounded-2xl bg-[var(--ch-blue)] px-4 text-sm font-semibold text-white transition-all hover:opacity-95 sm:h-12">View Claim</Link>
            </div>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
