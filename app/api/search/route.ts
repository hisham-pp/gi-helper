import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCookingData } from "@/lib/cooking-data";
import { getDashboardData } from "@/lib/data";
import { getAllCharacters, getAllWeapons } from "@/lib/static-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const [dashboardData, cookingData] = await Promise.all([
    getDashboardData(user?.id),
    getCookingData(user?.id),
  ]);

  return NextResponse.json({
    lists: {
      characters: getAllCharacters(),
      weapons: getAllWeapons(),
      goals: dashboardData.goals,
      materials: dashboardData.materials,
      recipes: cookingData.recipes,
    },
  });
}
