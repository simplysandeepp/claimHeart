import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import DashboardPage from "@/components/pages/DashboardPage";

export default function InsurerDashboardRoute() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <DashboardPage />
      </Suspense>
    </AppShell>
  );
}
