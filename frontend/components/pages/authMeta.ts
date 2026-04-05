import { ShieldCheck, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

export type AuthImageCard = {
  src: string;
  alt: string;
  label: string;
};

export type AuthRoleMeta = {
  icon: LucideIcon;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  bullets: string[];
  signupHint: string;
};

export const AUTH_ROLE_META: Record<UserRole, AuthRoleMeta> = {
  patient: {
    icon: UserRound,
    label: "Patient",
    eyebrow: "Patient workspace",
    title: "Confident claim visibility.",
    summary: "Track claims, documents, requests, and decisions in one place.",
    bullets: ["Claim tracking", "Document sharing", "Decision updates"],
    signupHint: "Basic access first. Profile and coverage later.",
  },
  hospital: {
    icon: Stethoscope,
    label: "Hospital",
    eyebrow: "Hospital workspace",
    title: "Reliable care-team coordination.",
    summary: "Manage intake, case documents, and payer handoffs across the desk.",
    bullets: ["Case intake", "Claims desk", "Payer coordination"],
    signupHint: "Provider profile and desk details.",
  },
  insurer: {
    icon: ShieldCheck,
    label: "Insurer",
    eyebrow: "Insurer review",
    title: "Structured review operations.",
    summary: "Route cases, review evidence, and maintain audit-ready decisions.",
    bullets: ["Case routing", "Evidence review", "Audit trail"],
    signupHint: "Review team and branch setup.",
  },
};

export const AUTH_IMAGE_SET: AuthImageCard[] = [
  {
    src: "/assets/loginpage1.jpg",
    alt: "Doctor reviewing forms with a patient during healthcare intake",
    label: "Hospital intake",
  },
  {
    src: "/assets/loginpage2.jpg",
    alt: "Doctors speaking with a patient in a hospital room",
    label: "Clinical coordination",
  },
  {
    src: "/assets/loginpage3.jpg",
    alt: "Insurance paperwork and billing documents laid out on a desk",
    label: "Policy review",
  },
  {
    src: "/assets/loginpage4.jpg",
    alt: "Healthcare worker reassuring an elderly patient at home",
    label: "Patient care",
  },
];
