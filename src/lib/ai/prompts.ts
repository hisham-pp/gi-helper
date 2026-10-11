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
2. For each fully visible material item box, match it to the exact canonical material from the REFERENCE MATERIAL LIST below.
3. Read the exact numeric quantity shown at the bottom of the item slot (e.g. 1, 6, 12, 45, 1024, etc.). If an item is present without a visible count or shows 1, set quantity to 1.
4. EXCLUDE PARTIALLY VISIBLE / CUT-OFF ITEMS: If an item slot is only half-visible, partially sliced, or cut off by the edges of the image (especially at the bottom or top row during scrolling), completely AVOID and SKIP it. Do not guess truncated items or items whose count area is cut off.

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
- Detect all complete material items visible in the grid (Character Ascension, Talent Books, Weapon Ascension, Mob Drops, Boss Drops, Local Specialties, Ores, Mora, etc.).
- AVOID HALF-VISIBLE / CUT-OFF ITEMS: Some materials may be half-visible or cut off by the border/scroll edge. Avoid and omit them from the JSON response. Only output items that are fully visible with their complete slot and quantity.
- Only read items in the grid. Ignore UI buttons, header tabs, left navigation icons, character models, and sidebar descriptions.
- Quantity must be a valid positive integer.

VISUAL DISAMBIGUATION HINTS (CRITICAL TO DISTINGUISH LOOKALIKE FAMILIES):
- RUIN "CHAOS" RELICS:
  * "chaos-oculus", "chaos-axis", "chaos-gear": Star-shaped dark metal gear/cannon nozzles (4★ Chaos Oculus has bright orange-yellow glowing star light inside; 3★ Chaos Axis has an open star gear with dark center; 2★ Chaos Gear is a dark star nozzle frame).
  * "chaos-bolt", "chaos-module", "chaos-storage": Cylindrical tubes/canisters with a glowing triangle symbol (Δ) on the circular end face.
  * "chaos-core", "chaos-circuit", "chaos-device": Spherical round orbs/cores.
- PRISMS:
  * "polarizing-prism", "crystal-prism", "dismal-prism": Translucent blue/purple diamond crystal shards/gems floating freely (Mirror Maiden drops).
  * "radiant-prism", "turbid-prism", "damaged-prism": Triangular ceremonial badges/blades mounted in gold/metal frames (Primal Construct drops).
- CLAWS & STATUETTES:
  * "concealed-talon", "concealed-unguis", "concealed-claw": 3 sharp black claws with blue feathers and cyan crystal crest on top (Rifthounds).
  * "deathly-statuette", "dark-statuette", "gloomy-statuette": Dark ceremonial stone tablets/plaques with glowing red/gold runes (Shadowy Husks).
- FUNGAL NUCLEI:
  * "robust-fungal-nucleus", "dormant-fungal-nucleus", "inactivated-fungal-nucleus": Greenish-cyan spiral shell/fruit resting on a wooden woven pedestal/tray.

REFERENCE MATERIAL LIST (Canonical ID to Name):
${MATERIAL_REFERENCE_JSON}`;
}
