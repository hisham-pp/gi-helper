import materialsData from "@/data/materials.json";
import { MaterialItem } from "@/lib/types";

const materials = materialsData as MaterialItem[];

// Pre-build compact reference dictionary of canonical materials (ID -> Name)
const canonicalMaterials: Record<string, string> = {};
for (const m of materials) {
  canonicalMaterials[m.id] = m.name;
}

const MATERIAL_REFERENCE_JSON = JSON.stringify(canonicalMaterials);

export function getVisionSystemPrompt(): string {
  return `You are an expert Genshin Impact inventory OCR and vision recognition engine.
Analyze this screenshot of a Genshin Impact inventory grid carefully.

TASK:
1. Scan the inventory item grid row-by-row, from top to bottom, left to right.
2. For each visible material item box, match it to the exact canonical material from the REFERENCE MATERIAL LIST below.
3. Read the exact numeric quantity shown at the bottom of the item slot (e.g. 1, 6, 12, 45, 1024, etc.). If an item is present without a visible count or shows 1, set quantity to 1.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "items": [
    {
      "id": "canonical-id",
      "name": "Canonical Name",
      "quantity": 12
    }
  ]
}

RULES:
- You MUST match and select items from the REFERENCE MATERIAL LIST below using their exact canonical "id" and "name".
- Detect all material items visible in the grid (Character Ascension, Talent Books, Weapon Ascension, Mob Drops, Boss Drops, Local Specialties, Ores, Mora, etc.).
- Only read items in the grid. Ignore UI buttons, header tabs, left navigation icons, character models, and sidebar descriptions.
- Quantity must be a valid positive integer.

REFERENCE MATERIAL LIST (Canonical ID to Name):
${MATERIAL_REFERENCE_JSON}`;
}
