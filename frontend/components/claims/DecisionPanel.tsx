"use client";

import { FileText } from "lucide-react";
import type { Claim, ClaimStatus } from "@/types/claim";

type DecisionPanelProps = {
  claim: Claim;
  decisionText: string;
  onDecision: (decision: ClaimStatus) => Promise<void> | void;
  isSaving?: boolean;
};

export default function DecisionPanel({ claim, decisionText, onDecision, isSaving = false }: DecisionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileText className="h-4 w-4 text-[var(--ch-blue)]" />
          Letter Preview
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--ch-muted)]">{decisionText}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onDecision("approved")}
          disabled={isSaving}
          className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Approve Claim
        </button>
        <button
          type="button"
          onClick={() => onDecision("denied")}
          disabled={isSaving}
          className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Deny Claim
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDecision("pending")}
        disabled={isSaving}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Return {claim.id} To Pending
      </button>
    </div>
  );
}

