import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MessageSquare,
  Search,
  Shield,
  TrendingUp,
  Workflow,
} from "lucide-react";

export const stats = [
  { value: 18, prefix: "", suffix: "s", label: "Average Decision Support Cycle", sub: "Structured intake to recommendation", tone: "text-[var(--ch-blue)]" },
  { value: 90, prefix: "", suffix: "%", label: "High-Risk Claim Detection", sub: "Signal-driven anomaly identification", tone: "text-[var(--ch-green)]" },
  { value: 10, prefix: "", suffix: "x", label: "Operational Throughput Gain", sub: "Automation across review stages", tone: "text-[var(--ch-amber)]" },
  { value: 48, prefix: "Rs", suffix: "Cr", label: "Potential Leakage Prevented", sub: "Better controls across claim decisions", tone: "text-[var(--ch-red)]" },
];

export const problems = [
  {
    icon: FileText,
    stat: "1 in 5",
    label: "Claims Denied",
    desc: "Every year, millions of legitimate claims are rejected due to coding errors and documentation gaps.",
    tone: "text-[var(--ch-red)]",
    bg: "bg-[color:rgba(239,68,68,0.08)]",
  },
  {
    icon: BarChart2,
    stat: "80%",
    label: "Data Unstructured",
    desc: "Insurance data lives in scanned PDFs, handwritten forms, and siloed systems that are difficult to process efficiently.",
    tone: "text-[var(--ch-amber)]",
    bg: "bg-[color:rgba(245,158,11,0.08)]",
  },
  {
    icon: AlertTriangle,
    stat: "$68B",
    label: "Annual Fraud Loss",
    desc: "Ghost billing, upcoding, and phantom services drain billions from the healthcare system annually.",
    tone: "text-[var(--ch-red)]",
    bg: "bg-[color:rgba(239,68,68,0.08)]",
  },
  {
    icon: MessageSquare,
    stat: "0%",
    label: "Patient Transparency",
    desc: "Patients receive denial letters with no explanation, no recourse, and no clarity on what went wrong.",
    tone: "text-[var(--ch-subtle)]",
    bg: "bg-slate-50",
  },
];

export const agents = [
  {
    icon: FileText,
    name: "Intake Engine",
    tag: "OCR + Structuring",
    desc: "Transforms uploaded hospital documents into a structured intake pack with scanning, extraction, and packaging visuals.",
    card: "bg-[var(--ch-blue-light)] border-[var(--ch-blue-border)]",
    iconWrap: "bg-[color:rgba(74,142,219,0.14)]",
    tone: "text-[var(--ch-blue)]",
  },
  {
    icon: Search,
    name: "Policy Agent",
    tag: "RAG Grounded",
    desc: "Retrieves the right policy clauses, waiting-period rules, and coverage checks with explicit evidence grounding.",
    card: "bg-green-50 border-green-200",
    iconWrap: "bg-green-100/80",
    tone: "text-green-600",
  },
  {
    icon: AlertTriangle,
    name: "Medical Agent",
    tag: "Clinical Review",
    desc: "Checks diagnosis consistency, protocol adherence, and treatment justification against the submitted medical evidence.",
    card: "bg-red-50 border-red-200",
    iconWrap: "bg-red-100/80",
    tone: "text-red-500",
  },
  {
    icon: MessageSquare,
    name: "Cross Validation Agent",
    tag: "Evidence Reconciliation",
    desc: "Reconciles prescription, billing, labs, and decision output into a final recommendation with an explainable audit trail.",
    card: "bg-amber-50 border-amber-200",
    iconWrap: "bg-amber-100/80",
    tone: "text-amber-500",
  },
];

export const steps = [
  { step: "01", title: "Hospital Upload", desc: "The hospital uploads pre-auth, prescription, lab, policy, and billing documents into the intake pack.", icon: FileText },
  { step: "02", title: "Intake Scan", desc: "ClaimHeart runs staged OCR, extraction, and packaging so the workflow looks and behaves like a live intake pipeline.", icon: Workflow },
  { step: "03", title: "RAG Grounding", desc: "Relevant policy clauses and treatment evidence are retrieved before insurer review begins.", icon: Search },
  { step: "04", title: "Sequential Review", desc: "Policy, medical, and cross-validation agents execute one after another with visible audit signals.", icon: Shield },
  { step: "05", title: "Decision + Update", desc: "A final decision letter is generated, synced to dashboards, and queued for patient communication.", icon: CheckCircle2 },
];

export const differentiators = [
  { icon: Eye, title: "Glass-box AI", desc: "Every decision is explainable. Full audit trail. No black boxes." },
  { icon: AlertTriangle, title: "Real-time Fraud", desc: "Sub-second fraud scoring on every claim instead of delayed batch checks." },
  { icon: FileText, title: "Policy Citations", desc: "Exact page and clause references for every coverage recommendation." },
  { icon: CheckCircle2, title: "Human-in-loop", desc: "AI recommends, humans decide. Escalation workflows are built in." },
];

export const impacts = [
  {
    icon: Clock3,
    value: "18 sec",
    label: "Average Processing Time",
    sub: "Down from 60-90 days of manual review",
    card: "bg-[var(--ch-blue-light)] border-[var(--ch-blue-border)]",
    tone: "text-[var(--ch-blue)]",
  },
  {
    icon: Shield,
    value: "90%",
    label: "Fraud Detection Accuracy",
    sub: "Combining ML anomaly detection and LLM reasoning",
    card: "bg-green-50 border-green-200",
    tone: "text-green-600",
  },
  {
    icon: TrendingUp,
    value: "10x",
    label: "Faster Than Manual",
    sub: "End-to-end automation across all claim types",
    card: "bg-amber-50 border-amber-200",
    tone: "text-amber-500",
  },
];

export const trustedBy = ["Star Health", "HDFC ERGO", "Bajaj Allianz", "ICICI Lombard", "Niva Bupa"];

export const testimonials = [
  {
    name: "Sachin Manral",
    role: "Claims Strategy Lead",
    company: "Healthcare Claims Operations",
    text: "ClaimHeart brings structure to every stage of the claim journey. What stood out most was how clearly the platform connects intake, review, and decision visibility in one system.",
    avatar: "SM",
    avatarBg: "bg-[var(--ch-blue)]",
  },
  {
    name: "Sandeep Parjapati",
    role: "Insurance Workflow Manager",
    company: "Digital Adjudication Team",
    text: "The workflow feels operationally mature. Instead of isolated tools, ClaimHeart gives teams a dependable layer for evidence review, coordination, and explainable decision support.",
    avatar: "SP",
    avatarBg: "bg-green-500",
  },
  {
    name: "Vaibhav Yadav",
    role: "Head of Claims Transformation",
    company: "Payer Innovation Office",
    text: "What makes ClaimHeart compelling is the balance between automation and control. Teams move faster without losing auditability, oversight, or confidence in the final outcome.",
    avatar: "VY",
    avatarBg: "bg-amber-500",
  },
  {
    name: "Urja Gunjan",
    role: "Patient Experience Architect",
    company: "Care Operations Program",
    text: "Most platforms stop at internal processing. ClaimHeart stands out because it extends the experience through patient-facing clarity, communication, and a much more transparent decision trail.",
    avatar: "UG",
    avatarBg: "bg-rose-500",
  },
  {
    name: "Vyakhya Namdev",
    role: "Platform Design Reviewer",
    company: "Claims Intelligence Practice",
    text: "ClaimHeart feels like a long-term product, not a point demo. The architecture, presentation, and workflow logic all suggest a platform designed to keep evolving without losing coherence.",
    avatar: "VN",
    avatarBg: "bg-violet-500",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: "Rs2,999",
    period: "/month",
    desc: "Perfect for small TPAs processing up to 500 claims/month.",
    features: ["Up to 500 claims/month", "Extractor + Policy agents", "Email support", "Basic audit trail", "Standard SLA"],
    cta: "Start Free Trial",
    highlight: false,
    ctaClass: "bg-slate-800 text-white hover:bg-slate-700",
    borderClass: "border-slate-200",
  },
  {
    name: "Professional",
    price: "Rs9,999",
    period: "/month",
    desc: "For growing insurers with full fraud detection capabilities.",
    features: ["Up to 5,000 claims/month", "All 4 AI agents", "Priority support", "Full audit trail + export", "Fraud dashboard", "Custom policy upload"],
    cta: "Get Started",
    highlight: true,
    ctaClass: "bg-white text-[var(--ch-blue-dark)] hover:bg-white/90",
    borderClass: "border-transparent",
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large insurers and hospital networks at scale.",
    features: ["Unlimited claims", "Dedicated AI infrastructure", "24/7 SLA + CSM", "Custom workflow design", "Custom integrations", "Compliance-ready reporting"],
    cta: "Contact Sales",
    highlight: false,
    ctaClass: "bg-violet-600 text-white hover:bg-violet-700",
    borderClass: "border-violet-200",
  },
];

export const faqs = [
  {
    q: "How accurate is the fraud detection?",
    a: "ClaimHeart combines structured rules, anomaly signals, and reasoning layers to help teams identify high-risk claims early while preserving reviewer oversight.",
  },
  {
    q: "Is patient data safe with ClaimHeart?",
    a: "All data is encrypted at rest and in transit, with strict access controls and enterprise-grade auditability across every workflow.",
  },
  {
    q: "How long does integration take?",
    a: "Most teams go live in under 2 weeks with guided onboarding, policy setup, and reviewer training.",
  },
  {
    q: "Does ClaimHeart replace human adjusters?",
    a: "No - and by design. ClaimHeart recommends; humans decide. Complex or sensitive claims always escalate to a human reviewer.",
  },
  {
    q: "What document formats are supported?",
    a: "We support PDF (scanned and native), JPEG, PNG, TIFF, and common DICOM exports. Our GPT-4o Vision pipeline handles handwritten forms and low-resolution scans.",
  },
];

export const footerLinks = {
  Product: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"],
  Company: ["About Us", "Careers", "Press", "Blog", "Partners"],
  Resources: ["Guides", "Case Studies", "Webinars", "Compliance", "Support Center"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
};

