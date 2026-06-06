import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCookingData } from "@/lib/cooking-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const data = await getCookingData(user?.id);

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
