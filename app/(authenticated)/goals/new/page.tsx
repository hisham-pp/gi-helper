import Link from "next/link";

import { CreateGoal } from "@/components/dashboard/create-goal";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function CreateGoalPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-outline-variant bg-surface p-8">
        <h1 className="text-on-surface text-2xl font-bold">Login required</h1>
        <p className="text-on-surface-variant mt-3 text-sm leading-6">
          You can browse the tracker without an account. Login when you want to
          create and save personal goals.
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

  return <CreateGoal />;
}
