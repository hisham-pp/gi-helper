import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ goalId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { goalId } = await params;
  const data = await getDashboardData(user.id);
  const goal = data.goals.find((item) => item.id === goalId);

  if (!goal) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }

  return NextResponse.json({
    goal,
    materials: data.materials,
    user: {
      username: user.username,
      role: user.role,
    },
  });
}
