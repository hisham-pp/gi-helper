import { NextResponse } from "next/server";

import { getEnemiesByMaterialId } from "@/lib/enemy-data";
import {
  getMaterialById,
  getMaterialChildren,
  getMaterialTemplateUsage,
} from "@/lib/static-data";

type MaterialDetails = {
  source?: string | null;
  usedByCharacters?: string[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ materialId: string }> },
) {
  const { materialId } = await params;
  const material = getMaterialById(materialId);

  if (!material) {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }

  const parentMaterial = material.parentMaterialId
    ? getMaterialById(material.parentMaterialId)
    : null;
  const details = ((material as { details?: MaterialDetails }).details ??
    {}) as MaterialDetails;
  const { characterTemplateMaterials, weaponTemplateMaterials } =
    getMaterialTemplateUsage(material.id);

  return NextResponse.json({
    material,
    parentMaterial,
    childMaterials: getMaterialChildren(material.id),
    characterTemplateMaterials,
    weaponTemplateMaterials,
    droppedByEnemies: getEnemiesByMaterialId(material.id),
    details,
    usedByCharacters: details.usedByCharacters ?? [],
  });
}
