import AppShell from "@/components/layout/AppShell";
import ClaimDetailPage from "@/components/pages/ClaimDetailPage";

export default async function ClaimDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><ClaimDetailPage claimId={id} /></AppShell>;
}
