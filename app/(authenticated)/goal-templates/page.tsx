import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GoalTemplates } from "@/components/dashboard/goal-templates";

export default async function GoalTemplatesPage() {
  const user = await getCurrentUser();

  const characters = await prisma.character.findMany({
    include: {
      templates: {
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
  });

  const weapons = await prisma.weapon.findMany({
    include: {
      templates: {
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/goals">
          <Button variant="text" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-on-surface text-3xl font-bold tracking-tight">
            Goal Templates
          </h1>
          <p className="text-on-surface-variant mt-1">
            Create goals from predefined character and weapon templates.
          </p>
        </div>
      </div>

      <GoalTemplates
        characters={characters}
        isAuthenticated={Boolean(user)}
        weapons={weapons}
      />
    </div>
  );
}
