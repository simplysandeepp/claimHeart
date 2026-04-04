"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { addClaimComment, buildDecisionLetter } from "@/lib/api/claims";
import AgentResultCard from "@/components/claims/AgentResultCard";
import StatusBadge from "@/components/claims/StatusBadge";
import TimelineView from "@/components/claims/TimelineView";
import type { AppUser, NotifTarget, UserRole } from "@/types";

export default function ClaimDrawer({ claimId, role, isOpen, onClose, user }: { claimId: string | null; role: UserRole; isOpen: boolean; onClose: () => void; user: AppUser | null }) {
  const claim = useAppStore((state) => state.claims.find((entry) => entry.id === claimId) ?? null);
  const [comment, setComment] = useState("");
  const visibleComments = useMemo(() => !claim ? [] : claim.comments.filter((entry) => entry.visibleTo.includes(role) || entry.visibleTo.includes("all")), [claim, role]);

  const submitComment = async () => {
    if (!claim || !comment.trim() || !user) return;
    const visibleTo: NotifTarget[] = role === "patient" ? ["patient", "insurer"] : role === "hospital" ? ["hospital", "insurer"] : ["insurer", "hospital", "patient"];
    await addClaimComment(claim.id, { text: comment, author: user.name, role, visibleTo });
    setComment("");
  };

  return (
    <AnimatePresence>
      {isOpen && claim ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35 backdrop-blur-[2px]">
          <button type="button" className="flex-1 cursor-default" onClick={onClose} aria-label="Close drawer" />
          <motion.div initial={{ x: 40, opacity: 0.98 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0.98 }} transition={{ duration: 0.24, ease: "easeOut" }} className="h-full w-full overflow-y-auto border-l border-slate-200 bg-[var(--ch-surface)] shadow-[-24px_0_60px_rgba(15,23,42,0.18)] md:max-w-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
              <div>
                <p className="text-sm font-semibold text-[var(--ch-blue)]">{claim.id}</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">{claim.patientName}</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">{claim.hospital}</p>
              </div>
              <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-50"><X className="h-4 w-4" /></motion.button>
            </div>

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-[var(--ch-subtle)]">Requested Amount</p><p className="mt-2 text-xl font-bold text-slate-900">Rs {claim.amount.toLocaleString("en-IN")}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-[var(--ch-subtle)]">Status</p><div className="mt-2"><StatusBadge status={claim.status} /></div></div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm text-[var(--ch-subtle)]">Risk Score</p><p className="mt-2 text-xl font-bold text-slate-900">{claim.riskScore}/100</p></div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">AI Agent Results</h3>
                <div className="mt-5 grid gap-4"><AgentResultCard agentName="Policy Agent" status={claim.aiResults.policy.status} reason={claim.aiResults.policy.reason} /><AgentResultCard agentName="Medical Agent" status={claim.aiResults.medical.status} reason={claim.aiResults.medical.reason} /><AgentResultCard agentName="Cross-Check Agent" status={claim.aiResults.cross.status} reason={claim.aiResults.cross.reason} /></div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">Timeline</h3><div className="mt-5"><TimelineView timeline={claim.timeline} /></div></div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">Documents</h3><div className="mt-5 space-y-3">{claim.documents.map((document) => <div key={`${document.name}-${document.uploadedAt}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><p className="break-words font-semibold text-slate-900">{document.name}</p><p className="mt-1 text-sm text-[var(--ch-muted)]">{document.uploadedBy} · {Math.max(1, Math.round(document.size / 1024))} KB</p></div>)}</div></div>
              </div>

              {role === "patient" ? <div className="rounded-[1.75rem] border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] p-5 sm:p-6"><h3 className="text-xl font-bold tracking-[-0.03em] text-[var(--ch-blue-dark)]">Decision Letter</h3><pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{buildDecisionLetter(claim)}</pre></div> : null}

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">Comments</h3>
                <div className="mt-5 space-y-4">{visibleComments.length === 0 ? <p className="text-sm text-[var(--ch-muted)]">No visible comments yet.</p> : visibleComments.map((entry) => <div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><p className="text-sm leading-6 text-slate-800">{entry.text}</p><p className="mt-2 text-xs text-[var(--ch-muted)]">{entry.author} · {entry.role}</p></div>)}</div>
                {role !== "insurer" ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a note for the insurer" className="h-10 flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-12 sm:py-3 sm:text-base" /><motion.button whileTap={{ scale: 0.98 }} type="button" onClick={submitComment} className="h-10 rounded-2xl bg-[var(--ch-blue)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-95 sm:h-12 sm:py-3">Send</motion.button></div> : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
