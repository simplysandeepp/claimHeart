"use client";

import { useAppStore } from "@/store/useAppStore";
import { getDemoCaseById } from "@/lib/demoWorkflow";
import {
  notifyClaimSubmitted,
  notifyDecisionEmailSent,
  notifyDecisionMade,
  notifyDocumentRequested,
  notifyDocumentUploaded,
} from "@/lib/api/notifications";
import { ApiError, apiRequest } from "@/lib/apiClient";
import type { Claim, ClaimEmail, ClaimStatus, Comment, TimelineEntry, UploadedDocument, UserRole } from "@/types";

const buildId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

const collectClaimFlags = (claim: Claim) => [
  claim.aiResults.policy.status === "flag" ? `Policy review: ${claim.aiResults.policy.reason}` : null,
  claim.aiResults.medical.status === "flag" ? `Medical review: ${claim.aiResults.medical.reason}` : null,
  claim.aiResults.cross.status === "flag" ? `Cross-validation: ${claim.aiResults.cross.reason}` : null,
].filter(Boolean) as string[];

const resolvePatientEmail = (claim: Claim) => {
  if (claim.patientEmail) {
    return claim.patientEmail;
  }

  if (claim.workflowCaseId === "case-1" || claim.workflowCaseId === "case-2" || claim.workflowCaseId === "case-3") {
    return getDemoCaseById(claim.workflowCaseId).patient.email;
  }

  return "patient@claimheart.ai";
};

type BackendClaim = {
  id: number;
  claim_number: string;
  patient_name: string;
  policy_number: string;
  diagnosis: string | null;
  amount: number;
  status: string;
  priority: "low" | "normal" | "high" | "critical";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const normalizeClaimStatus = (status: string): ClaimStatus => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "pending" || normalized === "under_review" || normalized === "approved" || normalized === "denied") {
    return normalized;
  }
  return "under_review";
};

const buildBackendClaimNumber = () => {
  const stamp = Date.now().toString().slice(-8);
  return `CLM-${stamp}`;
};

const toBackendClaimPayload = (claimInput: Partial<Claim>, fallbackClaim: Claim) => {
  const claimNumber = claimInput.claimNumber || claimInput.id || fallbackClaim.claimNumber || fallbackClaim.id || buildBackendClaimNumber();
  return {
    claim_number: claimNumber,
    patient_name: claimInput.patientName || fallbackClaim.patientName || "Unknown Patient",
    policy_number: claimInput.policyNumber || claimInput.patientId || fallbackClaim.policyNumber || fallbackClaim.patientId || "POL-UNKNOWN",
    diagnosis: claimInput.diagnosis || fallbackClaim.diagnosis || "Diagnosis pending",
    amount: Number(claimInput.amount ?? fallbackClaim.amount ?? 0),
    status: normalizeClaimStatus(claimInput.status || fallbackClaim.status || "pending"),
    priority: claimInput.priority || fallbackClaim.priority || "normal",
    notes: claimInput.decisionNote || fallbackClaim.decisionNote || null,
  };
};

const mapBackendClaimToUi = (claim: BackendClaim): Claim => {
  const submittedTime = claim.created_at || new Date().toISOString();
  const normalizedStatus = normalizeClaimStatus(claim.status);

  return {
    id: claim.claim_number,
    backendId: claim.id,
    claimNumber: claim.claim_number,
    patientId: claim.policy_number,
    patientName: claim.patient_name,
    patientEmail: "",
    hospital: "Hospital not specified",
    caseType: "planned",
    diagnosis: claim.diagnosis || "Diagnosis pending",
    icdCode: "",
    amount: Number(claim.amount || 0),
    status: normalizedStatus,
    priority: claim.priority,
    riskScore: 0,
    submittedAt: submittedTime,
    documents: [],
    timeline: [
      { label: "Claim received by backend", time: submittedTime, actor: "system" },
      {
        label:
          normalizedStatus === "approved"
            ? "Approved by insurer"
            : normalizedStatus === "denied"
              ? "Denied by insurer"
              : normalizedStatus === "under_review"
                ? "Claim moved to review"
                : "Claim pending review",
        time: claim.updated_at || submittedTime,
        actor: "insurer",
      },
    ],
    aiResults: {
      policy: { status: "pending", reason: "Awaiting backend analysis signals" },
      medical: { status: "pending", reason: "Awaiting backend analysis signals" },
      cross: { status: "pending", reason: "Awaiting backend analysis signals" },
    },
    comments: [],
    emails: [],
    decisionNote: claim.notes || undefined,
  };
};

const mergeWithExistingClaim = (mapped: Claim, claimInput?: Partial<Claim>): Claim => ({
  ...mapped,
  hospital: claimInput?.hospital || mapped.hospital,
  caseType: claimInput?.caseType || mapped.caseType,
  patientId: claimInput?.patientId || mapped.patientId,
  patientEmail: claimInput?.patientEmail || mapped.patientEmail,
  icdCode: claimInput?.icdCode || mapped.icdCode,
  riskScore: claimInput?.riskScore ?? mapped.riskScore,
  documents: claimInput?.documents || mapped.documents,
  timeline: claimInput?.timeline || mapped.timeline,
  aiResults: claimInput?.aiResults || mapped.aiResults,
  comments: claimInput?.comments || mapped.comments,
  workflowCaseId: claimInput?.workflowCaseId,
  caseLabel: claimInput?.caseLabel,
  policyStartDate: claimInput?.policyStartDate,
  insurerName: claimInput?.insurerName,
  hospitalRegNo: claimInput?.hospitalRegNo,
  attendingDoctor: claimInput?.attendingDoctor,
  amountApproved: claimInput?.amountApproved,
  workflowState: claimInput?.workflowState,
  auditTrail: claimInput?.auditTrail,
  pipelineCompletedAt: claimInput?.pipelineCompletedAt,
});

const setClaimsLoadingState = (loading: boolean, errorMessage: string | null = null) => {
  const store = useAppStore.getState();
  store.setClaimsLoading(loading);
  if (errorMessage !== null) {
    store.setClaimsError(errorMessage);
  }
};

const listBackendClaims = async (): Promise<Claim[]> => {
  const claims = await apiRequest<BackendClaim[]>("/claims", { method: "GET" }, true);
  return claims.map((entry) => mapBackendClaimToUi(entry));
};

export const buildNewClaim = (data: Partial<Claim>): Claim => {
  const submittedAt = new Date();
  const processingStartedAt = new Date(submittedAt.getTime() + 1000);

  return {
    id: buildId("CLM"),
    submittedAt: submittedAt.toISOString(),
    status: "pending",
    riskScore: Math.floor(Math.random() * 100),
    timeline: [
      { label: "Claim submitted by hospital", time: submittedAt.toISOString(), actor: "hospital" },
      { label: "AI review queued", time: processingStartedAt.toISOString(), actor: "system" },
    ],
    aiResults: {
      policy: { status: "pass", reason: "Room rent within daily limit per Section 3.1" },
      medical: { status: "flag", reason: "ECG billed - no cardiac diagnosis present" },
      cross: { status: "pass", reason: "Patient records cross-validated" },
    },
    documents: [],
    comments: [],
    emails: [],
    caseType: "planned",
    diagnosis: "",
    icdCode: "",
    amount: 0,
    patientId: "",
    patientName: "",
    patientEmail: "",
    hospital: "",
    ...data,
  } as Claim;
};

export const buildDecisionLetter = (claim: Claim): string => {
  if (claim.decisionLetter) {
    return claim.decisionLetter;
  }

  const flags = collectClaimFlags(claim).join("\n");

  return `Dear ${claim.patientName},\n\nYour claim ${claim.id} for Rs ${Number(claim.amount).toLocaleString("en-IN")} at ${claim.hospital} has been ${claim.status === "under_review" ? "placed under review" : claim.status}.\n\n${flags ? `Notes:\n${flags}\n\n` : ""}Contact your insurer for queries.\n\nRegards,\nClaimHeart Adjudication System`;
};

export const buildDecisionEmail = (claim: Claim): ClaimEmail => {
  const subject =
    claim.status === "denied"
      ? `Claim decision for ${claim.id} - Rejected`
      : claim.status === "under_review"
        ? `Claim update for ${claim.id} - Manual review`
        : `Claim decision for ${claim.id}`;
  const reasons = collectClaimFlags(claim);
  const sentAt = new Date().toISOString();

  const body = [
    `Dear ${claim.patientName},`,
    "",
    claim.status === "denied"
      ? `We regret to inform you that claim ${claim.id} has been rejected after insurer review.`
      : `This is an update regarding claim ${claim.id}.`,
    "",
    reasons.length > 0 ? "Reason for the decision:" : "Decision summary:",
    ...(reasons.length > 0
      ? reasons.map((reason, index) => `${index + 1}. ${reason}`)
      : [claim.decisionNote || "Please review the attached decision summary."]),
    "",
    "If you would like to challenge this outcome, please reply with any supporting records or continuity documents.",
    "",
    "Regards,",
    "ClaimHeart Adjudication Desk",
  ].join("\n");

  return {
    id: buildId("MAIL"),
    to: resolvePatientEmail(claim),
    subject,
    body,
    sentAt,
    sentBy: "Insurer Decision Desk",
    status: "sent",
  };
};

export const simulateOCR = () => ({
  diagnosis: "Dengue Fever",
  icdCode: "A90",
  admissionDate: "2025-03-18",
  dischargeDate: "2025-03-22",
  totalAmount: "Rs 1,24,500",
  note: "NS1 antigen positive. Platelet count 45,000.",
});

export const getClaims = async () => {
  const store = useAppStore.getState();
  setClaimsLoadingState(true, null);

  try {
    const backendClaims = await listBackendClaims();
    store.setClaims(backendClaims);
    return backendClaims;
  } catch (error) {
    const claims = store.claims;
    if (claims.length === 0) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Claims could not be loaded from backend. Showing local data if available.";
      setClaimsLoadingState(false, message);
    } else {
      setClaimsLoadingState(false, null);
    }
    return claims;
  } finally {
    useAppStore.getState().setClaimsLoading(false);
  }
};

export const getNotifications = async () => {
  return useAppStore.getState().notifications;
};

export const getClaimById = async (id: string) => {
  const localClaim = useAppStore.getState().claims.find((claim) => claim.id === id) ?? null;

  if (!localClaim?.backendId) {
    return localClaim;
  }

  try {
    const backendClaim = await apiRequest<BackendClaim>(`/claims/${localClaim.backendId}`, { method: "GET" }, true);
    return mergeWithExistingClaim(mapBackendClaimToUi(backendClaim), localClaim);
  } catch {
    return localClaim;
  }
};

export const getClaimsByPatient = async (patientId: string) => {
  return (await getClaims()).filter((claim) => claim.patientId === patientId);
};

export const getClaimsByHospital = async (hospital: string) => {
  return (await getClaims()).filter((claim) => claim.hospital === hospital);
};

export const submitClaim = async (claimInput: Partial<Claim>) => {
  const fallbackClaim = buildNewClaim(claimInput);
  const store = useAppStore.getState();

  try {
    const payload = toBackendClaimPayload(claimInput, fallbackClaim);
    const created = await apiRequest<BackendClaim>(
      "/claims",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    );
    const savedClaim = mergeWithExistingClaim(mapBackendClaimToUi(created), {
      ...claimInput,
      id: payload.claim_number,
      claimNumber: payload.claim_number,
    });
    store.addClaim(savedClaim);
    notifyClaimSubmitted(savedClaim);
    return savedClaim;
  } catch {
    store.addClaim(fallbackClaim);
    notifyClaimSubmitted(fallbackClaim);
    return fallbackClaim;
  }
};

export const recordDecision = async (id: string, status: ClaimStatus, note?: string) => {
  const store = useAppStore.getState();
  const claim = store.claims.find((entry) => entry.id === id);
  if (!claim) {
    return null;
  }

  const timelineLabel =
    status === "approved"
      ? "Approved by insurer"
      : status === "denied"
        ? "Denied by insurer"
        : "Placed under manual review by insurer";

  const timeline: TimelineEntry[] = [
    ...claim.timeline,
    { label: timelineLabel, time: new Date().toISOString(), actor: "insurer" },
  ];

  if (claim.backendId) {
    try {
      const updated = await apiRequest<BackendClaim>(
        `/claims/${claim.backendId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            priority: claim.priority || "normal",
            notes: note || null,
          }),
        },
        true,
      );
      const merged = mergeWithExistingClaim(mapBackendClaimToUi(updated), {
        ...claim,
        status,
        timeline,
        decisionNote: note,
      });
      store.updateClaim(id, merged);
      notifyDecisionMade(merged, status, note);
      return merged;
    } catch {
      // Fall back to local update when backend update fails.
    }
  }

  store.updateClaim(id, { status, timeline, decisionNote: note });
  const updatedClaim = { ...claim, status, timeline, decisionNote: note };
  notifyDecisionMade(updatedClaim, status, note);
  return updatedClaim;
};

export const sendDecisionEmail = async (id: string) => {
  const store = useAppStore.getState();
  const claim = store.claims.find((entry) => entry.id === id);
  if (!claim) {
    return null;
  }

  const email = buildDecisionEmail(claim);
  const emails = [email, ...(claim.emails ?? [])];
  const timeline = [
    ...claim.timeline,
    { label: `Decision email sent to registered address ${email.to}`, time: email.sentAt, actor: "insurer" as const },
  ];

  store.updateClaim(id, { emails, timeline });
  const updatedClaim = { ...claim, emails, timeline };
  notifyDecisionEmailSent(updatedClaim, email.subject);
  return { claim: updatedClaim, email };
};

export const requestMoreDocuments = async (id: string, requestNote: string) => {
  const store = useAppStore.getState();
  const claim = store.claims.find((entry) => entry.id === id);
  if (!claim) {
    return null;
  }

  const timeline = [
    ...claim.timeline,
    { label: `Documents requested by insurer: ${requestNote}`, time: new Date().toISOString(), actor: "insurer" as const },
  ];

  if (claim.backendId) {
    try {
      const updated = await apiRequest<BackendClaim>(
        `/claims/${claim.backendId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "under_review",
            priority: claim.priority || "normal",
            notes: requestNote,
          }),
        },
        true,
      );
      const merged = mergeWithExistingClaim(mapBackendClaimToUi(updated), {
        ...claim,
        status: "under_review",
        timeline,
        decisionNote: requestNote,
      });
      store.updateClaim(id, merged);
      notifyDocumentRequested(merged, requestNote);
      return merged;
    } catch {
      // Fall back to local update when backend update fails.
    }
  }

  store.updateClaim(id, { status: "under_review", timeline, decisionNote: requestNote });
  const updatedClaim = { ...claim, status: "under_review" as ClaimStatus, timeline, decisionNote: requestNote };
  notifyDocumentRequested(updatedClaim, requestNote);
  return updatedClaim;
};

export const addClaimDocument = async (id: string, document: UploadedDocument, uploaderRole: UserRole) => {
  const store = useAppStore.getState();
  const claim = store.claims.find((entry) => entry.id === id);
  if (!claim) {
    return null;
  }

  const documents = [...claim.documents, document];
  const timeline = [
    ...claim.timeline,
    { label: `Document uploaded by ${uploaderRole}: ${document.name}`, time: new Date().toISOString(), actor: uploaderRole },
  ];

  store.updateClaim(id, { documents, timeline });
  const updatedClaim = { ...claim, documents, timeline };
  notifyDocumentUploaded(updatedClaim, document.name, uploaderRole);
  return updatedClaim;
};

export const addClaimComment = async (
  id: string,
  payload: { text: string; author: string; role: UserRole; visibleTo: Comment["visibleTo"] },
) => {
  const store = useAppStore.getState();
  const claim = store.claims.find((entry) => entry.id === id);
  if (!claim) {
    return null;
  }

  const comment: Comment = {
    id: buildId("COM"),
    text: payload.text,
    author: payload.author,
    role: payload.role,
    time: new Date().toISOString(),
    visibleTo: payload.visibleTo,
  };

  const comments = [comment, ...claim.comments];
  const timeline = [
    ...claim.timeline,
    { label: `Comment added by ${payload.role}`, time: new Date().toISOString(), actor: payload.role },
  ];

  store.updateClaim(id, { comments, timeline });
  return { ...claim, comments, timeline };
};
