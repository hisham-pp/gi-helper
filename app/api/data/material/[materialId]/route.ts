import { NextResponse } from "next/server";
import { getMaterialById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ materialId: string }> },
) {
  const { materialId } = await params;
  const material = getMaterialById(materialId);

  if (!material) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  return NextResponse.json(material);
}
