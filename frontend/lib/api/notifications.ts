"use client";

import { useAppStore } from "@/store/useAppStore";
import type { Notification } from "@/types";

const makeNotif = (
  targetRole: Notification["targetRole"],
  title: string,
  message: string,
  type: Notification["type"],
  claimId?: string,
  targetUserId?: string,
): Notification => ({
  id: `N-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  targetRole,
  targetUserId,
  claimId,
  title,
  message,
  type,
  read: false,
  time: new Date().toISOString(),
});

export const notifyClaimSubmitted = (claim: { id: string; patientName: string; amount: number; hospital: string; patientId: string }) => {
  const { addNotification } = useAppStore.getState();

  addNotification(makeNotif("insurer", "New claim received", `${claim.patientName} - Rs ${Number(claim.amount).toLocaleString("en-IN")} from ${claim.hospital}`, "info", claim.id));
  addNotification(makeNotif("patient", "Claim submitted", `Your claim ${claim.id} has been submitted and is being processed.`, "info", claim.id, claim.patientId));
};

export const notifyDecisionMade = (
  claim: { id: string; amount: number; patientId: string; patientName: string },
  decision: string,
  note?: string,
) => {
  const { addNotification } = useAppStore.getState();
  const isApproved = decision === "approved";

  addNotification(
    makeNotif(
      "patient",
      isApproved ? "Claim approved" : decision === "denied" ? "Claim update" : "Claim under review",
      isApproved
        ? `Your claim ${claim.id} for Rs ${Number(claim.amount).toLocaleString("en-IN")} has been approved.`
        : decision === "denied"
          ? `Your claim ${claim.id} requires attention. ${note || "Please check your decision letter."}`
          : `Your claim ${claim.id} is under manual review. We will update you shortly.`,
      isApproved ? "success" : decision === "denied" ? "warning" : "info",
      claim.id,
      claim.patientId,
    ),
  );

  addNotification(
    makeNotif(
      "hospital",
      `Claim ${claim.id} - ${decision.replace("_", " ")}`,
      `${claim.patientName}'s claim has been ${decision.replace("_", " ")} by the insurer.`,
      isApproved ? "success" : "info",
      claim.id,
    ),
  );
};

export const notifyDocumentRequested = (claim: { id: string; patientId: string; patientName: string }, requestNote: string) => {
  const { addNotification } = useAppStore.getState();

  addNotification(makeNotif("patient", "Action required - documents needed", `Your insurer has requested additional documents for claim ${claim.id}: ${requestNote}`, "action", claim.id, claim.patientId));
  addNotification(makeNotif("hospital", "Documents requested for claim", `Additional documents requested for ${claim.patientName}'s claim ${claim.id}: ${requestNote}`, "action", claim.id));
};

export const notifyDocumentUploaded = (claim: { id: string }, fileName: string, uploaderRole: string) => {
  const { addNotification } = useAppStore.getState();
  addNotification(makeNotif("insurer", "New document uploaded", `${fileName} added to claim ${claim.id} by ${uploaderRole}. Review when ready.`, "info", claim.id));
};

export const notifyDecisionEmailSent = (claim: { id: string; patientId: string; patientName: string }, subject: string) => {
  const { addNotification } = useAppStore.getState();

  addNotification(makeNotif("patient", "Decision email sent", `A formal claim decision email for ${claim.id} has been sent to your registered address.`, "info", claim.id, claim.patientId));
  addNotification(makeNotif("hospital", "Patient notified", `A decision email titled "${subject}" was sent to ${claim.patientName} for claim ${claim.id}.`, "info", claim.id));
};
