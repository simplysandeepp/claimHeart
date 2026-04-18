import type { AppUser, Claim, Notification } from "@/types";

const now = new Date();
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

export const MOCK_USERS: AppUser[] = [
  {
    id: "P-001",
    name: "Priya Sharma",
    email: "priya@test.com",
    phone: "+91 98765 43120",
    password: "patient123",
    role: "patient",
    dob: "15 Jun 1990",
    policyNumber: "POL-4021B",
    insuranceCompany: "Star Health",
    sumInsured: 500000,
    patientId: "P-001",
  },
  {
    id: "H-001",
    name: "Apollo Hospitals Delhi",
    email: "apollo@test.com",
    phone: "+91 98111 32000",
    password: "hospital123",
    role: "hospital",
    doctorName: "Dr. Ramesh Gupta",
    hospitalRegNo: "DL-2018-HC-10241",
    city: "Delhi",
    department: "Cashless Claims Desk",
  },
  {
    id: "I-001",
    name: "Star Health Insurance",
    email: "star@test.com",
    phone: "+91 96000 44112",
    password: "insurer123",
    role: "insurer",
    city: "Chennai",
    department: "Health Claims Review",
    employeeId: "STAR-REV-12",
  },
];

export const MOCK_CLAIMS: Claim[] = [
  {
    id: "CLM-001",
    patientId: "P-001",
    patientName: "Priya Sharma",
    hospital: "Apollo Hospitals Delhi",
    caseType: "emergency",
    diagnosis: "Dengue Fever",
    icdCode: "A90",
    amount: 124500,
    status: "pending",
    riskScore: 72,
    submittedAt: minutesAgo(8),
    documents: [
      { name: "admission-note.pdf", type: "application/pdf", size: 148120, uploadedAt: minutesAgo(8), uploadedBy: "hospital" },
      { name: "lab-summary.pdf", type: "application/pdf", size: 86210, uploadedAt: minutesAgo(7), uploadedBy: "hospital" },
    ],
    timeline: [
      { label: "Claim submitted by hospital", time: minutesAgo(8), actor: "hospital" },
      { label: "AI pipeline processing started", time: minutesAgo(7), actor: "system" },
    ],
    aiResults: {
      policy: { status: "pass", reason: "Room rent within daily limit per Section 3.1" },
      medical: { status: "flag", reason: "ECG billed - no cardiac diagnosis present" },
      cross: { status: "flag", reason: "Prior policy disclosure mismatch requires validation" },
    },
    comments: [],
  },
  {
    id: "CLM-002",
    patientId: "P-001",
    patientName: "Priya Sharma",
    hospital: "Apollo Hospitals Delhi",
    caseType: "planned",
    diagnosis: "Appendicitis",
    icdCode: "K35.80",
    amount: 87300,
    status: "approved",
    riskScore: 18,
    submittedAt: minutesAgo(240),
    documents: [
      { name: "ultrasound.pdf", type: "application/pdf", size: 64220, uploadedAt: minutesAgo(238), uploadedBy: "hospital" },
      { name: "surgeon-note.pdf", type: "application/pdf", size: 101330, uploadedAt: minutesAgo(236), uploadedBy: "hospital" },
      { name: "discharge-summary.pdf", type: "application/pdf", size: 121004, uploadedAt: minutesAgo(220), uploadedBy: "hospital" },
    ],
    timeline: [
      { label: "Claim submitted by hospital", time: minutesAgo(240), actor: "hospital" },
      { label: "AI processing complete", time: minutesAgo(238), actor: "system" },
      { label: "Reviewed by insurer", time: minutesAgo(230), actor: "insurer" },
      { label: "Approved - all checks passed", time: minutesAgo(220), actor: "insurer" },
    ],
    aiResults: {
      policy: { status: "pass", reason: "Procedure is fully covered under surgical benefits." },
      medical: { status: "pass", reason: "Clinical pathway and billed treatment are aligned." },
      cross: { status: "pass", reason: "Cross-validation with history and documents passed." },
    },
    comments: [
      {
        id: "C-APPROVED-1",
        text: "All supporting documents are complete. Proceeding with approval.",
        author: "Star Health Insurance",
        role: "insurer",
        time: minutesAgo(221),
        visibleTo: ["insurer", "hospital", "patient"],
      },
    ],
  },
  {
    id: "CLM-003",
    patientId: "P-001",
    patientName: "Priya Sharma",
    hospital: "Fortis Mumbai",
    caseType: "planned",
    diagnosis: "Maternity",
    icdCode: "Z37.0",
    amount: 95000,
    status: "denied",
    riskScore: 85,
    submittedAt: minutesAgo(1440),
    documents: [
      { name: "policy-schedule.pdf", type: "application/pdf", size: 52331, uploadedAt: minutesAgo(1435), uploadedBy: "hospital" },
      { name: "admission-form.pdf", type: "application/pdf", size: 92210, uploadedAt: minutesAgo(1430), uploadedBy: "hospital" },
    ],
    timeline: [
      { label: "Claim submitted by hospital", time: minutesAgo(1440), actor: "hospital" },
      { label: "AI processing complete", time: minutesAgo(1438), actor: "system" },
      { label: "Denied - waiting period not completed", time: minutesAgo(1410), actor: "insurer" },
    ],
    aiResults: {
      policy: { status: "flag", reason: "Maternity benefit activates after a 9 month waiting period." },
      medical: { status: "pass", reason: "Clinical records are internally consistent." },
      cross: { status: "flag", reason: "Policy inception is less than 9 months before admission date." },
    },
    comments: [],
    decisionNote: "Policy inception was less than 9 months ago. Maternity coverage activates after 9 months.",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "N-1",
    targetRole: "insurer",
    claimId: "CLM-001",
    title: "New claim received",
    message: "Priya Sharma - Rs 1,24,500 from Apollo Hospitals Delhi",
    type: "info",
    read: false,
    time: minutesAgo(8),
  },
  {
    id: "N-2",
    targetRole: "patient",
    targetUserId: "P-001",
    claimId: "CLM-001",
    title: "Claim submitted",
    message: "Your claim CLM-001 has been submitted and is being processed.",
    type: "info",
    read: false,
    time: minutesAgo(8),
  },
  {
    id: "N-3",
    targetRole: "hospital",
    claimId: "CLM-002",
    title: "Claim CLM-002 - approved",
    message: "Priya Sharma's claim has been approved by the insurer.",
    type: "success",
    read: false,
    time: minutesAgo(220),
  },
  {
    id: "N-4",
    targetRole: "patient",
    targetUserId: "P-001",
    claimId: "CLM-003",
    title: "Claim update",
    message: "Your claim CLM-003 requires attention. Please check your decision letter.",
    type: "warning",
    read: false,
    time: minutesAgo(1410),
  },
  {
    id: "N-5",
    targetRole: "hospital",
    claimId: "CLM-001",
    title: "Documents may be requested soon",
    message: "Insurer review has begun for Priya Sharma's claim CLM-001.",
    type: "info",
    read: true,
    time: minutesAgo(6),
  },
];

type SeedOptions = {
  includeDemoClaims?: boolean;
};

export const seedIfEmpty = ({ includeDemoClaims = false }: SeedOptions = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.localStorage.getItem("users")) {
    window.localStorage.setItem("users", JSON.stringify(MOCK_USERS));
  }

  if (includeDemoClaims && !window.localStorage.getItem("claims")) {
    window.localStorage.setItem("claims", JSON.stringify(MOCK_CLAIMS));
  }

  if (!window.localStorage.getItem("notifications")) {
    window.localStorage.setItem("notifications", JSON.stringify(MOCK_NOTIFICATIONS));
  }

  if (!window.localStorage.getItem("claimheart.currentUser")) {
    window.localStorage.setItem("claimheart.currentUser", JSON.stringify(MOCK_USERS[2]));
    window.localStorage.setItem("claimheart.role", JSON.stringify(MOCK_USERS[2].role));
    window.localStorage.setItem("role", MOCK_USERS[2].role);
  }
};
