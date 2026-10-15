export interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  rarity?: number;
}

export interface ReviewCandidate {
  id: string;
  name: string;
  rarity?: number;
  confidence: number;
}

export interface ScannedReviewItem {
  id: string;
  materialId: string;
  name: string;
  quantity: number;
  rarity?: number;
  imageSnippet: string;
  sourceImageName: string;
  row?: number;
  col?: number;
  candidates?: ReviewCandidate[];
  /** Why this slot should be double-checked (e.g. a close runner-up or an unreadable quantity). */
  reviewReason?: string;
}

export interface ProcessScanResult {
  items: DetectedItem[];
  reviewItems: ScannedReviewItem[];
}

export interface MaterialItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity?: number;
  image: string;
  sortRank?: number;
  order: number;
  family?: string;
  /** Materials-tab items (other-materials.json) carry their category. */
  category?: string;
  /** Region of a local specialty. */
  region?: string;
}
