import { DetailedCellSlice, GridConfig } from "./grid-detector";
import { CellStats } from "./image-hasher";
import { MatchCandidate } from "./item-matcher";
import { RarityResult } from "./rarity-detector";

export interface CellDebugData {
  slice: DetailedCellSlice;
  stats: CellStats;
  rarity: RarityResult;
  fingerprint: {
    dHash: string;
    colorHist: number[];
    bitString: string;
  };
  topCandidates: MatchCandidate[];
  matched: MatchCandidate | null;
  ocr: {
    rawText: string;
    quantity: number;
    elapsedMs: number;
  } | null;
  timings: {
    sliceMs: number;
    hashMs: number;
    matchMs: number;
    ocrMs?: number;
    totalMs: number;
  };
  error?: string;
}

export interface DebugHyperparams {
  minConfidence: number; // 0..100
  emptyThreshold: number; // typically 18
  hashWeight: number; // 0..1
  colorWeight: number; // 0..1
  neighborNames?: string[];
}

export interface ScanBenchmark {
  totalCells: number;
  emptyCells: number;
  occupiedCells: number;
  matchedItems: number;
  totalQuantity: number;
  avgConfidence: number;
  sliceTotalMs: number;
  hashTotalMs: number;
  matchTotalMs: number;
  ocrTotalMs: number;
  totalElapsedMs: number;
}
