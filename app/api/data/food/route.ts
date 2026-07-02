import { NextResponse } from "next/server";
import foodData from "@/data/consumables/food/en.json";

export async function GET() {
  return NextResponse.json(foodData);
}
