export interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  rarity?: number;
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
}
