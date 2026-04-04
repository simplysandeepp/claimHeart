import AppShell from "@/components/layout/AppShell";
import InsurerReviewPage from "@/components/pages/InsurerReviewPage";

export default async function InsurerReviewRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppShell><InsurerReviewPage claimId={id} /></AppShell>;
}
