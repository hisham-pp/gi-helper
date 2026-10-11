import { findTopCandidates } from "../../src/lib/cv/item-matcher";
import materialHashes from "../../src/data/material-hashes.json";

const h1 = (materialHashes as any)["black-bronze-horn"];
const candidates = findTopCandidates(h1, 5, { expectedRarity: 3 });
console.log("Matches for Black Bronze Horn (expectedRarity 3):");
console.log(
  candidates.map(
    (c) =>
      `${c.name} (${c.confidence}%) - hashSim: ${c.hashSim} colorSim: ${c.colorSim}`,
  ),
);

const h2 = (materialHashes as any)["ley-line-sprout"];
const candidates2 = findTopCandidates(h2, 5, { expectedRarity: 4 });
console.log("\nMatches for Ley Line Sprout (expectedRarity 4):");
console.log(
  candidates2.map(
    (c) =>
      `${c.name} (${c.confidence}%) - hashSim: ${c.hashSim} colorSim: ${c.colorSim}`,
  ),
);
