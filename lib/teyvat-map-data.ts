import type { LucideIcon } from "lucide-react";
import { Mountain, Snowflake, Wind } from "lucide-react";

import collectibleMarkers from "@/data/interactive-map/collectibles.json";

export type MapLayerId = "teyvat" | "underground";

export type CollectibleKind = "anemoculus" | "geoculus" | "crimson-agate";

export type MapRegionId = "mondstadt" | "liyue" | "dragonspine";

export type MapCollectible = {
  id: string;
  label: string;
  kind: CollectibleKind;
  region: MapRegionId;
  layer: MapLayerId;
  x: number;
  y: number;
  sourceId: number;
  sourceCoordinates: [number, number];
  hint: string;
  routeNote: string;
};

export type CollectibleMeta = {
  id: CollectibleKind;
  label: string;
  total: number;
  colorClass: string;
  icon: LucideIcon;
};

export const mapLayers: Array<{
  id: MapLayerId;
  label: string;
  description: string;
}> = [
  {
    id: "teyvat",
    label: "Teyvat",
    description: "Real imported surface pins, one marker per collectible.",
  },
  {
    id: "underground",
    label: "Underground",
    description:
      "Ready for underground item data when a reliable source exists.",
  },
];

export const collectibleMeta: CollectibleMeta[] = [
  {
    id: "anemoculus",
    label: "Anemoculus",
    total: 65,
    colorClass: "bg-emerald-400 text-emerald-950 ring-emerald-200",
    icon: Wind,
  },
  {
    id: "geoculus",
    label: "Geoculus",
    total: 131,
    colorClass: "bg-amber-400 text-amber-950 ring-amber-200",
    icon: Mountain,
  },
  {
    id: "crimson-agate",
    label: "Crimson Agate",
    total: 79,
    colorClass: "bg-rose-300 text-rose-950 ring-rose-100",
    icon: Snowflake,
  },
];

export const mapDataSource = {
  name: "GenshinMap / YuanshenOutput Raw_Data.json",
  url: "https://github.com/Alkmaaar/genshinmap.github.io",
  license: "GPL-3.0",
  note: "Imported marker-level coordinates. Newer oculi are omitted until a reusable marker source is added.",
};

export const teyvatCollectibles = collectibleMarkers as MapCollectible[];

export const totalImportedMarkers = teyvatCollectibles.length;

export const importedMarkerKinds = collectibleMeta.map((item) => item.id);
