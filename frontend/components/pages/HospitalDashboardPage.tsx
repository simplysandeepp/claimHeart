"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileDigit,
  FileSearch,
  RefreshCcw,
  ShieldCheck,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import MotionCard from "@/components/ui/MotionCard";
import RecentActivityCard from "@/components/pages/RecentActivityCard";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import { getCurrentUser } from "@/lib/api/auth";
import {
  createWorkflowClaimInput,
  DEMO_WORKFLOW_CASES,
  getActiveDemoCaseId,
  getCaseDocumentPreview,
  getDemoCaseById,
  loadDemoDocumentCorpus,
  resolveViewerForRole,
  setActiveDemoCaseId,
  type DemoCaseId,
  type DemoDocSourceId,
  type DemoUploadSelection,
} from "@/lib/demoWorkflow";
import { submitClaim } from "@/lib/api/claims";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser, Claim } from "@/types";

type UploadSlotState = DemoUploadSelection;
type DocPreviewState = {
  status: "idle" | "scanning" | "extracting" | "typing" | "ready";
  renderedText: string;
};

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const statusTone = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  denied: "border-rose-200 bg-rose-50 text-rose-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

const formatFileSize = (size: number) => `${Math.max(1, Math.round(size / 1024))} KB`;

export default function HospitalDashboardPage() {
  const ready = usePageReady();
  const claims = useAppStore((state) => state.claims);
  const [viewer, setViewer] = useState<AppUser | null>(null);
  const [corpus, setCorpus] = useState<Record<DemoDocSourceId, string> | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<DemoCaseId>("case-2");
  const [uploads, setUploads] = useState<Record<string, UploadSlotState>>({});
  const [docPreview, setDocPreview] = useState<Record<string, DocPreviewState>>({});
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeCaseId = getActiveDemoCaseId();
    setSelectedCaseId(activeCaseId);

    getCurrentUser().then((currentUser) => {
      setViewer(resolveViewerForRole("hospital", currentUser, activeCaseId));
    });

    loadDemoDocumentCorpus().then(setCorpus);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const selectedCase = useMemo(() => getDemoCaseById(selectedCaseId), [selectedCaseId]);
  const workflowClaims = useMemo(
    () => [...claims].filter((claim) => claim.workflowCaseId).sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()),
    [claims],
  );
  const allUploaded = selectedCase.requiredDocuments.every((item) => uploads[item.slotId]);

  const resetCaseWorkspace = (caseId: DemoCaseId) => {
    setSelectedCaseId(caseId);
    setActiveDemoCaseId(caseId);
    setViewer((currentViewer) => resolveViewerForRole("hospital", currentViewer, caseId));
    setUploads({});
    setDocPreview({});
    setTerminalLines([]);
    setProcessing(false);
    setProcessed(false);
    setSubmitting(false);
  };

  const onFileSelect = (slotId: string, file?: File | null) => {
    if (!file) {
      return;
    }

    setUploads((current) => ({
      ...current,
      [slotId]: {
        slotId,
        fileName: file.name,
        type: file.type || "application/pdf",
        size: file.size,
      },
    }));
    setProcessed(false);
  };

  const onFileDrop = (event: DragEvent<HTMLDivElement>, slotId: string) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    onFileSelect(slotId, file);
  };

  const removeUpload = (slotId: string) => {
    setUploads((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
    setProcessed(false);
    setDocPreview({});
    setTerminalLines([]);
  };

  const appendTerminal = async (line: string, delayMs: number = 180) => {
    setTerminalLines((current) => [...current, line]);
    await sleep(delayMs);
  };

  const runProcessing = async () => {
    if (!corpus || !allUploaded || processing) {
      return;
    }

    setProcessing(true);
    setProcessed(false);
    setTerminalLines([]);
    setDocPreview(
      Object.fromEntries(
        selectedCase.requiredDocuments.map((item) => [
          item.slotId,
          {
            status: "idle",
            renderedText: "",
          } satisfies DocPreviewState,
        ]),
      ),
    );

    await appendTerminal("> ClaimHeart intake engine initialised", 260);

    for (const requirement of selectedCase.requiredDocuments) {
      const previewText = getCaseDocumentPreview(selectedCase, requirement, corpus);
      const slotUpload = uploads[requirement.slotId];

      setDocPreview((current) => ({
        ...current,
        [requirement.slotId]: { status: "scanning", renderedText: "" },
      }));
      await appendTerminal(`> Scanning ${requirement.label} (${slotUpload?.fileName || requirement.fileHint})`, 220);
      await sleep(950);

      setDocPreview((current) => ({
        ...current,
        [requirement.slotId]: { status: "extracting", renderedText: "" },
      }));
      await appendTerminal(`> Detecting layout blocks for ${requirement.label}`, 180);
      await appendTerminal(`> Extracting structured text and field entities`, 180);
      await sleep(500);

      setDocPreview((current) => ({
        ...current,
        [requirement.slotId]: { status: "typing", renderedText: "" },
      }));

      for (let cursor = 0; cursor < previewText.length; cursor += 120) {
        const nextText = previewText.slice(0, cursor + 120);
        setDocPreview((current) => ({
          ...current,
          [requirement.slotId]: { status: "typing", renderedText: nextText },
        }));
        await sleep(14);
      }

      setDocPreview((current) => ({
        ...current,
        [requirement.slotId]: { status: "ready", renderedText: previewText },
      }));
      await appendTerminal(`> ${requirement.label} packaged for adjudication`, 220);
    }

    await appendTerminal("> All source documents extracted successfully", 260);
    await appendTerminal("> Intake package ready for insurer review", 260);
    setProcessing(false);
    setProcessed(true);
    toast.success("Documents processed and staged for insurer review.");
  };

  const handleSubmit = async () => {
    if (!corpus || !processed || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      const orderedUploads = selectedCase.requiredDocuments.map((item) => uploads[item.slotId]) as DemoUploadSelection[];
      const claimInput = createWorkflowClaimInput({
        demoCase: selectedCase,
        uploads: orderedUploads,
        corpus,
      });
      const claim = await submitClaim(claimInput);
      toast.success(`Claim ${claim.id} submitted successfully. The insurer can review it from their dashboard.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready || !viewer || !corpus) {
    return (
      <div className="space-y-6">
        <div className="space-y-3"><SkeletonBlock className="h-9 w-56" /><SkeletonBlock className="h-5 w-80" /></div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6"><SkeletonCard lines={5} /><SkeletonCard lines={6} /></div>
          <div className="space-y-6"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#08111f_0%,#133b67_54%,#edf4fb_54%,#f8fafc_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="grid gap-8 px-6 py-7 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              <ShieldCheck className="h-3.5 w-3.5" /> Hospital Intake Workspace
            </div>
            <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-[-0.05em] text-white sm:text-[2.6rem]">
              Structured intake, cleaner uploads, and a review handoff that feels product-ready.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/74 sm:text-base">
              Build the claim package, process the uploaded documents on screen, and hand the case to the insurer without breaking the flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/78">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Hospital: {viewer.name}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">Doctor: {selectedCase.hospital.doctor}</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">City: {selectedCase.hospital.city}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Live Claims", value: workflowClaims.length, helper: "Shared with patient and insurer views" },
              { label: "Required Files", value: selectedCase.requiredDocuments.length, helper: "Checklist for this case" },
              { label: "Expected Outcome", value: selectedCase.finalDecisionLabel, helper: selectedCase.expectedOutcome },
              { label: "Requested Amount", value: `Rs ${selectedCase.amount.toLocaleString("en-IN")}`, helper: selectedCase.summary },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-slate-200/70 bg-white/88 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">{item.label}</p>
                <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-900">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Choose Workflow</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">Each case drives a different rule path so the downstream review feels purposeful and realistic.</p>
              </div>
              <div className="rounded-full border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] px-4 py-2 text-sm font-semibold text-[var(--ch-blue-dark)]">
                Active case: {selectedCase.shortLabel}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {DEMO_WORKFLOW_CASES.map((item) => {
                const active = item.id === selectedCaseId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => resetCaseWorkspace(item.id)}
                    className={`group rounded-[1.5rem] border p-5 text-left transition-all ${active ? "border-[var(--ch-blue)] bg-[linear-gradient(180deg,rgba(74,142,219,0.10),#ffffff)] shadow-[0_14px_28px_rgba(74,142,219,0.15)]" : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{item.shortLabel}</span>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone[item.finalStatus]}`}>{item.finalDecisionLabel}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{item.summary}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[var(--ch-blue)]">
                      {active ? "Selected workflow" : "Switch to this workflow"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </MotionCard>

          <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Claim Intake Pack</h2>
                  <p className="mt-1 text-sm text-[var(--ch-muted)]">Attach the source documents, then convert them into a structured package before you submit the claim.</p>
                </div>
                <button
                  type="button"
                  onClick={runProcessing}
                  disabled={!allUploaded || processing}
                  className="inline-flex h-11 min-w-[160px] shrink-0 items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {processing ? "Scanning..." : "Run Intake Scan"}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {selectedCase.requiredDocuments.map((requirement) => {
                  const uploaded = uploads[requirement.slotId];
                  return (
                    <div
                      key={requirement.slotId}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onFileDrop(event, requirement.slotId)}
                      className={`rounded-[1.5rem] border p-5 transition-all ${uploaded ? "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_12px_28px_rgba(15,23,42,0.05)]" : "border-dashed border-[var(--ch-blue-border)] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fd_100%)] hover:border-[var(--ch-blue)] hover:bg-white"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${uploaded ? "bg-emerald-100 text-emerald-700" : "bg-white text-[var(--ch-blue)] shadow-[0_10px_24px_rgba(74,142,219,0.12)]"}`}>
                          {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-bold tracking-[-0.03em] text-slate-900">{requirement.label}</p>
                            {uploaded ? (
                              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Attached to intake package
                              </span>
                            ) : (
                              <span className="rounded-full border border-[var(--ch-blue-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ch-blue-dark)]">
                                Ready for upload
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{uploaded ? "The file is attached and queued for structured extraction." : `Recommended file: ${requirement.fileHint}`}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className={`rounded-[1.2rem] border px-4 py-3 ${uploaded ? "border-slate-200 bg-white" : "border-white/80 bg-white/85"}`}>
                          {uploaded ? (
                            <>
                              <p className="truncate text-sm font-semibold text-slate-900">{uploaded.fileName}</p>
                              <p className="mt-1 text-xs text-[var(--ch-muted)]">{formatFileSize(uploaded.size)} · {uploaded.type || "application/pdf"}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-slate-900">No file attached yet</p>
                              <p className="mt-1 text-xs text-[var(--ch-muted)]">Select a file or drop it here to add it to the intake package.</p>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all ${uploaded ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-[var(--ch-blue)] text-white hover:opacity-95"}`}>
                            {uploaded ? <RefreshCcw className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
                            {uploaded ? "Replace" : "Upload"}
                            <input type="file" className="hidden" onChange={(event) => onFileSelect(requirement.slotId, event.target.files?.[0])} />
                          </label>
                          {uploaded ? (
                            <button
                              type="button"
                              onClick={() => removeUpload(requirement.slotId)}
                              className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Submission handoff</p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">Process the documents first, then send the structured case for insurer review.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!processed || submitting}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--ch-blue)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {submitting ? "Submitting..." : "Submit Claim"}
                  </button>
                </div>
              </div>
            </MotionCard>

            <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                  <WandSparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Workflow Brief</h2>
                  <p className="mt-1 text-sm text-[var(--ch-muted)]">A short, clean explanation of what this case is expected to prove.</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Selected case</p>
                <h3 className="mt-3 text-lg font-bold tracking-[-0.03em] text-slate-900">{selectedCase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{selectedCase.narrative}</p>
              </div>

              <div className="mt-5 space-y-3">
                {selectedCase.queueHighlights.map((item) => (
                  <div key={item} className="flex gap-3 rounded-[1.2rem] border border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--ch-blue)]" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-slate-100">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Expected review flow</p>
                <div className="mt-4 space-y-3">
                  {selectedCase.pipelineSummary.map((item, index) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-slate-200">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">{index + 1}</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </MotionCard>
          </div>

          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">OCR And Extraction Preview</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">Each file advances through scanning, extraction, and text assembly on screen.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                {processing ? "Extraction in progress" : processed ? "Extraction complete" : "Waiting to start"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.04fr_0.96fr]">
              <div className="space-y-4">
                {selectedCase.requiredDocuments.map((requirement) => {
                  const preview = docPreview[requirement.slotId];
                  const isBusy = preview?.status === "scanning" || preview?.status === "extracting" || preview?.status === "typing";
                  return (
                    <div key={requirement.slotId} className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                            <FileDigit className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{requirement.label}</p>
                            <p className="text-xs text-[var(--ch-muted)]">{uploads[requirement.slotId]?.fileName || requirement.fileHint}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${preview?.status === "ready" ? "bg-emerald-50 text-emerald-700" : isBusy ? "bg-[var(--ch-blue-light)] text-[var(--ch-blue-dark)]" : "bg-slate-100 text-slate-500"}`}>
                          {preview?.status || "idle"}
                        </span>
                      </div>

                      <div className="p-4">
                        {preview?.status === "scanning" ? (
                          <div className="relative h-20 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <motion.div
                              initial={{ y: -20 }}
                              animate={{ y: 84 }}
                              transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="absolute left-4 right-4 h-1 rounded-full bg-[linear-gradient(90deg,transparent,#4a8edb,transparent)] shadow-[0_0_20px_rgba(74,142,219,0.45)]"
                            />
                            <div className="absolute inset-x-0 bottom-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Scanning document layers</div>
                          </div>
                        ) : preview?.status === "extracting" ? (
                          <div className="flex h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 border-t-[var(--ch-blue)]"
                            >
                              <span className="sr-only">Extracting</span>
                            </motion.div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Extracting fields</p>
                              <p className="mt-1 text-sm text-[var(--ch-muted)]">Classifying headings, values, and policy references.</p>
                            </div>
                          </div>
                        ) : preview?.renderedText ? (
                          <pre className="max-h-[22rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-[12px] leading-6 text-slate-700 sm:text-[13px]">{preview.renderedText}</pre>
                        ) : (
                          <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-[var(--ch-muted)]">
                            Upload and process to preview extracted text.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-4 text-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-100">
                    <FileSearch className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Pipeline Console</p>
                    <p className="text-sm text-slate-400">Live extraction logs and structured handoff</p>
                  </div>
                </div>
                <div ref={terminalRef} className="mt-4 h-[28rem] overflow-auto rounded-[1.2rem] border border-white/8 bg-black/20 p-4 font-mono text-[12px] leading-6 text-emerald-300 sm:text-[13px]">
                  <AnimatePresence initial={false}>
                    {terminalLines.length === 0 ? (
                      <p className="text-slate-500">No logs yet. Run document processing to populate the intake console.</p>
                    ) : (
                      terminalLines.map((line, index) => (
                        <motion.p key={`${line}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="break-words">
                          {line}
                        </motion.p>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </MotionCard>
        </div>

        <div className="space-y-6">
          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Recent Workflow Claims</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">Fresh submissions appear here and continue syncing across tabs.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {workflowClaims.length === 0 ? (
                <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-[var(--ch-muted)]">
                  No claim has been submitted yet. Process a case and submit it here so the insurer can open their dashboard and start review when ready.
                </div>
              ) : workflowClaims.slice(0, 4).map((claim: Claim) => (
                <Link key={claim.id} href={`/dashboard/hospital/claims/${claim.id}`} className="block rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_22px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{claim.id}</p>
                      <p className="mt-1 text-sm text-[var(--ch-muted)]">{claim.patientName} · {claim.caseLabel || claim.diagnosis}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone[claim.status]}`}>{claim.status.replace("_", " ")}</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--ch-subtle)]">Rs {claim.amount.toLocaleString("en-IN")} · {claim.workflowState?.replaceAll("_", " ") || "submitted"}</p>
                </Link>
              ))}
            </div>
          </MotionCard>

          <RecentActivityCard role="hospital" identity={viewer.name} />

          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f4f8fd)] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Narration Cheat Sheet</h2>
            <div className="mt-5 space-y-3">
              {[
                selectedCase.requestedAtLabel,
                `Patient on file: ${selectedCase.patient.name} · Policy ${selectedCase.patient.policyNumber}`,
                `Expected adjudication result: ${selectedCase.finalDecisionLabel}`,
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-[1.2rem] border border-white/70 bg-white px-4 py-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--ch-blue)]" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </MotionCard>
        </div>
      </section>
    </div>
  );
}


