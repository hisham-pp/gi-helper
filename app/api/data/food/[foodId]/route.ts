import { NextResponse } from "next/server";
import { getFoodById } from "@/lib/cooking-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ foodId: string }> },
) {
  const { foodId } = await params;
  const food = getFoodById(foodId);

  if (!food) {
    return NextResponse.json({ error: "Food not found." }, { status: 404 });
  }

  return NextResponse.json(food);
}
