import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import NotificationsPage from "@/components/pages/NotificationsPage";

export default function HospitalNotificationsRoute() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <NotificationsPage role="hospital" />
      </Suspense>
    </AppShell>
  );
}
