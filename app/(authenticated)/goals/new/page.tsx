import { CreateGoal } from "@/components/dashboard/create-goal";
import { requireUser } from "@/lib/auth";

export default async function CreateGoalPage() {
  await requireUser();

  return <CreateGoal />;
}
