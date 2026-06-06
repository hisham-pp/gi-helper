import { GoalEditClientPage } from "@/components/dashboard/goal-edit-client-page";

export default async function GoalEditPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;

  return <GoalEditClientPage goalId={goalId} />;
}
