"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckCircle2,
  CircleDashed,
  FileSearch,
  FileText,
  Mail,
  Play,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import MotionCard from "@/components/ui/MotionCard";
import RecentActivityCard from "@/components/pages/RecentActivityCard";
import AgentResultCard from "@/components/claims/AgentResultCard";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import { getCurrentUser } from "@/lib/api/auth";
import { sendDecisionEmail } from "@/lib/api/claims";
import { getDemoCaseById, getLatestWorkflowClaim, resolveViewerForRole, type DemoCaseId } from "@/lib/demoWorkflow";
import { notifyDecisionMade } from "@/lib/api/notifications";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser, Claim, TimelineEntry, WorkflowAuditEntry } from "@/types";

type AgentLaneState = "idle" | "running" | "done";
type ScanStageState = "idle" | "running" | "done";
type ScanStageKey = "ingest" | "rag" | "grounding" | "evidence";

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const finalTone = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  denied: "border-rose-200 bg-rose-50 text-rose-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

const scanStages = [
  { key: "ingest", label: "Document ingestion", helper: "Normalising uploaded files and extracting layout blocks." },
  { key: "rag", label: "RAG retrieval", helper: "Retrieving policy clauses and treatment signals for this claim." },
  { key: "grounding", label: "Policy grounding", helper: "Grounding evidence against dates, diagnosis, and billing context." },
  { key: "evidence", label: "Evidence bundle", helper: "Assembling the final evidence pack for adjudication agents." },
] as const satisfies ReadonlyArray<{ key: ScanStageKey; label: string; helper: string }>;

const createIdleScanState = (): Record<ScanStageKey, ScanStageState> => ({
  ingest: "idle",
  rag: "idle",
  grounding: "idle",
  evidence: "idle",
});

const buildFinalLabel = (claim: Claim) =>
  claim.status === "approved"
    ? "Approved"
    : claim.status === "denied"
      ? "Denied"
      : claim.status === "under_review"
        ? "Under Review"
        : "Queued";

const agentDefinitions = [
  { key: "policy", label: "Policy Agent", helper: "Coverage logic, waiting periods, and benefit rule validation." },
  { key: "medical", label: "Medical Agent", helper: "Clinical consistency, protocol adherence, and treatment justification." },
  { key: "cross", label: "Cross Validation", helper: "Document-to-document consistency and final risk signalling." },
] as const;

export default function DashboardPage() {
  const ready = usePageReady();
  const searchParams = useSearchParams();
  const claims = useAppStore((state) => state.claims);
  const claimsLoading = useAppStore((state) => state.claimsLoading);
  const claimsError = useAppStore((state) => state.claimsError);
  const notifications = useAppStore((state) => state.notifications);
  const updateClaim = useAppStore((state) => state.updateClaim);
  const [viewer, setViewer] = useState<AppUser | null>(null);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [scanState, setScanState] = useState<Record<ScanStageKey, ScanStageState>>(createIdleScanState());
  const [agentState, setAgentState] = useState<Record<"policy" | "medical" | "cross", AgentLaneState>>({
    policy: "idle",
    medical: "idle",
    cross: "idle",
  });
  const [auditEntries, setAuditEntries] = useState<WorkflowAuditEntry[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const runningClaimIdRef = useRef<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setViewer(resolveViewerForRole("insurer", currentUser));
    });
  }, []);

  const workflowClaims = useMemo(
    () => [...claims].filter((claim) => claim.workflowCaseId).sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()),
    [claims],
  );

  const activeClaim = useMemo(() => {
    const fromQuery = searchParams.get("claimId");
    if (fromQuery) {
      return workflowClaims.find((claim) => claim.id === fromQuery) ?? getLatestWorkflowClaim(workflowClaims);
    }

    if (selectedClaimId) {
      return workflowClaims.find((claim) => claim.id === selectedClaimId) ?? workflowClaims[0] ?? null;
    }

    return workflowClaims[0] ?? null;
  }, [searchParams, selectedClaimId, workflowClaims]);

  const activeCase = activeClaim?.workflowCaseId ? getDemoCaseById(activeClaim.workflowCaseId as DemoCaseId) : null;

  useEffect(() => {
    if (!activeClaim) {
      setSelectedClaimId(null);
      setAuditEntries([]);
      setScanState(createIdleScanState());
      setAgentState({ policy: "idle", medical: "idle", cross: "idle" });
      runningClaimIdRef.current = null;
      return;
    }

    setSelectedClaimId(activeClaim.id);
    setAuditEntries(activeClaim.auditTrail ?? []);

    if (activeClaim.pipelineCompletedAt || activeClaim.workflowState === "completed") {
      setScanState({ ingest: "done", rag: "done", grounding: "done", evidence: "done" });
      setAgentState({ policy: "done", medical: "done", cross: "done" });
      runningClaimIdRef.current = null;
    } else if (activeClaim.workflowState === "adjudicating" && runningClaimIdRef.current === activeClaim.id) {
      return;
    } else {
      setScanState(createIdleScanState());
      setAgentState({ policy: "idle", medical: "idle", cross: "idle" });
      runningClaimIdRef.current = null;
    }
  }, [activeClaim]);

  const queueMetrics = useMemo(() => {
    const pending = workflowClaims.filter((claim) => !claim.pipelineCompletedAt && claim.status === "pending").length;
    const underReview = workflowClaims.filter((claim) => claim.status === "under_review").length;
    const approved = workflowClaims.filter((claim) => claim.status === "approved").length;
    const value = workflowClaims.reduce((sum, claim) => sum + claim.amount, 0);
    return { pending, underReview, approved, value };
  }, [workflowClaims]);

  const appendTimeline = (timeline: TimelineEntry[], label: string, actor: TimelineEntry["actor"]): TimelineEntry[] => [
    ...timeline,
    { label, time: new Date().toISOString(), actor },
  ];

  const startPipeline = async () => {
    if (!activeClaim || !activeCase) {
      return;
    }

    if (runningClaimIdRef.current === activeClaim.id || activeClaim.pipelineCompletedAt || activeClaim.workflowState === "completed") {
      return;
    }

    runningClaimIdRef.current = activeClaim.id;

    const appendAudit = (claimId: string, entry: WorkflowAuditEntry) => {
      setAuditEntries((current) => [...current, entry]);
      const latestClaim = useAppStore.getState().claims.find((item) => item.id === claimId);
      updateClaim(claimId, { auditTrail: [...(latestClaim?.auditTrail ?? []), entry] });
    };

    const startTime = new Date().toISOString();
    const baseClaim = useAppStore.getState().claims.find((item) => item.id === activeClaim.id) ?? activeClaim;
    updateClaim(activeClaim.id, {
      workflowState: "adjudicating",
      timeline: appendTimeline(baseClaim.timeline, "Insurer review started", "insurer"),
    });
    appendAudit(activeClaim.id, { time: startTime, label: `Review initiated for ${activeCase.title}.`, level: "info" });

    for (const stage of scanStages) {
      setScanState((current) => ({ ...current, [stage.key]: "running" }));
      appendAudit(activeClaim.id, { time: new Date().toISOString(), label: `${stage.label} running...`, level: "info" });
      await sleep(stage.key === "rag" ? 1500 : 1100);
      setScanState((current) => ({ ...current, [stage.key]: "done" }));
      appendAudit(activeClaim.id, { time: new Date().toISOString(), label: `${stage.label} complete.`, level: "success" });
      await sleep(180);
    }

    const agentStages: Array<{
      key: "policy" | "medical" | "cross";
      label: string;
      waitMs: number;
      timelineLabel: string;
    }> = [
      { key: "policy", label: "Policy eligibility engine", waitMs: 1300, timelineLabel: "Policy review completed" },
      { key: "medical", label: "Medical protocol validator", waitMs: 1500, timelineLabel: "Medical protocol review completed" },
      { key: "cross", label: "Cross-document consistency layer", waitMs: 1200, timelineLabel: "Cross-validation completed" },
    ];

    for (const stage of agentStages) {
      setAgentState((current) => ({ ...current, [stage.key]: "running" }));
      appendAudit(activeClaim.id, { time: new Date().toISOString(), label: `${stage.label} running...`, level: "info" });
      await sleep(stage.waitMs);

      const stageClaim = useAppStore.getState().claims.find((item) => item.id === activeClaim.id) ?? activeClaim;
      updateClaim(activeClaim.id, {
        aiResults: {
          ...stageClaim.aiResults,
          [stage.key]: activeCase.agentResults[stage.key],
        },
        timeline: appendTimeline(stageClaim.timeline, stage.timelineLabel, "system"),
      });
      setAgentState((current) => ({ ...current, [stage.key]: "done" }));
      appendAudit(activeClaim.id, {
        time: new Date().toISOString(),
        label: `${stage.label} ${activeCase.agentResults[stage.key].status === "pass" ? "passed" : "flagged"}: ${activeCase.agentResults[stage.key].reason}`,
        level: activeCase.agentResults[stage.key].status === "pass" ? "success" : "warning",
      });
      await sleep(220);
    }

    const finalClaim = useAppStore.getState().claims.find((item) => item.id === activeClaim.id) ?? activeClaim;
    const completedAt = new Date().toISOString();
    const finalTimelineLabel =
      activeCase.finalStatus === "approved"
        ? "Approved by insurer"
        : activeCase.finalStatus === "denied"
          ? "Denied by insurer"
          : "Moved to manual review by insurer";

    updateClaim(activeClaim.id, {
      status: activeCase.finalStatus,
      amountApproved: activeCase.amountApproved,
      decisionLetter: activeCase.decisionLetter,
      decisionNote: activeCase.decisionNote,
      aiResults: activeCase.agentResults,
      pipelineCompletedAt: completedAt,
      workflowState: "completed",
      timeline: appendTimeline(finalClaim.timeline, finalTimelineLabel, "insurer"),
    });

    appendAudit(activeClaim.id, {
      time: completedAt,
      label: `Pipeline complete. Final decision: ${activeCase.finalDecisionLabel}.`,
      level: activeCase.finalStatus === "approved" ? "success" : activeCase.finalStatus === "denied" ? "warning" : "info",
    });

    notifyDecisionMade(
      {
        id: activeClaim.id,
        amount: activeClaim.amount,
        patientId: activeClaim.patientId,
        patientName: activeClaim.patientName,
      },
      activeCase.finalStatus,
      activeCase.decisionNote,
    );

    runningClaimIdRef.current = null;
  };

  const handleSendEmail = async () => {
    if (!activeClaim || activeClaim.status !== "denied" || sendingEmail) {
      return;
    }

    try {
      setSendingEmail(true);
      const result = await sendDecisionEmail(activeClaim.id);
      if (!result) {
        toast.error("Unable to send the email right now.");
        return;
      }
      toast.success(`Decision email sent to the registered address ${result.email.to}.`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!ready || !viewer || (claimsLoading && claims.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="space-y-3"><SkeletonBlock className="h-9 w-56" /><SkeletonBlock className="h-5 w-80" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} lines={2} />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {claimsError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {claimsError}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#08101c_0%,#12365f_56%,#eef4fb_56%,#f8fafc_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
        <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              <Sparkles className="h-3.5 w-3.5" /> Insurer Command Center
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-white sm:text-[2.6rem]">Sequential review control with clear scanning, grounded evidence, and readable agent decisions.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
              Claims arrive from the hospital desk, then the insurer decides when to begin scanning. Retrieval, policy grounding, and adjudication unfold one stage at a time and update every dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Live Queue", value: queueMetrics.pending, helper: "Claims awaiting review", icon: FileText },
              { label: "Manual Review", value: queueMetrics.underReview, helper: "Flagged for clarification", icon: ShieldAlert },
              { label: "Approved", value: queueMetrics.approved, helper: "Straight-through decisions", icon: CheckCircle2 },
              { label: "Portfolio Value", value: `Rs ${queueMetrics.value.toLocaleString("en-IN")}`, helper: `${notifications.filter((item) => item.targetRole === "insurer" && !item.read).length} unread alerts`, icon: Wallet },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-slate-200/70 bg-white/88 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">{item.label}</p>
                    <p className="mt-3 text-[1.85rem] font-bold tracking-[-0.04em] text-slate-900">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{item.helper}</p>
                  </div>
                  <item.icon className="mt-1 h-5 w-5 text-[var(--ch-blue)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!activeClaim || !activeCase ? (
        <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-8 text-center shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
            <CircleDashed className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-slate-900">No claim is waiting in the queue</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--ch-muted)] sm:text-base">
            Submit a case from the hospital dashboard and it will appear here for insurer-led review.
          </p>
          <Link href="/dashboard/hospital" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--ch-blue)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)] transition-all hover:opacity-95">
            Open Hospital Dashboard
          </Link>
        </MotionCard>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="space-y-6">
            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ch-blue)]">Active claim review</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-900">{activeClaim.patientName}</h2>
                  <p className="mt-2 text-sm text-[var(--ch-muted)] sm:text-base">{activeClaim.caseLabel || activeClaim.diagnosis} · {activeClaim.hospital}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${finalTone[activeClaim.pipelineCompletedAt ? activeClaim.status : "pending"]}`}>
                    {activeClaim.pipelineCompletedAt ? buildFinalLabel(activeClaim) : activeClaim.workflowState === "adjudicating" ? "In progress" : "Ready to scan"}
                  </div>
                  {!activeClaim.pipelineCompletedAt ? (
                    <button
                      type="button"
                      onClick={startPipeline}
                      disabled={runningClaimIdRef.current === activeClaim.id}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--ch-blue)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Play className="h-4 w-4" />
                      {runningClaimIdRef.current === activeClaim.id ? "Scanning..." : "Start AI Scan"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Claim ID", value: activeClaim.id },
                  { label: "Policy", value: activeClaim.policyNumber || "-" },
                  { label: "Requested Amount", value: `Rs ${activeClaim.amount.toLocaleString("en-IN")}` },
                  { label: "Attending Doctor", value: activeClaim.attendingDoctor || "-" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">{item.label}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                    <FileSearch className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Retrieval and scanning</p>
                    <p className="text-sm text-[var(--ch-muted)]">These stages progress one after another after the insurer starts the review.</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {scanStages.map((stage) => {
                    const state = scanState[stage.key];
                    return (
                      <div key={stage.key} className="rounded-[1.3rem] border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{stage.label}</p>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${state === "done" ? "bg-emerald-50 text-emerald-700" : state === "running" ? "bg-[var(--ch-blue-light)] text-[var(--ch-blue-dark)]" : "bg-slate-100 text-slate-500"}`}>
                            {state}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--ch-muted)]">{stage.helper}</p>
                        {state === "running" ? (
                          <div className="mt-4 overflow-hidden rounded-full bg-slate-100">
                            <motion.div
                              initial={{ x: "-100%" }}
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="h-2 w-1/2 rounded-full bg-[linear-gradient(90deg,transparent,#4a8edb,transparent)]"
                            />
                          </div>
                        ) : state === "done" ? <div className="mt-4 h-2 rounded-full bg-emerald-500/80" /> : <div className="mt-4 h-2 rounded-full bg-slate-100" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Agent results</p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">Each agent gets enough visual width to show a proper explanation, not a broken word stack.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {agentDefinitions.map((agent) => {
                    const state = agentState[agent.key];
                    const result = activeClaim.aiResults[agent.key];
                    return (
                      <div key={agent.key} className="rounded-[1.55rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">{agent.label}</p>
                            <p className="mt-1 text-sm leading-6 text-[var(--ch-muted)]">{agent.helper}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${state === "done" ? (result.status === "pass" ? "bg-emerald-50 text-emerald-700" : result.status === "pending" ? "bg-slate-100 text-slate-500" : "bg-rose-50 text-rose-600") : state === "running" ? "bg-[var(--ch-blue-light)] text-[var(--ch-blue-dark)]" : "bg-slate-100 text-slate-500"}`}>
                            {state === "done" ? result.status : state}
                          </span>
                        </div>

                        {state === "running" ? (
                          <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white p-4">
                            <div className="flex items-center gap-2">
                              <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY }} className="h-2.5 w-2.5 rounded-full bg-[var(--ch-blue)]" />
                              <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, delay: 0.16 }} className="h-2.5 w-2.5 rounded-full bg-[var(--ch-blue)]" />
                              <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, delay: 0.32 }} className="h-2.5 w-2.5 rounded-full bg-[var(--ch-blue)]" />
                            </div>
                            <p className="mt-4 text-sm leading-6 text-[var(--ch-muted)]">Evaluating the evidence pack and assembling the decision rationale.</p>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <AgentResultCard
                              agentName={agent.label}
                              status={state === "done" ? result.status : "pending"}
                              reason={state === "done" ? result.reason : "Waiting for the insurer to start review or for the previous stage to finish."}
                              confidence={state === "done" ? result.confidence : undefined}
                              highlights={state === "done" ? result.highlights : undefined}
                              compact
                              showTitle={false}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </MotionCard>

            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Queue Snapshot</h2>
                  <p className="mt-1 text-sm text-[var(--ch-muted)]">Pick any submitted claim to inspect it before starting review.</p>
                </div>
                <Link href="/claims" className="text-sm font-semibold text-[var(--ch-blue)]">
                  Open full queue
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {workflowClaims.map((claim) => (
                  <button key={claim.id} type="button" onClick={() => setSelectedClaimId(claim.id)} className={`block w-full rounded-[1.4rem] border p-4 text-left transition-all ${claim.id === activeClaim.id ? "border-[var(--ch-blue)] bg-[var(--ch-blue-light)]/50" : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:bg-white"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{claim.id}</p>
                        <p className="mt-1 text-sm text-[var(--ch-muted)]">{claim.patientName} · {claim.caseLabel || claim.diagnosis}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${finalTone[claim.pipelineCompletedAt ? claim.status : "pending"]}`}>
                        {claim.pipelineCompletedAt ? buildFinalLabel(claim) : "Ready to scan"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-[var(--ch-subtle)]">Rs {claim.amount.toLocaleString("en-IN")} · {claim.workflowState?.replaceAll("_", " ") || "submitted"}</p>
                  </button>
                ))}
              </div>
            </MotionCard>
          </div>

          <div className="space-y-6">
            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Final Decision</h2>
              <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${finalTone[activeClaim.pipelineCompletedAt ? activeClaim.status : "pending"]}`}>
                {activeClaim.pipelineCompletedAt ? activeCase.finalDecisionLabel : "Awaiting insurer start"}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Decision letter</p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">Use this formal explanation for registered email communication and appeal handling.</p>
                  </div>
                  {activeClaim.status === "denied" && activeClaim.decisionLetter ? (
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Mail className="h-[18px] w-[18px] shrink-0 self-center" />
                      {sendingEmail ? "Sending email..." : activeClaim.emails?.length ? "Send email" : "Send email"}
                    </button>
                  ) : null}
                </div>

                {activeClaim.decisionLetter ? (
                  <pre className="mt-4 max-h-[24rem] overflow-auto whitespace-pre-wrap rounded-[1.2rem] border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">{activeClaim.decisionLetter}</pre>
                ) : (
                  <div className="mt-4 rounded-[1.2rem] border border-dashed border-slate-200 bg-white p-6 text-sm leading-6 text-[var(--ch-muted)]">
                    Start scanning to retrieve policy evidence, run the adjudication agents, and generate the letter.
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">Approved amount</p>
                  <p className="mt-3 text-lg font-bold text-slate-900">Rs {(activeClaim.amountApproved ?? 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">Decision note</p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{activeClaim.decisionNote || "Decision note appears after review completes."}</p>
                </div>
              </div>

              {activeClaim.emails?.length ? (
                <div className="mt-5 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  Formal decision email delivered to the registered address {activeClaim.emails[0].to} on {new Date(activeClaim.emails[0].sentAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.
                </div>
              ) : null}
            </MotionCard>

            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Agent Audit Trail</h2>
              <div className="mt-5 space-y-3">
                {auditEntries.length === 0 ? (
                  <p className="text-sm text-[var(--ch-muted)]">The audit trail will populate once the insurer starts review.</p>
                ) : (
                  auditEntries.map((entry, index) => (
                    <div key={`${entry.time}-${index}`} className="flex gap-3 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
                      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${entry.level === "success" ? "bg-emerald-500" : entry.level === "warning" ? "bg-amber-500" : "bg-[var(--ch-blue)]"}`} />
                      <div>
                        <p className="text-sm leading-6 text-slate-800">{entry.label}</p>
                        <p className="mt-1 text-xs text-[var(--ch-muted)]">{new Date(entry.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </MotionCard>

            <RecentActivityCard role="insurer" />
          </div>
        </section>
      )}
    </div>
  );
}
