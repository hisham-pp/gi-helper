/**
 * Which bag tab (or list) a grid shows, from the text under its cards:
 * weapons and characters read "Lv. 90" (weapons have a star row under the
 * icon, the party setup's characters don't), artifacts "+20" and materials
 * (both the Character Development Items and the Materials tab) a plain
 * count. Cheap and independent of the reference banks, so the browser only
 * downloads the atlas a screenshot needs. When the text can't decide, the
 * recognizer compares the banks.
 */
import type { DetectedCard, DetectedGrid, PixelRect } from "../../grid-detector/types";
import type { RgbaImage } from "../../grid-detector/engine/image";
import type { CardKind } from "../types";
import { IDENTITY_ALIGNMENT, normalizeCardBox } from "./card";
import { type DigitTemplates, readFooter } from "./quantity";
import { readStars } from "./rarity";

/** Cards read per grid; spread over the grid so one odd row can't decide. */
const SAMPLE_CARDS = 8;
/** Share of the readable cards that must agree. */
const MIN_AGREEMENT = 0.6;

export interface KindGuess {
  kind: CardKind | null;
  /** 0–1 */
  confidence: number;
  votes: Record<CardKind, number>;
}

/** Up to `n` cards spread evenly over a grid's complete cards. */
export function spreadCards(grid: DetectedGrid, n: number): DetectedCard[] {
  const cards = grid.cards.filter((c) => !c.clipped && c.width >= 8 && c.height >= 8);
  if (cards.length <= n) return cards;
  return Array.from({ length: n }, (_, k) => cards[Math.floor(((k + 0.5) * cards.length) / n)]);
}

/** `scale`: analysed-image pixels per original pixel (when the image was downscaled). */
export function guessGridKind(
  image: RgbaImage,
  grid: DetectedGrid,
  digits: DigitTemplates,
  scale: { x: number; y: number } = { x: 1, y: 1 },
): KindGuess {
  const votes: Record<CardKind, number> = { material: 0, weapon: 0, artifact: 0, character: 0 };
  for (const card of spreadCards(grid, SAMPLE_CARDS)) {
    const box: PixelRect = normalizeCardBox({
      x: card.x * scale.x,
      y: card.y * scale.y,
      width: card.width * scale.x,
      height: card.height * scale.y,
    });
    const footer = readFooter(image, box, IDENTITY_ALIGNMENT, digits);
    if (footer.prefix === "Lv") votes[readStars(image, box, IDENTITY_ALIGNMENT) ? "weapon" : "character"]++;
    else if (footer.prefix === "+") votes.artifact++;
    else if (footer.prefix === "" && footer.value !== null) votes.material++;
  }
  const total = votes.material + votes.weapon + votes.artifact + votes.character;
  const [kind, count] = (Object.entries(votes) as [CardKind, number][]).sort((a, b) => b[1] - a[1])[0];
  if (total === 0 || count / total < MIN_AGREEMENT || (count < 2 && grid.cards.length > 1)) {
    return { kind: null, confidence: 0, votes };
  }
  return { kind, confidence: Math.round((count / total) * Math.min(1, count / 3) * 1000) / 1000, votes };
}
