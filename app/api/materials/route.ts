import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getInventoryMaterials } from "@/lib/data";

export async function GET() {
  const user = await getCurrentUser();
  const materials = await getInventoryMaterials(user?.id);

  return NextResponse.json({ materials });
}
