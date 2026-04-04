import type { ClaimActor, ClaimStatus, Notification, UserRole } from "@/types";

export const claimStatusClasses: Record<ClaimStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  denied: "bg-red-50 text-red-500 border-red-200",
  under_review: "bg-[var(--ch-blue-light)] text-[var(--ch-blue-dark)] border-[var(--ch-blue-border)]",
};

export const notificationClasses: Record<Notification["type"], string> = {
  info: "border-[var(--ch-blue)] bg-[var(--ch-blue-light)]/40",
  success: "border-green-500 bg-green-50",
  warning: "border-amber-500 bg-amber-50",
  action: "border-red-500 bg-red-50",
};

export const actorDotClasses: Record<ClaimActor, string> = {
  system: "bg-slate-400",
  hospital: "bg-amber-500",
  insurer: "bg-[var(--ch-blue)]",
  patient: "bg-teal-500",
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatRelativeTime = (value: string) => {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export const isNewClaim = (submittedAt: string) => Date.now() - new Date(submittedAt).getTime() < 10 * 60_000;

export const getNotificationHref = (role: UserRole, claimId?: string) => {
  if (!claimId) {
    return `/dashboard/${role}/notifications`;
  }

  if (role === "insurer") {
    return `/dashboard/insurer/review/${claimId}`;
  }

  return `/dashboard/${role}/claims/${claimId}`;
};
