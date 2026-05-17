import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { GoalTemplates } from "@/components/dashboard/goal-templates";

export default async function GoalTemplatesPage() {
  await requireUser();

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
        <Link href="/materials?tab=goals">
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

      <GoalTemplates characters={characters} weapons={weapons} />
    </div>
  );
}
