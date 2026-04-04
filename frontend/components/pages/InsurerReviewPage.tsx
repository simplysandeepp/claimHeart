"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { addClaimComment, buildDecisionLetter, recordDecision, requestMoreDocuments } from "@/lib/api/claims";
import { getCurrentUser } from "@/lib/api/auth";
import AgentResultCard from "@/components/claims/AgentResultCard";
import StatusBadge from "@/components/claims/StatusBadge";
import TimelineView from "@/components/claims/TimelineView";
import MotionCard from "@/components/ui/MotionCard";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import type { AppUser, NotifTarget } from "@/types";

export default function InsurerReviewPage({ claimId }: { claimId: string }) {
  const claim = useAppStore((state) => state.claims.find((entry) => entry.id === claimId) ?? null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentVisibility, setCommentVisibility] = useState<"internal" | "public">("internal");
  const ready = usePageReady();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const visibleComments = useMemo(() => claim?.comments.filter((entry) => entry.visibleTo.includes("insurer") || entry.visibleTo.includes("all")) ?? [], [claim]);

  if (!ready) {
    return <div className="space-y-6"><SkeletonBlock className="h-9 w-56" /><div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div className="space-y-6"><SkeletonCard lines={4} /><SkeletonCard lines={3} /></div><div className="space-y-6"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div></div></div>;
  }

  if (!claim) return <div className="text-sm text-[var(--ch-muted)]">Claim not found.</div>;

  const saveDecision = async (status: "approved" | "denied" | "under_review") => {
    await recordDecision(claim.id, status, decisionNote || undefined);
    toast.success(status === "approved" ? "Claim Approved" : status === "denied" ? "Claim Denied" : "Claim moved to review");
  };

  const sendRequest = async () => {
    if (!requestNote.trim()) {
      toast.error("Enter the requested documents first.");
      return;
    }
    await requestMoreDocuments(claim.id, requestNote);
    setRequestNote("");
    toast.success("Request sent. Patient and hospital have been notified.");
  };

  const addComment = async () => {
    if (!commentText.trim() || !user) return;
    const visibleTo: NotifTarget[] = commentVisibility === "internal" ? ["insurer"] : ["insurer", "hospital", "patient"];
    await addClaimComment(claim.id, { text: commentText, author: user.name, role: "insurer", visibleTo });
    setCommentText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ch-blue)]">{claim.id}</p>
          <h1 className="mt-2 text-[1.9rem] font-bold tracking-[-0.04em] text-slate-900 sm:text-[2.1rem]">{claim.patientName}</h1>
          <p className="mt-2 text-sm text-[var(--ch-muted)] sm:text-base md:text-lg">{claim.hospital} · {claim.diagnosis}</p>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <MotionCard className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">AI Agent Results</h2>
            <div className="mt-5 space-y-4">{[claim.aiResults.policy, claim.aiResults.medical, claim.aiResults.cross].map((result, index) => <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: index * 0.06 }}><AgentResultCard agentName={["Policy Agent", "Medical Agent", "Cross-Check Agent"][index]} status={result.status} reason={result.reason} /></motion.div>)}</div>
          </MotionCard>

          <MotionCard className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Documents</h2>
            <div className="mt-5 space-y-3">{claim.documents.map((document) => <div key={`${document.name}-${document.uploadedAt}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-all hover:bg-white"><p className="break-words font-semibold text-slate-900">{document.name}</p><p className="mt-1 text-sm text-[var(--ch-muted)]">{document.uploadedBy} · {document.type}</p></div>)}</div>
          </MotionCard>

          <MotionCard className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Comments</h2>
            <p className="mt-1 text-sm text-[var(--ch-muted)]">Internal notes stay private; public notes are visible to all parties.</p>
            <div className="mt-5 space-y-3">{visibleComments.map((entry) => <div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"><p className="text-sm leading-6 text-slate-800">{entry.text}</p><p className="mt-2 text-xs text-[var(--ch-muted)]">{entry.author} · {entry.visibleTo.join(", ")}</p></div>)}</div>
            <div className="mt-5 space-y-3">
              <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add a comment" className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:text-base" />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <select value={commentVisibility} onChange={(event) => setCommentVisibility(event.target.value as "internal" | "public")} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-12 sm:py-3 sm:text-base"><option value="internal">Internal only</option><option value="public">Visible to all parties</option></select>
                <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={addComment} className="h-10 rounded-2xl bg-[var(--ch-blue)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-95 sm:h-12 sm:py-3">Add Comment</motion.button>
              </div>
            </div>
          </MotionCard>
        </div>

        <div className="space-y-6">
          <MotionCard className="rounded-[1.75rem] border border-[var(--ch-blue-border)] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.06)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Decision</h2>
            <textarea value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} placeholder="Add a decision note" className="mt-5 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:text-base" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => saveDecision("approved")} className="h-10 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-green-700 sm:h-12 sm:py-3">Approve</motion.button>
              <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => saveDecision("denied")} className="h-10 rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 sm:h-12 sm:py-3">Deny</motion.button>
              <motion.button whileTap={{ scale: 0.96 }} type="button" onClick={() => saveDecision("under_review")} className="h-10 rounded-2xl bg-[var(--ch-blue)] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-95 sm:h-12 sm:py-3">Under Review</motion.button>
            </div>
          </MotionCard>

          <MotionCard className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Request Documents</h2>
            <input value={requestNote} onChange={(event) => setRequestNote(event.target.value)} placeholder="What documents do you need?" className="mt-5 h-10 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-12 sm:py-3 sm:text-base" />
            <motion.button whileTap={{ scale: 0.98 }} type="button" onClick={sendRequest} className="mt-4 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 sm:h-12 sm:py-3">Send Request</motion.button>
          </MotionCard>

          <MotionCard className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"><h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Audit Trail</h2><div className="mt-5"><TimelineView timeline={claim.timeline} /></div></MotionCard>
          <MotionCard className="rounded-[1.75rem] border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"><h2 className="text-xl font-bold text-[var(--ch-blue-dark)] md:text-[1.45rem]">Decision Letter Preview</h2><pre className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{buildDecisionLetter(claim)}</pre></MotionCard>
        </div>
      </section>
    </div>
  );
}
