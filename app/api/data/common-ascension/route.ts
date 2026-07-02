import { NextResponse } from "next/server";
import commonAscensionData from "@/data/materials/common-ascension/en.json";

export async function GET() {
  return NextResponse.json(commonAscensionData);
}
