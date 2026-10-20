import type { ReviewCandidate, ScannedReviewItem } from "@/lib/types";
import type { CardRecognition } from "@gi/image-scanner";

/**
 * Formats card candidates for post-scan review UI.
 */
export function formatReviewCandidates(
  card: Pick<CardRecognition, "candidates">,
): ReviewCandidate[] {
  return card.candidates.map((c) => ({
    id: c.id,
    name: c.name,
    rarity: c.rarity,
    confidence: Math.round(c.confidence * 100),
  }));
}

/**
 * Determines diagnostic review reason for a card recognition.
 */
export function determineCardReviewReason(
  card: CardRecognition,
): string | undefined {
  if (card.status === "uncertain") {
    const next = card.candidates[1];
    if (next && next.confidence >= 0.7) {
      return `Runner-up: ${next.name} (${Math.round(next.confidence * 100)}%)`;
    }
    return "Low visual confidence";
  }
  if (card.quantity.text.includes("?")) {
    return "Quantity couldn't be read cleanly";
  }
  return undefined;
}

/**
 * Helper to construct a standard ScannedReviewItem.
 */
export function buildScannedReviewItem(params: {
  id: string;
  materialId: string;
  name: string;
  rarity?: number;
  quantity: number;
  imageSnippet: string;
  sourceImageName: string;
  row?: number;
  col?: number;
  candidates?: ReviewCandidate[];
  reviewReason?: string;
}): ScannedReviewItem {
  return {
    id: params.id,
    materialId: params.materialId,
    name: params.name,
    rarity: params.rarity,
    quantity: Math.max(1, params.quantity),
    imageSnippet: params.imageSnippet,
    sourceImageName: params.sourceImageName,
    row: params.row,
    col: params.col,
    candidates: params.candidates,
    reviewReason: params.reviewReason,
  };
}
