/**
 * Merging the cards read in many frames of one recording.
 *
 * A material shows up in every frame that passes over its card. Each sighting
 * votes for the quantity it read, weighted by how sure the recognizer was, so
 * a frame where a touch marker or compression smeared the digits is outvoted
 * by the clean ones. Frames that clearly disagree are flagged for review.
 */
import type {
  CardRecognition,
  CardRecognitionStatus,
} from "@gi/image-scanner";
import { CONFLICT_VOTE_SHARE } from "./constants/video.constants";
import type { MergedMaterial, Sighting } from "./types/merge.types";

export type { MergedMaterial, Sighting };

const STATUS_RANK: Record<CardRecognitionStatus, number> = {
  unknown: 0,
  uncertain: 1,
  matched: 2,
};

interface ValueVote {
  weight: number;
  count: number;
  best: Sighting;
}

interface MaterialVotes {
  values: Map<number | null, ValueVote>;
  sightings: number;
  status: CardRecognitionStatus;
  confidence: number;
  firstSeen: number;
}

/** Key of one (material, quantity) pair; each keeps its own clearest sighting. */
export function sightingKey(
  materialId: string,
  quantity: number | null,
): string {
  return `${materialId}|${quantity ?? "?"}`;
}

/** Weight of a sighting's quantity vote: recognised and legible counts most. */
function voteWeight(card: CardRecognition): number {
  const statusFactor = card.status === "matched" ? 1 : 0.4;
  return (
    statusFactor *
    Math.max(0.05, card.confidence) *
    Math.max(0.05, card.quantity.confidence)
  );
}

export class SightingMerger {
  private readonly byMaterial = new Map<string, MaterialVotes>();

  /**
   * Adds the cards of one frame. Returns the sightings that are now the
   * clearest one for their (material, quantity) pair, so the caller can crop
   * them from the frame while it still has it.
   */
  add(
    frame: number,
    time: number,
    cards: readonly CardRecognition[],
  ): Sighting[] {
    const improved: Sighting[] = [];
    // A frame shows each card once; if it reports a material twice, keep the clearer card.
    const perFrame = new Map<string, CardRecognition>();
    for (const card of cards) {
      if ((card.kind && card.kind !== "material") || !card.material) continue;
      const prev = perFrame.get(card.material.id);
      if (!prev || card.confidence > prev.confidence)
        perFrame.set(card.material.id, card);
    }
    for (const [id, card] of perFrame) {
      const sighting: Sighting = { frame, time, card };
      let votes = this.byMaterial.get(id);
      if (!votes) {
        votes = {
          values: new Map(),
          sightings: 0,
          status: card.status,
          confidence: 0,
          firstSeen: time,
        };
        this.byMaterial.set(id, votes);
      }
      votes.sightings++;
      votes.confidence = Math.max(votes.confidence, card.confidence);
      if (STATUS_RANK[card.status] > STATUS_RANK[votes.status])
        votes.status = card.status;
      votes.firstSeen = Math.min(votes.firstSeen, time);

      const value = card.quantity.value;
      const vote = votes.values.get(value);
      if (!vote) {
        votes.values.set(value, {
          weight: voteWeight(card),
          count: 1,
          best: sighting,
        });
        improved.push(sighting);
      } else {
        vote.weight += voteWeight(card);
        vote.count++;
        if (card.confidence > vote.best.card.confidence) {
          vote.best = sighting;
          improved.push(sighting);
        }
      }
    }
    return improved;
  }

  get size(): number {
    return this.byMaterial.size;
  }

  /** One entry per material, in the order they were first seen. */
  result(): MergedMaterial[] {
    const merged: MergedMaterial[] = [];
    for (const [materialId, votes] of this.byMaterial) {
      // Readable quantities win over "unreadable" whatever their weight.
      const readable = [...votes.values.entries()].filter(([v]) => v !== null);
      const pool = readable.length > 0 ? readable : [...votes.values.entries()];
      pool.sort((a, b) => b[1].weight - a[1].weight);
      let winIdx = 0;
      const topVal = pool[0][0];
      if (topVal !== null) {
        const topStr = String(topVal);
        for (let i = 1; i < pool.length; i++) {
          const candVal = pool[i][0];
          if (candVal === null) continue;
          const candStr = String(candVal);
          // If the leading vote was a truncated prefix/suffix of a longer number with confident sighting
          if (
            candStr.length > topStr.length &&
            (candStr.startsWith(topStr) || candStr.endsWith(topStr)) &&
            pool[i][1].best.card.quantity.confidence >= 0.25 &&
            pool[i][1].weight >= pool[0][1].weight * 0.4
          ) {
            winIdx = i;
            break;
          }
        }
      }
      const [quantity, top] = pool[winIdx];
      const total = pool.reduce((s, [, v]) => s + v.weight, 0);
      const runnerUpVote = pool.find((_, idx) => idx !== winIdx);
      const runnerUp = runnerUpVote?.[1].weight ?? 0;
      const runnerUpVal = runnerUpVote?.[0];
      const isTruncation =
        quantity !== null &&
        runnerUpVal !== null &&
        runnerUpVal !== undefined &&
        (String(quantity).startsWith(String(runnerUpVal)) ||
          String(quantity).endsWith(String(runnerUpVal)) ||
          String(runnerUpVal).startsWith(String(quantity)) ||
          String(runnerUpVal).endsWith(String(quantity)));

      const card = top.best.card;
      merged.push({
        materialId,
        name: card.material!.name,
        rarity: card.material!.rarity,
        quantity,
        status: votes.status,
        confidence: votes.confidence,
        quantityConfidence: card.quantity.confidence,
        sightings: votes.sightings,
        agreeing: top.count,
        quantityConflict:
          total > 0 && !isTruncation && runnerUp / total >= CONFLICT_VOTE_SHARE,
        firstSeen: votes.firstSeen,
        best: top.best,
        candidates: card.candidates,
      });
    }
    return merged.sort(
      (a, b) => a.firstSeen - b.firstSeen || orderInFrame(a.best, b.best),
    );
  }
}

function orderInFrame(a: Sighting, b: Sighting): number {
  return (
    (a.card.row ?? 0) - (b.card.row ?? 0) ||
    (a.card.column ?? 0) - (b.card.column ?? 0)
  );
}
