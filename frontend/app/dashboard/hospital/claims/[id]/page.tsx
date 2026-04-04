import AppShell from "@/components/layout/AppShell";
import RoleClaimPage from "@/components/pages/RoleClaimPage";

export default async function HospitalClaimRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><RoleClaimPage claimId={id} role="hospital" /></AppShell>;
}
