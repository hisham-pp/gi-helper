import { NextResponse } from "next/server";
import { getWeaponTemplateById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  const template = getWeaponTemplateById(templateId);

  if (!template) {
    return NextResponse.json({ error: "Weapon template not found." }, { status: 404 });
  }

  return NextResponse.json(template);
}
