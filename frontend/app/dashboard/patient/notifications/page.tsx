import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import NotificationsPage from "@/components/pages/NotificationsPage";

export default function PatientNotificationsRoute() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <NotificationsPage role="patient" />
      </Suspense>
    </AppShell>
  );
}
