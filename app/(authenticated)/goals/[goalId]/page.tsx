import { redirect } from "next/navigation";
import { GoalEdit } from "@/components/dashboard/goal-edit";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function GoalEditPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return (
        <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
          <h1 className="text-on-surface text-2xl font-bold">
            Login required
          </h1>
          <p className="text-on-surface-variant mt-3 text-sm leading-6">
            Goal editing is personal data. Login to save and edit your goals.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link className="w-full" href="/login">
              <Button className="w-full rounded-lg">Login</Button>
            </Link>
            <Link className="w-full" href="/register">
              <Button className="w-full rounded-lg" variant="outlined">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    const data = await getDashboardData(user.id);
    const goal = data.goals.find((g) => g.id === goalId);

    if (!goal) {
      redirect("/goals");
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
