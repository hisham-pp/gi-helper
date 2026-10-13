/**
 * Inventory-order context.
 *
 * Genshin lists Character Development Items in a fixed order (`order` in the
 * catalog), so within one grid, read row by row, every card's order is
 * larger than the previous card's (no material appears twice). Visual
 * near-ties — same-tier talent books, gem slivers vs. fragments — can be
 * resolved by that constraint.
 *
 * Decoding is a Viterbi pass over the cards in reading order. Each card may
 * only switch to a candidate whose error is within `window` of its best, and
 * pays the error difference; every order inversion between neighbours costs
 * `penalty`. A clear visual match therefore always wins; the order only
 * decides between candidates that look the same.
 */
export interface SequenceCandidate {
  order: number;
  /** Ranking error (lower is better). */
  error: number;
}

export interface SequenceOptions {
  /** Cost of one order inversion between neighbouring cards. */
  penalty: number;
  /** Only candidates within this error of the card's best are considered. */
  window: number;
}

/**
 * Returns, per card, the index of the chosen candidate. Cards with no
 * candidates (unrecognised) break the chain.
 */
export function decodeInventoryOrder(cards: SequenceCandidate[][], options: SequenceOptions): number[] {
  const choice = cards.map(() => 0);
  let start = 0;
  while (start < cards.length) {
    while (start < cards.length && cards[start].length === 0) start++;
    let end = start;
    while (end < cards.length && cards[end].length > 0) end++;
    if (end - start >= 2) decodeChain(cards, start, end, options, choice);
    start = end;
  }
  return choice;
}

function decodeChain(
  cards: SequenceCandidate[][],
  start: number,
  end: number,
  { penalty, window }: SequenceOptions,
  choice: number[],
) {
  const options = cards.slice(start, end).map((cands) => {
    const best = Math.min(...cands.map((c) => c.error));
    return cands
      .map((c, index) => ({ index, order: c.order, cost: c.error - best }))
      .filter((c) => c.cost <= window);
  });
  const cost: number[][] = [options[0].map((o) => o.cost)];
  const back: number[][] = [options[0].map(() => -1)];
  for (let i = 1; i < options.length; i++) {
    const prev = options[i - 1];
    const prevCost = cost[i - 1];
    cost.push([]);
    back.push([]);
    for (const o of options[i]) {
      let bestCost = Infinity;
      let bestPrev = 0;
      for (let k = 0; k < prev.length; k++) {
        const c = prevCost[k] + (prev[k].order < o.order ? 0 : penalty);
        if (c < bestCost) {
          bestCost = c;
          bestPrev = k;
        }
      }
      cost[i].push(bestCost + o.cost);
      back[i].push(bestPrev);
    }
  }
  const last = cost[cost.length - 1];
  let k = last.indexOf(Math.min(...last));
  for (let i = options.length - 1; i >= 0; i--) {
    choice[start + i] = options[i][k].index;
    k = back[i][k];
  }
}
