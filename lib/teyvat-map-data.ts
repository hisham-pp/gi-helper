import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Gem,
  Leaf,
  Moon,
  Mountain,
  Snowflake,
  Sparkles,
  Waves,
  Wind,
  Zap,
} from "lucide-react";

export type MapLayerId =
  | "teyvat"
  | "underground"
  | "enkanomiya"
  | "sea-of-bygone-eras";

export type CollectibleKind =
  | "anemoculus"
  | "geoculus"
  | "electroculus"
  | "dendroculus"
  | "hydroculus"
  | "pyroculus"
  | "lunoculus"
  | "lumenspar"
  | "spirit-carp";

export type MapRegionId =
  | "mondstadt"
  | "liyue"
  | "inazuma"
  | "sumeru"
  | "fontaine"
  | "natlan"
  | "nod-krai"
  | "chasm"
  | "enkanomiya";

export type MapCollectible = {
  id: string;
  label: string;
  kind: CollectibleKind;
  region: MapRegionId;
  layer: MapLayerId;
  x: number;
  y: number;
  elevation: "surface" | "underground" | "underwater" | "sky";
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
    description: "Surface exploration across the seven nations.",
  },
  {
    id: "underground",
    label: "Underground",
    description: "Caves, mines, ruins, and multi-floor oculus routes.",
  },
  {
    id: "enkanomiya",
    label: "Enkanomiya",
    description: "Separate sub-map with its own key sigil routes.",
  },
  {
    id: "sea-of-bygone-eras",
    label: "Sea",
    description: "Fontaine's underwater ruins and layered sea spaces.",
  },
];

export const collectibleMeta: CollectibleMeta[] = [
  {
    id: "anemoculus",
    label: "Anemoculus",
    total: 66,
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
    id: "electroculus",
    label: "Electroculus",
    total: 181,
    colorClass: "bg-violet-400 text-violet-950 ring-violet-200",
    icon: Zap,
  },
  {
    id: "dendroculus",
    label: "Dendroculus",
    total: 271,
    colorClass: "bg-lime-400 text-lime-950 ring-lime-200",
    icon: Leaf,
  },
  {
    id: "hydroculus",
    label: "Hydroculus",
    total: 271,
    colorClass: "bg-sky-400 text-sky-950 ring-sky-200",
    icon: Waves,
  },
  {
    id: "pyroculus",
    label: "Pyroculus",
    total: 271,
    colorClass: "bg-red-400 text-red-950 ring-red-200",
    icon: Flame,
  },
  {
    id: "lunoculus",
    label: "Lunoculus",
    total: 192,
    colorClass: "bg-indigo-300 text-indigo-950 ring-indigo-100",
    icon: Moon,
  },
  {
    id: "lumenspar",
    label: "Lumenspar",
    total: 80,
    colorClass: "bg-cyan-300 text-cyan-950 ring-cyan-100",
    icon: Gem,
  },
  {
    id: "spirit-carp",
    label: "Spirit Carp",
    total: 50,
    colorClass: "bg-rose-300 text-rose-950 ring-rose-100",
    icon: Sparkles,
  },
];

export const teyvatCollectibles: MapCollectible[] = [
  {
    id: "anemoculus-stormbearer-peak",
    label: "Stormbearer Peak ridge",
    kind: "anemoculus",
    region: "mondstadt",
    layer: "teyvat",
    x: 19,
    y: 27,
    elevation: "sky",
    hint: "Ride the wind current near the cliff and glide back toward the peak.",
    routeNote: "Start from the northern Stormbearer waypoint.",
  },
  {
    id: "anemoculus-windwail-highland",
    label: "Windwail Highland tree",
    kind: "anemoculus",
    region: "mondstadt",
    layer: "teyvat",
    x: 23,
    y: 42,
    elevation: "surface",
    hint: "Look above the large tree canopy west of the winery path.",
    routeNote: "Approach from Dawn Winery and climb the high branch.",
  },
  {
    id: "geoculus-qingce-rooftop",
    label: "Qingce rooftop",
    kind: "geoculus",
    region: "liyue",
    layer: "teyvat",
    x: 31,
    y: 52,
    elevation: "surface",
    hint: "Hidden above the village roofline, easiest after climbing the terrace.",
    routeNote: "Use the village waypoint and sweep rooftops north to south.",
  },
  {
    id: "geoculus-guyun-islet",
    label: "Guyun Stone Forest islet",
    kind: "geoculus",
    region: "liyue",
    layer: "teyvat",
    x: 43,
    y: 67,
    elevation: "sky",
    hint: "Float above the small islet between stone pillars.",
    routeNote: "Glide from the domain island for a clean descent.",
  },
  {
    id: "electroculus-narukami-shrine",
    label: "Grand Narukami Shrine pass",
    kind: "electroculus",
    region: "inazuma",
    layer: "teyvat",
    x: 62,
    y: 52,
    elevation: "sky",
    hint: "Suspended near the shrine approach, above the torii-lined path.",
    routeNote: "Drop from the shrine waypoint and face the lower trail.",
  },
  {
    id: "electroculus-serai-cave-mouth",
    label: "Seirai cave mouth",
    kind: "electroculus",
    region: "inazuma",
    layer: "underground",
    x: 69,
    y: 67,
    elevation: "underground",
    hint: "Inside a cave entrance beneath the stormy plateau.",
    routeNote: "Switch to underground layer after reaching the Amakumo route.",
  },
  {
    id: "dendroculus-vanarana-root",
    label: "Vanarana root hollow",
    kind: "dendroculus",
    region: "sumeru",
    layer: "underground",
    x: 46,
    y: 41,
    elevation: "underground",
    hint: "Inside the hollow root network, not visible from the surface path.",
    routeNote: "Use the nearby cave mouth and follow the root tunnel downward.",
  },
  {
    id: "dendroculus-desert-ruin-shaft",
    label: "Hypostyle ruin shaft",
    kind: "dendroculus",
    region: "sumeru",
    layer: "underground",
    x: 43,
    y: 72,
    elevation: "underground",
    hint: "Deep in a desert ruin shaft behind a mechanism room.",
    routeNote: "Mark it after clearing the ruin elevator loop.",
  },
  {
    id: "hydroculus-elynas-spine",
    label: "Elynas spine pool",
    kind: "hydroculus",
    region: "fontaine",
    layer: "teyvat",
    x: 53,
    y: 28,
    elevation: "surface",
    hint: "Floating above the rib-like terrain near a shallow pool.",
    routeNote: "Sweep Elynas from the central waypoint toward the coast.",
  },
  {
    id: "hydroculus-bygone-era-current",
    label: "Bygone Era current",
    kind: "hydroculus",
    region: "fontaine",
    layer: "sea-of-bygone-eras",
    x: 59,
    y: 38,
    elevation: "underwater",
    hint: "Inside an underwater current route in the Sea of Bygone Eras.",
    routeNote: "Follow the current ring, then break off at the marble arch.",
  },
  {
    id: "pyroculus-coatepec-canopy",
    label: "Coatepec canopy",
    kind: "pyroculus",
    region: "natlan",
    layer: "teyvat",
    x: 34,
    y: 79,
    elevation: "sky",
    hint: "Above a high canopy route where saurian movement helps with reach.",
    routeNote: "Start from the high ridge and glide toward the canopy marker.",
  },
  {
    id: "pyroculus-tequemecan-cavern",
    label: "Tequemecan cavern",
    kind: "pyroculus",
    region: "natlan",
    layer: "underground",
    x: 30,
    y: 84,
    elevation: "underground",
    hint: "Below the volcanic path in a side cavern.",
    routeNote: "Clear the cavern loop before returning to surface pins.",
  },
  {
    id: "lunoculus-nod-krai-dock",
    label: "Nod-Krai moonlit dock",
    kind: "lunoculus",
    region: "nod-krai",
    layer: "teyvat",
    x: 74,
    y: 22,
    elevation: "surface",
    hint: "Near the dock structures along the northern coastline.",
    routeNote: "Sweep the coastline after unlocking nearby navigation points.",
  },
  {
    id: "lunoculus-frostmoon-undercroft",
    label: "Frostmoon undercroft",
    kind: "lunoculus",
    region: "nod-krai",
    layer: "underground",
    x: 80,
    y: 31,
    elevation: "underground",
    hint: "In a lower chamber under the moonlit ruin path.",
    routeNote: "Use the layer switch after descending below the ruin.",
  },
  {
    id: "lumenspar-ad-hoc-main-tunnel",
    label: "Ad-Hoc Main Tunnel",
    kind: "lumenspar",
    region: "chasm",
    layer: "underground",
    x: 36,
    y: 61,
    elevation: "underground",
    hint: "Along the Chasm mine tunnel, close to a suspended platform.",
    routeNote: "Track this with underground routes, not the surface Chasm map.",
  },
  {
    id: "lumenspar-stony-halls",
    label: "Stony Halls drop",
    kind: "lumenspar",
    region: "chasm",
    layer: "underground",
    x: 41,
    y: 66,
    elevation: "underground",
    hint: "Below the Stony Halls route, visible after dropping to the lower path.",
    routeNote: "Use a vertical sweep and mark the upper-level pins first.",
  },
  {
    id: "spirit-carp-chizhang-wall",
    label: "Chizhang Wall offering",
    kind: "spirit-carp",
    region: "liyue",
    layer: "teyvat",
    x: 38,
    y: 58,
    elevation: "surface",
    hint: "Near Chenyu Vale's high stone route and offering area.",
    routeNote: "Pair it with the carp route through southern Chenyu Vale.",
  },
  {
    id: "spirit-carp-yaodie-valley",
    label: "Yaodie Valley cliff",
    kind: "spirit-carp",
    region: "liyue",
    layer: "teyvat",
    x: 34,
    y: 47,
    elevation: "sky",
    hint: "Hovering near a cliffside travel route in Chenyu Vale.",
    routeNote: "Approach from above to avoid climbing back up.",
  },
  {
    id: "enkanomiya-key-sigil-temple",
    label: "Evernight Temple route",
    kind: "electroculus",
    region: "enkanomiya",
    layer: "enkanomiya",
    x: 56,
    y: 52,
    elevation: "surface",
    hint: "Representative Enkanomiya marker for sub-map routing.",
    routeNote:
      "Use the separate sub-map so these do not mix with Inazuma pins.",
  },
];
