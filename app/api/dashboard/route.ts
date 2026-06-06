import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getDashboardData, getInventoryDashboardData } from "@/lib/data";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");
  const data =
    view === "inventory"
      ? await getInventoryDashboardData(user?.id)
      : await getDashboardData(user?.id);

  return NextResponse.json({
    data,
    user: user
      ? {
          username: user.username,
          role: user.role,
        }
      : null,
  });
}
