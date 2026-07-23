import { NextResponse } from "next/server";
import { getCharacterTemplateById } from "@/lib/static-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  const template = getCharacterTemplateById(templateId);

  if (!template) {
    return NextResponse.json(
      { error: "Character template not found." },
      { status: 404 },
    );
  }

  return NextResponse.json(template);
}
