import { redirect } from "next/navigation";
import { GoalEdit } from "@/components/dashboard/goal-edit";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function GoalEditPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;

  try {
    const user = await requireUser();
    const data = await getDashboardData(user.id);
    const goal = data.goals.find((g) => g.id === goalId);

    if (!goal) {
      redirect("/materials");
    }

    return (
      <GoalEdit goal={goal} materials={data.materials} />
    );
  } catch (error) {
    // Log server-side error for debugging and redirect to materials to avoid leaking details to client
    // eslint-disable-next-line no-console
    console.error("GoalEditPage render error:", error);
    redirect("/materials");
  }
}
