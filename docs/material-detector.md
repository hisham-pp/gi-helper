# Material Recognizer

Identifies every card found by the [grid detector](grid-detector.md): which
catalog material it shows, its rarity and the quantity printed under it, with
a confidence that says when a human should check. The same engine reads the
bag's other tabs and the party setup's character list (see
[Other kinds](#other-kinds-weapons-artifacts-characters)). Everything runs
on-device; no API key, nothing uploaded.

- Engine: `src/lib/material-detector/engine/` (pure TypeScript, no dependencies)
- Browser API: `src/lib/material-detector/client.ts` (Web Worker: decode → grids → kinds → recognition)
- UI: the **Scanner** and **Video** tabs on `/` (see [video scanner](video-scanner.md)), and `/debug` → **Grid & Material Studio**
  (labels on the image, per-card candidates, live re-recognition after box edits)
- Reference data: `public/data/<kind>-atlas.{webp,json}` (material, weapon, artifact, character), `src/data/digit-templates.json`
- Tests: `tests/material-detector.test.ts`, `tests/material-detector-samples.test.ts`, `tests/card-scanner.test.ts`
- Evaluation: `pnpm eval:material-detector`, `pnpm eval:card-scanner` (players' screenshots, `pnpm fetch:online-samples` first)

## Card anatomy

Measured on the reference screenshots, as fractions of the card box
(W = width, H ≈ 1.22 W). The layout is the same at every resolution.

```
┌────────────┐  0
│  artwork   │   catalog icon (256² PNG) drawn exactly over this W × W square,
│  (W × W)   │   on a rarity-coloured background; a "New" badge may cover the
│   ★★★★     │   top-right corner and overhang the card's top edge
├────────────┤  0.82 H  cream footer (= W / H)
│     63     │   stars 0.715–0.835 H, centred · digits 0.865–0.958 H
└────────────┘  1
```

## Pipeline

| # | Stage | Module | What it does |
|---|-------|--------|--------------|
| 1 | Box | `card.ts` | Corrects the box to the card aspect ratio, anchored at the bottom (a "New" badge inflates detected boxes upwards). A box that fits poorly is re-located from the cream footer (`snapToFooter`) and kept if the catalog fits it better. |
| 2 | Sampling | `card.ts` | Area-average resample into a canonical 64 × 78 frame; detects and masks a "New" badge. |
| 3 | Coarse pass | `match.ts` | Composite error (below) of all 481 references at 32 px. |
| 4 | Rarity | `rarity.ts` | Star count from the width of the star row (stars touch; 0.143 W + 0.1565 W per extra star) and the background hue (grey / teal / blue / violet / orange). |
| 5 | Fine pass | `match.ts` | Shortlist (coarse error + rarity penalty) re-scored at 64 px. |
| 6 | Alignment | `recognize.ts` | Pattern search over shift/scale of the box for the leader, then individually for close contenders. |
| 7 | Quantity | `quantity.ts` | Otsu threshold of the digit band, connected components, recognition-driven splitting of touching digits, template correlation. |
| 8 | Context | `context.ts` | Viterbi pass per grid: among near-identical candidates, prefer the one that keeps Genshin's fixed inventory order between neighbours. |
| 9 | Confidence | `recognize.ts` | Mean fit, worst local fit, margin to the runner-up, rarity agreement → `matched` / `uncertain` / `unknown`. |

### Matching by compositing

The catalog icons have alpha, and in game they are drawn unchanged over the
card's background. So for a candidate with premultiplied colour I and alpha α
the card should look like `I + (1 − α) × B`. B is estimated per row from the
pixels the candidate leaves uncovered (the background is a vertical
gradient), so no background colours are hard-coded. The error checks colours,
silhouette (uncovered pixels must look like background) and that nothing else
is drawn — and per-pixel errors are truncated so an overlay can't dominate.

Confidence is deliberately strict about *local* disagreement: a material
missing from the catalog is usually matched to a sibling (same talent book
with another emblem, same gem in another colour) whose mean error looks fine
but which leaves a hot spot. The worst 8 × 8 block error catches that; a
material whose tier contradicts the stars and background is flagged too.

### What the legacy CV pipeline got wrong

The original pipeline (formerly `src/lib/cv/`, removed) used a fixed 1080p grid, a grayscale
dHash plus an RGB histogram of the icon over a flat rarity colour, and
Tesseract for quantities. That could not separate colour variants (Agnidus
vs. Prithiva gems share a silhouette), depended on the grid layout, and read
the quantity as white text although it is dark text on a cream footer.

## Accuracy

`pnpm eval:material-detector` on the 13 labelled screenshots of
`public/samples/test-set-01` (272 cards, 2800 × 1272):

| Condition | Material | Rarity | Quantity | Notes |
|---|---|---|---|---|
| Native resolution | 100% | 100% | 100% | all `matched`; worst margin to runner-up 0.017 |
| Half resolution (cards ~91 px) | 100% | 100% | 100% | |
| One third (cards ~64 px) | 92.6% | 93.8% | 92.6% | every error is in one screenshot where the grid detector itself fails; nothing wrong is `matched` |
| Boxes displaced up to 10% (`--jitter 0.1`) | 100% | 100% | 100% | hand-drawn boxes |
| Boxes displaced up to 15% | 96.7% | 99.3% | 96.3% | failures are `uncertain` |
| True material removed from the catalog (`--impostors`) | — | — | — | 272 / 272 flagged (`uncertain`/`unknown`), also at half resolution |

Recognition takes ~0.4 s for a 21-card screenshot in a browser worker,
including alignment; the reference bank (2.2 MB) is fetched once and cached.

## Browser API

```ts
import { MaterialScanClient, isMaterialDetectionError } from "@/lib/material-detector";

const client = new MaterialScanClient();
client.preload(); // optional: fetch the reference bank early
try {
  const { detection, recognition } = await client.scan(file, {}, {
    signal,
    onProgress: ({ stage, done, total }) => {},   // "decoding" | "detecting" | "loading-references" | "recognizing"
  });
  for (const card of recognition.cards) {
    card.material?.id; card.quantity.value; card.rarity.value; card.status; card.confidence;
  }
  recognition.items; // aggregated per material (duplicates from overlapping screenshots merged)
} catch (err) {
  if (isMaterialDetectionError(err)) showToast(err.message); // safe for users
}
// An already decoded image, e.g. a video frame (the worker gets a copy; close yours):
const frame = await client.scanFrame(await createImageBitmap(video), {}, { signal });
// Re-recognise after editing boxes:
const result = await client.recognize(file, editedGrids);
client.dispose();
```

React: `useMaterialScanClient({ preload: true })` (`@/lib/material-detector/react`).
Errors use the grid detector's codes plus `REFERENCES_UNAVAILABLE` and
`REFERENCES_INVALID`. The pure engine works on any RGBA buffer:

```ts
import { createReferenceBank, recognizeMaterials } from "@/lib/material-detector";
const result = recognizeMaterials({ image, grids }, createReferenceBank(manifest, atlasPixels), settings);
```

### Result

```ts
interface CardRecognition {
  cardId: string; gridId: string; row: number | null; column: number | null;
  box: PixelRect;          // as detected/edited (original pixels)
  matchedBox: PixelRect;   // after aspect correction, footer snap and alignment
  status: "matched" | "uncertain" | "unknown";
  material: MaterialCandidate | null;  // { id, name, rarity, error, confidence }
  candidates: MaterialCandidate[];     // best first
  rarity: { value; stars; background; confidence };
  quantity: { value: number | null; text: string; confidence: number };
  hasNewBadge: boolean; orderAdjusted: boolean; confidence: number;
}
```

## Settings

| Setting | Default | Effect |
|---|---|---|
| `shortlistSize` | 12 | References re-ranked at full resolution. |
| `candidateCount` | 5 | Alternatives reported per card. |
| `useRarity` | true | Rank and judge candidates with the rarity read from the card. |
| `useInventoryOrder` | true | Break near-ties with Genshin's inventory order. |
| `refineAlignment` | true | Footer snapping and shift/scale search around each box. |
| `readQuantity` | true | Read the quantity. |
| `minConfidence` | 0.5 | Below this a match is `uncertain`. |

## Other kinds: weapons, artifacts, characters

The bag's Weapons and Artifacts tabs and the party setup's character list use
the same card as materials (an icon over the rarity background in the top
W × W square, a cream footer), so the pipeline is the same with another
reference bank. What differs:

| Kind | Bank (atlas) | Footer | Overlays (masked while matching, then read) |
|---|---|---|---|
| `material` | Character Development Items + the Materials tab (766) | count | "New" badge |
| `weapon` | every weapon: base, awakened (shown from ascension 2) and HoYoLAB's framing where it differs from enka.network's (668) | `Lv. 90` | refinement badge and lock (top-left), equipped avatar (top-right) |
| `artifact` | every set × slot (299); one tile serves every rarity of a piece | `+20` | lock (top-left), equipped avatar |
| `character` | every playable character's avatar (122) | `Lv. 90`, no star row | element icon (top-left), favourite star |

- **Which kind** (`engine/kind.ts`): a few cards' footers are read without any
  bank. "Lv." with a star row is a weapon, "Lv." without one a character,
  "+" an artifact, a bare number a material. So the browser downloads only
  the atlas a screenshot needs. When the text can't tell, every bank is loaded
  and the one whose icons fit best decides (`source: "icons"`).
  `settings.kind` forces one.
- **Footer** (`readFooter`): the "L", "v" and "+" glyphs have templates of their own
  (`symbols` in `digit-templates.json`, learned from players' screenshots by
  `pnpm build:digit-templates`; "v" and "+" are also told apart by height and
  baseline). The level is read on the icon-aligned box, the box itself and the
  box found from the cream footer, and the most confident reading with the
  expected prefix wins. A card in an equipment grid whose footer is a plain
  count (enhancement ores, artifact EXP items) is reported `unknown`.
- **Refinement and lock** (`engine/equipment.ts`): the badge is a light digit
  on a dark box (yellow on brown for R5), compared with the digit templates
  restricted to 1–5. The lock is a salmon padlock in either corner slot.
- **Variants**: a weapon's tiles are one item; the matched `variant`
  ("awakened"…) tells the ascension is at least 2. Candidates are reported
  per item, so a weapon's own variants are never each other's runner-up.
- **No inventory order** for weapons, artifacts or characters (they repeat or
  are sorted by level), so the order context and the per-material
  aggregation (`items`) only apply to materials.
- **Wider alignment** for equipment (±9% vertically, footer snapping from
  error 0.15): some weapons are drawn slightly zoomed or shifted.

Not read yet: an artifact's main stat (only flowers' and plumes' is known
from the slot) and substats, who has a weapon or artifact equipped, and a
character's constellation and talents. They need the detail panel or the
character screen.

### Accuracy on players' screenshots

`pnpm eval:card-scanner` on `tests/online-samples` (16 screenshots from PC
and phones, 1080p to 2532 × 1170, labels checked by eye):

| Kind | Cards | Item | Confidently matched | Level / count | Refinement · rarity | Lock |
|---|---|---|---|---|---|---|
| Weapons | 276 | 100% | 97.5% | 100% | 100% | 100% |
| Artifacts | 86 | 100% | 100% | 100% | 100% | 100% |
| Materials tab | 37 | 100% | 100% | 100% | | |
| Characters | 28 | 100% | 100% | 100% | | |

No card is wrong and `matched`; a few weapons whose in-game icon matches
neither icon source are `uncertain` and go to review. The grid detector misses
the selected card (white highlight) and some screenshots altogether (four of
the downloaded ones), and at half resolution 1080p PC screenshots (cards ~55 px)
lose rows.

## Reference data

- **Atlases** — `pnpm build:atlases [kind…]` renders every icon of each kind
  to a 64² tile, stored as lossless WebP: `materials.json` (256² icons) and
  `other-materials.json` (thumbnails), `weapons.json` (`public/images/weapons`,
  `weapons-awakened`, `weapons-alt`), `artifact-sets.json` and
  `characters.json` (avatars). It is also the last step of `pnpm sync-data`.
  It needs sharp for the WebP icons and uses the copy installed with Next.js.
- **Digit templates** — `pnpm build:digit-templates` averages the glyphs of
  the labelled cards and drops samples that contradict their label.

## Adding test images

1. Add the screenshot to `public/samples/…`.
2. Run the recognizer on it (e.g. in the studio), check every card against
   the image, and add `[row, column, materialId, quantity]` entries to
   `tests/material-detector/ground-truth.json` (rows/columns as reported by
   the grid detector).
3. Re-run `pnpm build:digit-templates` if new glyph shapes matter, then
   `pnpm test:material-detector` and `pnpm eval:material-detector`.

## Limits

- The material catalog is the Character Development Items and Materials tabs
  (766 materials). Cards from other tabs (food, gadgets, quest items) are
  reported as `unknown` or `uncertain`, not guessed.
- New game materials need `pnpm sync-data` (catalog, icons, atlas) before
  they can be recognised; until then they are flagged for review.
- Very small screenshots (cards under ~60 px) are limited by grid detection
  first.
- The ground-truth quantities in `public/samples/test-set-01/expected.json`
  have two errors (Tea-Scented Tassel is 3, Guide to Conflict is 17); the
  per-card ground truth uses the values visible in the screenshots.
