import type { AgentResult, AppUser, Claim, ClaimCaseType, ClaimStatus, UploadedDocument, UserRole } from "@/types";

export type DemoCaseId = "case-1" | "case-2" | "case-3";
export type DemoDocSourceId = "policy" | "preAuth" | "prescription" | "report" | "billing";

export type DemoUploadSelection = {
  slotId: string;
  fileName: string;
  type: string;
  size: number;
};

export type DemoDocumentRequirement = {
  slotId: string;
  label: string;
  sourceId: DemoDocSourceId;
  fileHint: string;
};

export type DemoWorkflowCase = {
  id: DemoCaseId;
  shortLabel: string;
  title: string;
  summary: string;
  narrative: string;
  diagnosis: string;
  icdCode: string;
  amount: number;
  amountApproved: number;
  riskScore: number;
  caseType: ClaimCaseType;
  finalStatus: ClaimStatus;
  patient: AppUser;
  hospital: {
    name: string;
    regNo: string;
    doctor: string;
    city: string;
  };
  insurer: {
    name: string;
    planName: string;
  };
  policyStartDate: string;
  requestedAtLabel: string;
  expectedOutcome: string;
  requiredDocuments: DemoDocumentRequirement[];
  queueHighlights: string[];
  pipelineSummary: string[];
  finalDecisionLabel: string;
  decisionNote: string;
  decisionLetter: string;
  agentResults: {
    policy: AgentResult;
    medical: AgentResult;
    cross: AgentResult;
  };
};

export const DEMO_ACTIVE_CASE_KEY = "claimheart.demo.activeCase";

const demoHospitalUser: AppUser = {
  id: "H-DEMO-001",
  name: "City Care Hospital, Mumbai",
  email: "citycare.demo@claimheart.ai",
  password: "hospital123",
  role: "hospital",
  doctorName: "Dr. Rakesh Iyer",
};

const demoInsurerUser: AppUser = {
  id: "I-DEMO-001",
  name: "HDFC ERGO General Insurance",
  email: "insurer.demo@claimheart.ai",
  password: "insurer123",
  role: "insurer",
};

const buildPatient = (input: {
  id: string;
  name: string;
  email: string;
  dob: string;
  policyNumber: string;
  insuranceCompany: string;
  sumInsured: number;
}) => ({
  id: input.id,
  patientId: input.id,
  name: input.name,
  email: input.email,
  password: "patient123",
  role: "patient" as const,
  dob: input.dob,
  policyNumber: input.policyNumber,
  insuranceCompany: input.insuranceCompany,
  sumInsured: input.sumInsured,
});

const pendingAgent: AgentResult = {
  status: "pending",
  reason: "Awaiting workflow execution on the insurer side.",
};

export const DEMO_DOC_URLS: Record<DemoDocSourceId, string> = {
  policy: "/docs/policy.txt",
  preAuth: "/docs/pre-auth.txt",
  prescription: "/docs/Prescription.txt",
  report: "/docs/test-report.txt",
  billing: "/docs/billings.txt",
};

export const DEMO_WORKFLOW_CASES: DemoWorkflowCase[] = [
  {
    id: "case-1",
    shortLabel: "Case 1",
    title: "Waiting Period Rejection",
    summary: "Riya Sharma's pre-authorisation for acute febrile illness should be rejected because the 24-month general hospitalisation waiting period is still active.",
    narrative: "A clean policy-validation scenario where the insurer should deny cashless approval by citing Clause 3.2 and Section 6.4.",
    diagnosis: "Acute Febrile Illness",
    icdCode: "R50.9",
    amount: 28000,
    amountApproved: 0,
    riskScore: 41,
    caseType: "planned",
    finalStatus: "denied",
    patient: buildPatient({
      id: "P-DEMO-001",
      name: "Riya Sharma",
      email: "riya.demo@claimheart.ai",
      dob: "1995-03-14",
      policyNumber: "HDFC-ERGO-2025-784512",
      insuranceCompany: "HDFC ERGO",
      sumInsured: 500000,
    }),
    hospital: {
      name: "City Care Hospital, Mumbai",
      regNo: "MH-2019-HC-00472",
      doctor: "Dr. Priya Menon",
      city: "Mumbai",
    },
    insurer: {
      name: "HDFC ERGO General Insurance",
      planName: "Smart Health Plus - Individual",
    },
    policyStartDate: "2025-01-25",
    requestedAtLabel: "Pre-auth request submitted on 01 Apr 2026 for admission on 02 Apr 2026.",
    expectedOutcome: "Automatic denial after policy clause validation.",
    requiredDocuments: [
      { slotId: "pre-auth", label: "Pre-authorisation Form", sourceId: "preAuth", fileHint: "pre-auth-riya.pdf" },
    ],
    queueHighlights: [
      "Policy active, but only 14 months old against a 24-month waiting period.",
      "Diagnosis is a general hospitalisation event, not a critical illness exception.",
      "No extra medical review required once clause mismatch is confirmed.",
    ],
    pipelineSummary: [
      "Policy agent cites Clause 3.2 and Section 6.4.",
      "Medical agent confirms admission is clinically reasonable but still non-payable.",
      "Cross-validation finalises denial with zero payable amount.",
    ],
    finalDecisionLabel: "Denied - Waiting period active",
    decisionNote: "General hospitalisation waiting period under Clause 3.2 remains incomplete for this policy.",
    decisionLetter:
      "Dear Riya Sharma,\n\nYour cashless pre-authorisation request for Acute Febrile Illness at City Care Hospital, Mumbai has been declined.\n\nReason for decision:\nThe policy HDFC-ERGO-2025-784512 started on 25 January 2025. Under Clause 3.2 of the Smart Health Plus plan, non-accidental general hospitalisation claims are covered only after 24 continuous months. The requested admission on 02 April 2026 falls within that waiting period.\n\nThis decision is based on:\n- Clause 3.2 - 24-month waiting period for general hospitalisation\n- Section 6.4 - Automatic pre-auth rejection when waiting period applies\n\nNo further clinical discrepancy was observed in the hospital submission. You may appeal within 30 days by sharing additional policy continuity evidence if available.\n\nRegards,\nClaimHeart Adjudication Desk",
    agentResults: {
      policy: {
        status: "flag",
        reason: "Clause 3.2 applies: the policy has not completed the 24-month waiting period for general hospitalisation.",
        confidence: 98,
        highlights: ["Policy start: 25 Jan 2025", "Requested admission: 02 Apr 2026", "Applicable rule: Section 6.4 auto-rejection"],
      },
      medical: {
        status: "pass",
        reason: "Clinical submission is internally consistent, but coverage still fails due to policy timing.",
        confidence: 88,
      },
      cross: {
        status: "flag",
        reason: "Cross-validation confirms denial. No continuity break evidence exists to override the waiting period trigger.",
        confidence: 95,
      },
    },
  },
  {
    id: "case-2",
    shortLabel: "Case 2",
    title: "Dengue Billing Fraud",
    summary: "Arjun Mehta's dengue claim includes three PlateMax injections billed within 24 hours, exceeding the policy protocol limit of two.",
    narrative: "A strong fraud-review scenario. Prescription and lab results look legitimate, but the billing document exposes a dosage-frequency anomaly and the insurer should move the claim to manual review.",
    diagnosis: "Dengue Fever with Thrombocytopenia",
    icdCode: "A97.1",
    amount: 22150,
    amountApproved: 0,
    riskScore: 87,
    caseType: "emergency",
    finalStatus: "under_review",
    patient: buildPatient({
      id: "P-DEMO-002",
      name: "Arjun Mehta",
      email: "arjun.demo@claimheart.ai",
      dob: "1993-07-22",
      policyNumber: "HDFC-ERGO-2025-991203",
      insuranceCompany: "HDFC ERGO",
      sumInsured: 500000,
    }),
    hospital: {
      name: "City Care Hospital, Mumbai",
      regNo: "MH-2019-HC-00472",
      doctor: "Dr. Rakesh Iyer",
      city: "Mumbai",
    },
    insurer: {
      name: "HDFC ERGO General Insurance",
      planName: "Smart Health Plus - Individual",
    },
    policyStartDate: "2023-03-10",
    requestedAtLabel: "Cashless request submitted with discharge pack on 06 Apr 2026.",
    expectedOutcome: "Moved to manual review due to protocol-violating billing.",
    requiredDocuments: [
      { slotId: "prescription", label: "Dengue Prescription", sourceId: "prescription", fileHint: "prescription-arjun.pdf" },
      { slotId: "report", label: "Platelet Test Report", sourceId: "report", fileHint: "platelet-report.pdf" },
      { slotId: "billing", label: "Hospital Billing Invoice", sourceId: "billing", fileHint: "billing-invoice.pdf" },
    ],
    queueHighlights: [
      "Policy waiting period is already completed, so claim is otherwise eligible.",
      "Prescription references dengue protocol while billing shows a third PlateMax administration.",
      "Cross-check requires manual clarification from the hospital before payment.",
    ],
    pipelineSummary: [
      "Policy agent clears the claim for coverage.",
      "Medical agent flags the third platelet-supportive injection as non-compliant.",
      "Cross-validation moves the case to manual review and pauses settlement.",
    ],
    finalDecisionLabel: "Manual review - billing anomaly",
    decisionNote: "Billing shows three PlateMax IV administrations in one day, exceeding the permitted protocol limit of two.",
    decisionLetter:
      "Dear Arjun Mehta,\n\nYour dengue cashless claim for INR 22,150 has been placed under manual review.\n\nWhy we paused settlement:\nDuring automated adjudication, the submitted billing invoice showed three PlateMax IV administrations on 05 April 2026. Under Section 5.2 of the policy, platelet-supportive injectable agents are covered for a maximum of two administrations within 24 hours unless additional clinical justification is documented.\n\nCurrent status:\n- Policy eligibility: Passed\n- Medical record consistency: Requires clarification\n- Final settlement: On hold pending hospital response\n\nThe hospital has been asked to submit nursing administration records and any physician addendum supporting the third dose. Once received, the claim will be re-evaluated.\n\nRegards,\nClaimHeart Adjudication Desk",
    agentResults: {
      policy: {
        status: "pass",
        reason: "Policy tenure exceeds 24 months, so dengue hospitalisation is eligible for assessment.",
        confidence: 96,
        highlights: ["Policy start: 10 Mar 2023", "Coverage active as of Apr 2026"],
      },
      medical: {
        status: "flag",
        reason: "Billing records three PlateMax IV administrations in 24 hours, above the allowed protocol frequency of two.",
        confidence: 97,
        highlights: ["08:00 AM", "02:00 PM", "09:00 PM - third dose flagged"],
      },
      cross: {
        status: "flag",
        reason: "Prescription, billing, and policy clause match indicates a likely billing discrepancy. Manual review required before settlement.",
        confidence: 94,
      },
    },
  },
  {
    id: "case-3",
    shortLabel: "Case 3",
    title: "Dengue Claim Approved",
    summary: "Same dengue flow as Case 2, but the corrected invoice includes only two PlateMax administrations, so the claim should clear automatically.",
    narrative: "A strong contrast case where the exact same workflow produces a different outcome when billing aligns with prescription and policy.",
    diagnosis: "Dengue Fever with Thrombocytopenia",
    icdCode: "A97.1",
    amount: 17740,
    amountApproved: 17740,
    riskScore: 19,
    caseType: "emergency",
    finalStatus: "approved",
    patient: buildPatient({
      id: "P-DEMO-002",
      name: "Arjun Mehta",
      email: "arjun.demo@claimheart.ai",
      dob: "1993-07-22",
      policyNumber: "HDFC-ERGO-2025-991203",
      insuranceCompany: "HDFC ERGO",
      sumInsured: 500000,
    }),
    hospital: {
      name: "City Care Hospital, Mumbai",
      regNo: "MH-2019-HC-00472",
      doctor: "Dr. Rakesh Iyer",
      city: "Mumbai",
    },
    insurer: {
      name: "HDFC ERGO General Insurance",
      planName: "Smart Health Plus - Individual",
    },
    policyStartDate: "2023-03-10",
    requestedAtLabel: "Corrected discharge pack submitted on 06 Apr 2026.",
    expectedOutcome: "Straight-through approval with full payable amount.",
    requiredDocuments: [
      { slotId: "prescription", label: "Dengue Prescription", sourceId: "prescription", fileHint: "prescription-arjun.pdf" },
      { slotId: "report", label: "Platelet Test Report", sourceId: "report", fileHint: "platelet-report.pdf" },
      { slotId: "billing", label: "Corrected Billing Invoice", sourceId: "billing", fileHint: "billing-corrected.pdf" },
    ],
    queueHighlights: [
      "Policy eligibility and diagnosis remain unchanged from Case 2.",
      "Corrected bill aligns with protocol: two PlateMax administrations only.",
      "No fraud or dosing anomaly remains after cross-check.",
    ],
    pipelineSummary: [
      "Policy agent confirms coverage.",
      "Medical agent validates document set and dosing frequency.",
      "Cross-validation approves the full claim amount for settlement.",
    ],
    finalDecisionLabel: "Approved - full amount payable",
    decisionNote: "All three documents align with policy rules and dosing protocol; full claim cleared.",
    decisionLetter:
      "Dear Arjun Mehta,\n\nYour dengue cashless claim has been approved in full.\n\nApproved amount: INR 17,740\nHospital: City Care Hospital, Mumbai\nDecision basis: Policy coverage is active, the diagnosis is supported by laboratory confirmation, and the final invoice reflects two PlateMax IV administrations within the allowable protocol limit.\n\nAutomated checks completed successfully across:\n- Policy eligibility\n- Medical necessity and lab confirmation\n- Prescription-to-billing consistency\n\nNo further action is needed from your side. Settlement instructions have been released to the hospital.\n\nRegards,\nClaimHeart Adjudication Desk",
    agentResults: {
      policy: {
        status: "pass",
        reason: "Coverage active and dengue hospitalisation is payable under the current plan terms.",
        confidence: 97,
      },
      medical: {
        status: "pass",
        reason: "Lab confirmation, prescription, and billing all align with the permitted dengue treatment protocol.",
        confidence: 95,
        highlights: ["Two PlateMax doses within 24 hours", "Positive NS1 and IgM markers"],
      },
      cross: {
        status: "pass",
        reason: "No remaining mismatch across the submitted documents. Full settlement can proceed.",
        confidence: 96,
      },
    },
  },
];

const workflowCaseMap = Object.fromEntries(DEMO_WORKFLOW_CASES.map((item) => [item.id, item])) as Record<DemoCaseId, DemoWorkflowCase>;

let corpusPromise: Promise<Record<DemoDocSourceId, string>> | null = null;

const correctedBillingDoc = (billingText: string) =>
  billingText
    .replace("Inj. PlateMax IV - Administration 3 (05 Apr, 09:00 PM): INR 4,200\r\n", "")
    .replace("--- TOTAL BILLED: INR 21,095 ---", "--- TOTAL BILLED: INR 16,895 ---")
    .replace("GST (5%): INR 1,055", "GST (5%): INR 845")
    .replace("GRAND TOTAL: INR 22,150", "GRAND TOTAL: INR 17,740")
    .replace("Cashless Claim Amount Requested: INR 22,150", "Cashless Claim Amount Requested: INR 17,740");

export const getDemoCaseById = (caseId: DemoCaseId) => workflowCaseMap[caseId];

export const getDefaultDemoCaseId = (): DemoCaseId => "case-2";

export const getActiveDemoCaseId = (): DemoCaseId => {
  if (typeof window === "undefined") {
    return getDefaultDemoCaseId();
  }

  const stored = window.localStorage.getItem(DEMO_ACTIVE_CASE_KEY);
  return stored && stored in workflowCaseMap ? (stored as DemoCaseId) : getDefaultDemoCaseId();
};

export const setActiveDemoCaseId = (caseId: DemoCaseId) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEMO_ACTIVE_CASE_KEY, caseId);
};

export const getDemoUserForRole = (role: UserRole, caseId: DemoCaseId = getDefaultDemoCaseId()): AppUser => {
  if (role === "patient") {
    return getDemoCaseById(caseId).patient;
  }

  if (role === "hospital") {
    return demoHospitalUser;
  }

  return demoInsurerUser;
};

export const resolveViewerForRole = (role: UserRole, currentUser: AppUser | null, caseId: DemoCaseId = getDefaultDemoCaseId()) => {
  if (currentUser?.role === role) {
    return currentUser;
  }

  return getDemoUserForRole(role, caseId);
};

export const loadDemoDocumentCorpus = async () => {
  if (typeof window === "undefined") {
    return {
      policy: "",
      preAuth: "",
      prescription: "",
      report: "",
      billing: "",
    } satisfies Record<DemoDocSourceId, string>;
  }

  if (!corpusPromise) {
    corpusPromise = Promise.all(
      (Object.entries(DEMO_DOC_URLS) as Array<[DemoDocSourceId, string]>).map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          const text = await response.text();
          return [key, text] as const;
        } catch {
          return [key, "Document preview unavailable for this case."] as const;
        }
      }),
    ).then((entries) => Object.fromEntries(entries) as Record<DemoDocSourceId, string>);
  }

  return corpusPromise;
};

export const getCaseDocumentPreview = (demoCase: DemoWorkflowCase, requirement: DemoDocumentRequirement, corpus: Record<DemoDocSourceId, string>) => {
  const source = corpus[requirement.sourceId] ?? "";
  if (demoCase.id === "case-3" && requirement.sourceId === "billing") {
    return correctedBillingDoc(source);
  }

  return source;
};

export const buildWorkflowDocuments = ({
  demoCase,
  uploads,
  corpus,
}: {
  demoCase: DemoWorkflowCase;
  uploads: DemoUploadSelection[];
  corpus: Record<DemoDocSourceId, string>;
}): UploadedDocument[] =>
  demoCase.requiredDocuments.map((requirement, index) => {
    const selected = uploads.find((entry) => entry.slotId === requirement.slotId);
    return {
      name: requirement.fileHint,
      type: selected?.type || "application/pdf",
      size: selected?.size || 142_000 + index * 19_000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "hospital",
      category: requirement.label,
      previewText: getCaseDocumentPreview(demoCase, requirement, corpus),
      sourceUrl: DEMO_DOC_URLS[requirement.sourceId],
      uploadedFileName: selected?.fileName,
      processingStatus: "ready",
    };
  });

export const createWorkflowClaimInput = ({
  demoCase,
  uploads,
  corpus,
}: {
  demoCase: DemoWorkflowCase;
  uploads: DemoUploadSelection[];
  corpus: Record<DemoDocSourceId, string>;
}): Partial<Claim> => {
  const now = new Date();
  const intakeCompletedAt = new Date(now.getTime() - 45_000).toISOString();

  return {
    patientId: demoCase.patient.patientId ?? demoCase.patient.id,
    patientName: demoCase.patient.name,
    patientEmail: demoCase.patient.email,
    hospital: demoCase.hospital.name,
    caseType: demoCase.caseType,
    diagnosis: demoCase.diagnosis,
    icdCode: demoCase.icdCode,
    amount: demoCase.amount,
    riskScore: demoCase.riskScore,
    submittedAt: now.toISOString(),
    documents: buildWorkflowDocuments({ demoCase, uploads, corpus }),
    aiResults: {
      policy: pendingAgent,
      medical: pendingAgent,
      cross: pendingAgent,
    },
    comments: [],
    workflowCaseId: demoCase.id,
    caseLabel: demoCase.title,
    policyNumber: demoCase.patient.policyNumber,
    policyStartDate: demoCase.policyStartDate,
    insurerName: demoCase.insurer.name,
    hospitalRegNo: demoCase.hospital.regNo,
    attendingDoctor: demoCase.hospital.doctor,
    workflowState: "submitted",
    amountApproved: 0,
    timeline: [
      { label: "Document intake package completed", time: intakeCompletedAt, actor: "hospital" },
      { label: "Claim submitted by hospital", time: now.toISOString(), actor: "hospital" },
      { label: "AI adjudication queued", time: new Date(now.getTime() + 10_000).toISOString(), actor: "system" },
    ],
    auditTrail: [
      { time: now.toISOString(), label: "Claim package assembled from intake documents.", level: "info" },
    ],
  };
};

export const getLatestWorkflowClaim = (claims: Claim[]) =>
  [...claims]
    .filter((claim) => claim.workflowCaseId)
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())[0] ?? null;

export const hasCompletedWorkflow = (claim: Claim | null) => Boolean(claim?.pipelineCompletedAt || claim?.workflowState === "completed");





