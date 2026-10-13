# Inventory Grid Detector

Automatic detection of item cards in inventory screenshots: every card's
bounding box, its row/column in the grid, and a confidence score. Detection
needs no grid size, card size, resolution or layout: Genshin Impact
screenshots are the reference, but the engine relies only on generic
geometry (straight borders, repeated card sizes, regular spacing).

- Engine: `src/lib/grid-detector/engine/` (pure TypeScript, no dependencies)
- Browser API: `src/lib/grid-detector/client.ts` (Web Worker)
- Studio UI: `/debug` → **Grid Auto-Detector Sessions** (`src/components/grid-detector/`)
- Tests: `tests/grid-detector.test.ts`, `tests/grid-detector-samples.test.ts`

Item identification, rarity, quantity OCR and catalog matching are out of
scope; they consume the card boxes and crops produced here.

## Why no OpenCV

The repository had no OpenCV, and its existing CV code is plain TypeScript.
OpenCV.js would add ~8 MB of WASM for operations that are small here: blur,
gradients, and prefix-sum queries over typed arrays. The engine minifies to
about 14 KB and runs unchanged in a Web Worker and in Node, so the same code
is tested against real screenshots with `jimp` and is deterministic.

## Pipeline

| # | Stage | Module | What it does |
|---|-------|--------|--------------|
| 1 | Validation & normalisation | `engine/image.ts`, `validation.ts` | Checks type/size/dimensions; area-average resamples the region of interest to ≤ 1400 px (never upscales); light denoise. |
| 2 | Edges | `engine/edges.ts` | Max-over-RGB gradients (catches colour-only borders), smoothed along the edge, adaptive threshold from the image's own noise floor, thin non-maximum-suppressed edges, prefix sums for O(1) line queries. |
| 3 | Candidates | `engine/candidates.ts` | Traces straight segments, pairs parallel ones and searches the closing sides. Deliberately over-generous. |
| 4 | Filter & dedupe | `engine/filter.ts` | Scores each rectangle (below) and merges near-identical ones (IoU ≥ 0.85). |
| 5 | Size clustering | `engine/cluster.ts` | Groups candidates by width/height (± `sizeTolerance`). |
| 6 | Rows & columns | `engine/lattice.ts` | Per cluster, votes for the row/column pitch, fits `origin + index × pitch`, splits separate grids. |
| 7 | Grid reconstruction | `engine/lattice.ts`, `engine/resolve.ts` | Recovers missed cards at lattice positions, grows the grid while the image confirms it, arbitrates between competing hypotheses. |
| 8 | Confidence | `engine/serialize.ts` | Card: border evidence × lattice alignment × source. Grid: mean card confidence × regularity × size. |
| 9 | Serialisation | `engine/serialize.ts` | Maps analysis pixels back to original-image pixels; zero-based rows/columns; empty slots. |

### Telling cards from look-alikes

Contour-like candidates include far more than cards. Each rectangle gets a
`quality` (0–1) from:

- **Line contrast**: a border is a straight edge with smooth pixels on at
  least one side. Coverage on the line minus the smaller coverage 3 px to
  either side, so dense artwork texture scores ~0.
- **Weakest side**: three strong sides cannot carry a missing fourth.
- **Gutter band**: a "card + gap" rectangle has the real card border inside
  it, and no border runs across the band between that line and the side.
  Real dividers, such as Genshin's quantity strip, are crossed by the card's sides.
- **Band slice**: two sides are pieces of longer UI lines (sidebar edges)
  while the other two are not.
- **Outer flank**: a parallel border just outside a side means the
  rectangle sits on an inner line of a double border.

Then the grid context decides:

- Competing lattices are ranked by evidence, Σ quality² × perimeter, so many
  mediocre fragments cannot outvote fewer, clean, complete cards.
- Sub-parts (artwork panel, quantity strip, star icons) sit inside cards of
  a better-supported grid and are dropped.
- Small coincidental "grids" in UI chrome are dropped once a strong grid exists.
- Rows cut off by a scroll viewport form short-card lattices aligned with
  the main grid. They are dropped by default (`includeClippedCards`).
- Lattice recovery may accept a card with one faint side, or confirm a
  low-contrast card on fainter edges. A row added by growing the grid must
  match the grid's own card quality, which keeps out rows that fade out.
  Positions without evidence stay empty slots; they are never reported as cards.

## Browser API

```ts
import { GridDetectionClient, cropToBlob, isGridDetectionError } from "@/lib/grid-detector";

const client = new GridDetectionClient();
const controller = new AbortController();
try {
  const result = await client.detect(file, { sensitivity: 0.6 }, { signal: controller.signal });
  for (const grid of result.grids) {
    for (const card of grid.cards) {
      // card.x / y / width / height are ORIGINAL image pixels
    }
  }
} catch (err) {
  if (isGridDetectionError(err)) showToast(err.message); // safe for users
}
client.dispose(); // terminates the worker
```

- Runs in a Web Worker and falls back to the main thread when Workers are unavailable.
- Aborting terminates the worker (the engine is synchronous), and the next
  call starts a fresh one. In the studio, a newer request for the same image
  aborts the older one, so stale results never overwrite newer ones.
- Images are decoded without colour management
  (`colorSpaceConversion: "none"`), so results don't depend on the
  display's colour profile, and up to 16 MP are read at native resolution so
  the engine's own resampler matches the tests.
- Errors are `GridDetectionError` with a `code`
  (`UNSUPPORTED_FILE_TYPE`, `FILE_TOO_LARGE`, `EMPTY_FILE`, `DECODE_FAILED`,
  `IMAGE_TOO_SMALL`, `IMAGE_TOO_LARGE`, `INVALID_REGION`, `CANCELLED`,
  `PROCESSING_FAILED`) and a user-facing message. Internal exceptions are
  logged in the worker console, never returned to callers.
- Accepted: PNG, JPEG, WebP, BMP, GIF; ≤ 40 MB; 16 px to 16384 px per side; ≤ 80 MP.

The pure engine works on any RGBA buffer (Node, tests, a canvas):

```ts
import { detectInventoryGrids } from "@/lib/grid-detector";
const result = detectInventoryGrids({ image: { width, height, data } }, settings);
```

Crops at original quality: `cropToBlob(bitmap, card)` (lossless PNG by
default) or `cropToBitmap(bitmap, card)`.

### Result

```ts
interface GridDetectionResult {
  imageWidth: number; imageHeight: number;   // original pixels
  grids: DetectedGrid[];                     // reading order
  totalDetectedCards: number;
  processingTimeMs: number;                  // decode + detection
  warnings: string[];                        // e.g. "No reliable inventory grid was found…"
  settings: DetectionSettings;               // resolved settings used
  diagnostics: { analysisWidth; analysisHeight; analysisScale; edgeThreshold;
                 segmentCount; rawCandidateCount; filteredCandidateCount;
                 sizeClusterCount; stageTimingsMs };
}
interface DetectedGrid {
  id: string; bounds: PixelRect; rows: number; columns: number;
  confidence: number;                        // 0–1
  cards: DetectedCard[];
  cardWidth: number; cardHeight: number; pitchX: number; pitchY: number;
  emptySlots: GridSlot[];                    // lattice positions without a card
}
interface DetectedCard {
  id: string; x: number; y: number; width: number; height: number;
  row: number | null; column: number | null; // zero-based
  confidence: number;                        // 0–1
  source: "detected" | "recovered" | "manual";
  clipped: boolean;                          // only with includeClippedCards
}
```

## Settings

Defaults suit ordinary screenshots. No grid size is ever required.

| Setting | Default | Effect |
|---|---|---|
| `sensitivity` | 0.5 | Higher picks up fainter borders (lower edge threshold and quality bar). |
| `minCardSize` | 24 px | Smallest card side in original pixels. |
| `maxCardSizeRatio` | 1 | Largest card side as a fraction of the image side. |
| `minAspectRatio` / `maxAspectRatio` | 0.35 / 2.5 | Accepted card width ÷ height. |
| `minConfidence` | 0.35 | Cards (and grids) below this are dropped. |
| `sizeTolerance` | 0.12 | Size variation allowed within one grid. |
| `alignmentTolerance` | 0.08 | Misalignment allowed from the lattice, as a share of the pitch. |
| `recoverMissedCards` | true | Fill lattice gaps confirmed by weaker evidence. |
| `includeClippedCards` | false | Report cards cut off by the image edge or a scroll viewport. |
| `region` | null | Region of interest in original pixels; results stay in original pixels. |
| `maxAnalysisSide` | 1400 | Analysis resolution; larger is slower and slightly more precise. |

The studio stores your settings in `localStorage`; the region always applies
to the current image only.

## Studio (`/debug`)

- Upload, drag and drop, paste (Ctrl+V), or load a sample. Each image is
  detected automatically and stored in the browser (IndexedDB sessions).
- The overlay uses original-image coordinates inside one transformed layer,
  so zoom and pan never misalign boxes.
  - **Green**: high confidence. **Amber dashed**: low confidence.
  - **Blue**: manual. **Dotted**: empty slot.
- **Select** tool: click a card for its coordinates, size, confidence and an
  original-resolution crop (downloadable PNG). Drag to move it, use the
  handles to resize, edit the numbers directly, or press **Delete**.
- **Add card**: drag a box. It snaps to the grid's row/column when it lines
  up with the lattice.
- **Region**: drag a region of interest, then **Re-run detection**.
- **Undo/redo** (Ctrl+Z / Ctrl+Shift+Z), **discard edits**, arrow-key nudge
  (Shift = 10 px), Ctrl+wheel zoom, drag to pan, empty-slot toggle.
- Edits persist per image; the summary shows grids, cards, time and diagnostics.

## Accuracy and speed (measured 2026-10-13)

`pnpm eval:grid-detector` reproduces these numbers.

- **Reference screenshots** (`public/samples/grid-test`, 27 images, 552
  cards): precision 1.000 and recall 1.000 against the ground truth in
  `tests/grid-detector/genshin-ground-truth.json`.
  - The set covers full 2800×1272 screenshots with sidebar, header, detail
    panel and cut-off rows; tight crops with "New" badges and a partial last
    row; a 543×368 capture with a selection frame; and a single card.
  - That ground truth was bootstrapped from the detector and then verified
    visually, overlay by overlay. Box IoU on these images is therefore not
    an independent measurement.
  - The same 27 images also pass with emulated JPEG-decoder differences and
    with ±3-level pixel noise.
- **Synthetic scenes** with exact ground truth (10 scenes, 248 cards):
  - Covered: regular, partial row, small square cards, two grids with
    different card sizes, UI chrome, low-contrast borders, large corner
    radius, double borders with 8 px gaps, no grid, and 4K.
  - Precision 1.000, recall 1.000, mean IoU 0.993, worst corner error 3 px
    (on 4K, where one analysis pixel is 2.7 original pixels).
- **Speed** in the production build's Web Worker on an Intel Core 5 120U
  laptop CPU, including decode (median of 3 runs):

  | Input | Time |
  |---|---|
  | 2800×1272 screenshot | 0.7–0.8 s |
  | ~1500×780 crop | 0.4–0.5 s |
  | 543×368 | 0.19 s |
  | single card | 15 ms |

## Limitations

- **Axis-aligned, rectangular cards only**: no perspective, rotation or
  hexagonal layouts. Photos of a screen are out of scope.
- **Border evidence required**: a grid must have at least a few cards with
  visible borders. Borderless icons on a plain background, where only the
  artwork differs, aren't detected.
- **Grid size limits**: a lone card is reported only when it dominates the
  image (≥ 35% of the area). Secondary grids need ≥ 3 cards comparable in
  size to the main grid.
- **Zero-gap layouts**: table-style grids whose cells share borders are
  supported, but weren't part of the reference set.
- **Clipped/faded cards** are excluded by default. With
  `includeClippedCards`, only the visible part is boxed.
- **Speed**: on low-power CPUs, very large screenshots take around a second.
  Detection runs in a worker, so the UI stays responsive.

## Adding test images

1. Put the screenshot in `public/samples/grid-test/` (any resolution or layout).
2. Run the detector and review the overlay in the studio (or with your own
   script). Fix any mistakes with the editor and use **Export Session Grids**
   to get the corrected boxes.
3. Add an entry to `tests/grid-detector/genshin-ground-truth.json`. Cards are
   `[x, y, width, height, row, column]` in original pixels; list grids in
   reading order, with `rows` and `columns`.
4. Run `pnpm test:grid-detector` and `pnpm eval:grid-detector`.

For new layouts that are hard to get as screenshots, add a synthetic scene
(`tests/grid-detector/synthetic.ts` renders scenes with exact ground truth)
to `tests/grid-detector.test.ts`.
