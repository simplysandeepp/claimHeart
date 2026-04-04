"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, HeartPulse, ShieldCheck } from "lucide-react";
import AgentResultCard from "@/components/claims/AgentResultCard";
import StatusBadge from "@/components/claims/StatusBadge";
import TimelineView from "@/components/claims/TimelineView";
import UploadBox from "@/components/claims/UploadBox";
import RecentActivityCard from "@/components/pages/RecentActivityCard";
import MotionCard from "@/components/ui/MotionCard";
import { SkeletonBlock, SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import { getCurrentUser } from "@/lib/api/auth";
import { addClaimDocument } from "@/lib/api/claims";
import {
  DEMO_WORKFLOW_CASES,
  getActiveDemoCaseId,
  getDemoCaseById,
  loadDemoDocumentCorpus,
  resolveViewerForRole,
  setActiveDemoCaseId,
  type DemoCaseId,
  type DemoDocSourceId,
} from "@/lib/demoWorkflow";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser, Claim, UploadedDocument } from "@/types";

const caseTone = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  denied: "border-rose-200 bg-rose-50 text-rose-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  pending: "border-slate-200 bg-slate-50 text-slate-600",
} as const;

export default function PatientDashboardPage() {
  const ready = usePageReady();
  const claims = useAppStore((state) => state.claims);
  const [viewer, setViewer] = useState<AppUser | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<DemoCaseId>("case-2");
  const [policyText, setPolicyText] = useState("");
  const [files, setFiles] = useState<UploadedDocument[]>([]);

  useEffect(() => {
    const activeCaseId = getActiveDemoCaseId();
    setSelectedCaseId(activeCaseId);
    getCurrentUser().then((currentUser) => setViewer(resolveViewerForRole("patient", currentUser, activeCaseId)));
    loadDemoDocumentCorpus().then((corpus: Record<DemoDocSourceId, string>) => setPolicyText(corpus.policy));
  }, []);

  const selectedCase = useMemo(() => getDemoCaseById(selectedCaseId), [selectedCaseId]);
  const patientClaims = useMemo(
    () => [...claims].filter((claim) => claim.patientId === selectedCase.patient.patientId).sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()),
    [claims, selectedCase.patient.patientId],
  );
  const activeClaim = patientClaims[0] ?? null;

  const switchCase = (caseId: DemoCaseId) => {
    setSelectedCaseId(caseId);
    setActiveDemoCaseId(caseId);
    setViewer((currentViewer) => resolveViewerForRole("patient", currentViewer, caseId));
    setFiles([]);
  };

  const handleUpload = (incoming: UploadedDocument[]) => {
    setFiles((current) => [...current, ...incoming.map((file) => ({ ...file, uploadedBy: "patient" }))]);
  };

  const removeFile = (name: string) => {
    setFiles((current) => current.filter((file) => file.name !== name));
  };

  const saveDocuments = async () => {
    if (!activeClaim || files.length === 0) {
      toast.error("Choose an active claim and at least one supporting document.");
      return;
    }

    for (const file of files) {
      await addClaimDocument(activeClaim.id, file, "patient");
    }

    setFiles([]);
    toast.success("Supporting documents shared with the insurer.");
  };

  if (!ready || !viewer) {
    return (
      <div className="space-y-6">
        <div className="space-y-3"><SkeletonBlock className="h-9 w-56" /><SkeletonBlock className="h-5 w-80" /></div>
        <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6"><SkeletonCard lines={4} /><SkeletonCard lines={5} /></div>
          <div className="space-y-6"><SkeletonCard lines={4} /><SkeletonCard lines={4} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#e8f1fb_40%,#0d1f34_40%,#112e4d_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
        <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--ch-blue-border)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ch-blue-dark)]">
              <HeartPulse className="h-3.5 w-3.5" /> Patient Experience Layer
            </div>
            <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-[-0.05em] text-slate-900 sm:text-[2.5rem]">
              Transparent claim tracking with a clearer decision trail and direct patient communication.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ch-muted)] sm:text-base">
              Switch between beneficiaries, follow the active claim in real time, and see the formal claim outcome as soon as the insurer finishes review.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
              {DEMO_WORKFLOW_CASES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchCase(item.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all xl:rounded-full xl:py-2 ${item.id === selectedCaseId ? "border-[var(--ch-blue)] bg-[var(--ch-blue)] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}
                >
                  {item.shortLabel} · {item.patient.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Beneficiary", value: viewer.name, helper: `Policy ${selectedCase.patient.policyNumber}` },
              { label: "Insurer", value: selectedCase.insurer.name, helper: selectedCase.insurer.planName },
              { label: "Live Claims", value: patientClaims.length, helper: patientClaims.length ? "Synced from hospital and insurer" : "Waiting for hospital submission" },
              { label: "Latest Status", value: activeClaim ? activeClaim.status.replace("_", " ") : "No claim yet", helper: activeClaim?.decisionNote || selectedCase.expectedOutcome },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/8 p-4 text-white backdrop-blur sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{item.label}</p>
                <p className="mt-3 break-words text-lg font-bold tracking-[-0.04em] text-white sm:text-xl">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-white/68">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <div className="min-w-0 space-y-6">
          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Active Claim Story</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">The latest claim for this patient is reflected here with the same state the hospital and insurer can see.</p>
              </div>
              {activeClaim ? <StatusBadge status={activeClaim.status} /> : <span className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 sm:w-auto">Waiting for claim</span>}
            </div>

            {!activeClaim ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-[var(--ch-muted)]">
                No claim has reached this patient yet. Submit the selected case from the hospital dashboard and the patient view will update automatically.
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {[
                    { label: "Claim ID", value: activeClaim.id },
                    { label: "Hospital", value: activeClaim.hospital },
                    { label: "Requested", value: `Rs ${activeClaim.amount.toLocaleString("en-IN")}` },
                    { label: "Approved", value: `Rs ${(activeClaim.amountApproved ?? 0).toLocaleString("en-IN")}` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">{item.label}</p>
                      <p className="mt-3 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Timeline</p>
                    <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                      <TimelineView timeline={activeClaim.timeline} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Agent Summary</p>
                    <div className="mt-4 grid gap-4">
                      <AgentResultCard agentName="Policy Agent" status={activeClaim.aiResults.policy.status} reason={activeClaim.aiResults.policy.reason} confidence={activeClaim.aiResults.policy.confidence} highlights={activeClaim.aiResults.policy.highlights} compact />
                      <AgentResultCard agentName="Medical Agent" status={activeClaim.aiResults.medical.status} reason={activeClaim.aiResults.medical.reason} confidence={activeClaim.aiResults.medical.confidence} highlights={activeClaim.aiResults.medical.highlights} compact />
                      <AgentResultCard agentName="Cross Validation" status={activeClaim.aiResults.cross.status} reason={activeClaim.aiResults.cross.reason} confidence={activeClaim.aiResults.cross.confidence} highlights={activeClaim.aiResults.cross.highlights} compact />
                    </div>
                  </div>
                </div>
              </>
            )}
          </MotionCard>

          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Share Supporting Documents</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">Useful for appeals or manual review. These appear instantly on the insurer side.</p>
              </div>
              <button type="button" onClick={saveDocuments} className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[var(--ch-blue)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 sm:w-auto">
                Upload To Claim
              </button>
            </div>
            <div className="mt-5">
              <UploadBox label="Patient uploads" files={files} onUpload={handleUpload} onRemove={removeFile} />
            </div>
          </MotionCard>
        </div>

        <div className="min-w-0 space-y-6">
          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Coverage Snapshot</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">The patient-facing explanation is grounded in the same policy pack used by the insurer.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Patient profile</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p><span className="font-semibold text-slate-900">Name:</span> {viewer.name}</p>
                <p><span className="font-semibold text-slate-900">DOB:</span> {selectedCase.patient.dob}</p>
                <p><span className="font-semibold text-slate-900">Policy:</span> {selectedCase.patient.policyNumber}</p>
                <p><span className="font-semibold text-slate-900">Start date:</span> {selectedCase.policyStartDate}</p>
                <p><span className="font-semibold text-slate-900">Insurer:</span> {selectedCase.patient.insuranceCompany}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--ch-subtle)]">Policy excerpt</p>
              <pre className="mt-4 max-h-[18rem] overflow-auto whitespace-pre-wrap break-words rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 text-[12px] leading-6 text-slate-700 sm:text-[13px]">{policyText.slice(0, 1800)}{policyText.length > 1800 ? "\n\n..." : ""}</pre>
            </div>
          </MotionCard>

          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Decision Letter</h2>
                <p className="mt-1 text-sm text-[var(--ch-muted)]">It appears automatically once the insurer review finishes.</p>
              </div>
            </div>

            {activeClaim?.decisionLetter ? (
              <pre className="mt-5 max-h-[24rem] overflow-auto whitespace-pre-wrap break-words rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{activeClaim.decisionLetter}</pre>
            ) : (
              <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-[var(--ch-muted)]">
                The claim is still moving through adjudication. Once the insurer finalises the outcome, the full patient-friendly explanation will appear here.
              </div>
            )}
          </MotionCard>

          <MotionCard className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h2 className="text-xl font-bold text-slate-900 md:text-[1.45rem]">Claim History</h2>
            <div className="mt-5 space-y-3">
              {patientClaims.length === 0 ? <p className="text-sm text-[var(--ch-muted)]">No claim history for this patient yet.</p> : patientClaims.map((claim: Claim) => (
                <Link key={claim.id} href={`/dashboard/patient/claims/${claim.id}`} className="block rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{claim.id}</p>
                      <p className="mt-1 text-sm text-[var(--ch-muted)]">{claim.caseLabel || claim.diagnosis}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${caseTone[claim.status]}`}>{claim.status.replace("_", " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </MotionCard>

          <RecentActivityCard role="patient" identity={selectedCase.patient.patientId} />
        </div>
      </section>
    </div>
  );
}
