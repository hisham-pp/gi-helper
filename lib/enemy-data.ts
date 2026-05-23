import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import bossMaterialData from "@/data/materials/boss-material/en.json";
import commonAscensionData from "@/data/materials/common-ascension/en.json";
import { enemyArchiveEntries } from "@/lib/enemy-archive";
import { getAllMaterials } from "@/lib/static-data";
import type { SeedMaterial } from "@/prisma/seed-data";

export const enemyElements = [
  "Anemo",
  "Geo",
  "Electro",
  "Dendro",
  "Hydro",
  "Pyro",
  "Cryo",
] as const;

export type EnemyElement = (typeof enemyElements)[number];

export type EnemyMaterial = {
  id: string | null;
  name: string;
  rarity: number | null;
  minimumLevel: number | null;
  source: string | null;
  material: SeedMaterial | null;
};

export type EnemyElementAdvice = {
  element: EnemyElement | "General";
  bestElements: EnemyElement[];
  note: string;
};

export type EnemyCatalogItem = {
  id: string;
  name: string;
  type: string;
  family: string;
  faction: string | null;
  region: string;
  description: string;
  elements: EnemyElement[];
  bestElements: EnemyElement[];
  materials: EnemyMaterial[];
  image: string | null;
  portrait: string | null;
  sourceUrl: string | null;
  advice: EnemyElementAdvice[];
};

type RawDrop = {
  name?: string;
  rarity?: number;
  "minimum-level"?: number;
  minimumLevel?: number;
  source?: string;
};

type RawEnemy = {
  id?: string;
  name?: string;
  type?: string;
  family?: string;
  faction?: string;
  region?: string;
  description?: string;
  elements?: string[];
  "elemental-description"?: Array<{ element?: string }>;
  "elemental-descriptions"?: Array<{ element?: string }>;
  drops?: RawDrop[] | Record<string, RawDrop[]> | string;
};

type RawMaterialGroup = {
  items?: Array<{
    id?: string;
    name?: string;
    rarity?: number;
  }>;
  sources?: string[];
  name?: string;
  rarity?: number;
  source?: string;
};

const materials = getAllMaterials();
const materialLookup = new Map(
  materials.map((material) => [normalizeLookup(material.name), material]),
);
const materialIdLookup = new Map(
  materials.map((material) => [material.id, material]),
);
const inferredDropGroups = buildInferredDropGroups();

const counterByElement: Record<
  EnemyElement,
  { bestElements: EnemyElement[]; note: string }
> = {
  Anemo: {
    bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
    note: "Use reactive elemental damage and avoid relying on Anemo damage into Anemo-resistant variants.",
  },
  Geo: {
    bestElements: ["Geo"],
    note: "Geo damage, heavy attacks, and shield-breaking pressure are the most reliable into Geo armor or constructs.",
  },
  Electro: {
    bestElements: ["Pyro", "Cryo", "Dendro"],
    note: "Pyro, Cryo, and Dendro all remove Electro wards efficiently through Overloaded, Superconduct, or Quicken-related reactions.",
  },
  Dendro: {
    bestElements: ["Pyro", "Electro"],
    note: "Pyro is excellent for burning Dendro defenses, while Electro works well for reaction pressure.",
  },
  Hydro: {
    bestElements: ["Dendro", "Cryo", "Electro"],
    note: "Dendro and Cryo are especially strong into Hydro wards; Electro is a useful fallback for steady gauge damage.",
  },
  Pyro: {
    bestElements: ["Hydro", "Cryo"],
    note: "Hydro is the cleanest Pyro shield counter, with Cryo as a strong alternative when Hydro is unavailable.",
  },
  Cryo: {
    bestElements: ["Pyro"],
    note: "Pyro is the fastest practical counter to Cryo armor, shields, and infused enemies.",
  },
};

const adviceOverrides: Record<string, EnemyElementAdvice[]> = {
  "fatui-skirmisher": [
    {
      element: "Pyro",
      bestElements: ["Hydro"],
      note: "Use Hydro into Pyroslinger armor.",
    },
    {
      element: "Hydro",
      bestElements: ["Electro"],
      note: "Use Electro into Hydrogunner armor.",
    },
    {
      element: "Cryo",
      bestElements: ["Pyro"],
      note: "Use Pyro into Cryogunner armor.",
    },
    {
      element: "Electro",
      bestElements: ["Cryo"],
      note: "Use Cryo into Electrohammer armor.",
    },
    {
      element: "Geo",
      bestElements: ["Geo"],
      note: "Use Geo or heavy shield-breaking attacks into Geochanter armor.",
    },
  ],
  hilichurl: [
    {
      element: "Dendro",
      bestElements: ["Pyro"],
      note: "Pyro quickly burns wooden shields and Dendro hilichurl defenses.",
    },
    {
      element: "Cryo",
      bestElements: ["Pyro"],
      note: "Pyro is best into ice shields.",
    },
    {
      element: "Pyro",
      bestElements: ["Hydro", "Cryo"],
      note: "Hydro and Cryo work well into Pyro variants.",
    },
    {
      element: "Electro",
      bestElements: ["Pyro", "Cryo", "Dendro"],
      note: "Use reaction elements to pressure Electro variants.",
    },
  ],
  mitachurl: [
    {
      element: "General",
      bestElements: ["Pyro", "Geo"],
      note: "Use Pyro for wooden shields and Geo or heavy attacks for rock shields.",
    },
  ],
  lawachurl: [
    {
      element: "Cryo",
      bestElements: ["Pyro"],
      note: "Pyro is the strongest answer to Frostarm armor.",
    },
    {
      element: "Geo",
      bestElements: ["Geo"],
      note: "Geo and heavy shield-breaking pressure work best into Stonehide armor.",
    },
  ],
  "ruin-drake": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Hit exposed cores to interrupt them; choose elements around the current resistance/infusion instead of forcing one counter.",
    },
  ],
  "ruin-guard": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Elemental DPS is preferred because ruin machines have high Physical resistance; weak-point hits create longer openings.",
    },
  ],
  "ruin-hunter": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Bring ranged weak-point control and elemental DPS rather than leaning on Physical damage.",
    },
  ],
  "ruin-grader": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Disable leg and eye weak points, then use elemental damage during the opening.",
    },
  ],
  "ruin-sentinel": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Ruin Sentinels are best handled with elemental DPS and quick repositioning.",
    },
  ],
};

let cachedEnemies: EnemyCatalogItem[] | null = null;

export function getAllEnemies() {
  if (!cachedEnemies) {
    cachedEnemies = buildEnemyCatalog();
  }

  return cachedEnemies;
}

export function getEnemyById(enemyId: string) {
  return getAllEnemies().find((enemy) => enemy.id === enemyId) ?? null;
}

export function getEnemiesByMaterialId(materialId: string) {
  return getAllEnemies().filter((enemy) =>
    enemy.materials.some((drop) => drop.id === materialId),
  );
}

function buildEnemyCatalog() {
  const richEnemies: EnemyCatalogItem[] = [
    ...readEnemyDirectory("data/enemies", "public/images/enemies"),
    ...readEnemyDirectory(
      "data/boss/weekly-boss",
      "public/images/boss/weekly-boss",
      {
        defaultFamily: "Enemies of Note",
        defaultType: "Weekly Boss",
        defaultRegion: "Trounce Domain",
      },
    ),
  ];
  const enemiesById = new Map(richEnemies.map((enemy) => [enemy.id, enemy]));

  for (const archiveEnemy of enemyArchiveEntries.map(buildArchiveEnemy)) {
    const existingEnemy = enemiesById.get(archiveEnemy.id);

    if (existingEnemy) {
      enemiesById.set(archiveEnemy.id, {
        ...existingEnemy,
        family: existingEnemy.family || archiveEnemy.family,
        elements: uniqueElements([
          ...existingEnemy.elements,
          ...archiveEnemy.elements,
        ]),
        bestElements: uniqueElements([
          ...existingEnemy.bestElements,
          ...archiveEnemy.bestElements,
        ]),
        image: existingEnemy.image ?? archiveEnemy.image,
        portrait: existingEnemy.portrait ?? archiveEnemy.portrait,
        sourceUrl: archiveEnemy.sourceUrl,
      });
      continue;
    }

    enemiesById.set(archiveEnemy.id, archiveEnemy);
  }

  return Array.from(enemiesById.values()).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type.localeCompare(right.type);
    }

    return left.name.localeCompare(right.name);
  });
}

function readEnemyDirectory(
  dataDirectory: string,
  imageDirectory: string,
  defaults: {
    defaultFamily?: string;
    defaultType?: string;
    defaultRegion?: string;
  } = {},
) {
  const root = process.cwd();
  const fullDataDirectory = join(root, dataDirectory);

  if (!existsSync(fullDataDirectory)) {
    return [];
  }

  return readdirSync(fullDataDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name;
      const raw = readJson<RawEnemy>(join(fullDataDirectory, id, "en.json"));
      const elements = normalizeElements([
        ...(raw.elements ?? []),
        ...(raw["elemental-description"] ?? []).map((item) => item.element),
        ...(raw["elemental-descriptions"] ?? []).map((item) => item.element),
      ]);
      const advice = buildAdvice(id, elements);
      const bestElements = uniqueElements(
        advice.flatMap((item) => item.bestElements),
      );
      const image = findPublicAsset(imageDirectory, id, "icon");
      const portrait = findPublicAsset(imageDirectory, id, "portrait");

      return {
        id,
        name: raw.name ?? titleize(id),
        type: raw.type ?? defaults.defaultType ?? "Enemy",
        family: raw.family ?? defaults.defaultFamily ?? "Unknown",
        faction: raw.faction ?? null,
        region: raw.region ?? defaults.defaultRegion ?? "Global",
        description: raw.description ?? `${titleize(id)} enemy details.`,
        elements,
        bestElements,
        materials: collectMaterials(raw.drops),
        image,
        portrait,
        sourceUrl: null,
        advice,
      };
    });
}

function buildArchiveEnemy(archiveEnemy: (typeof enemyArchiveEntries)[number]) {
  const elements = normalizeElements(archiveEnemy.elements);
  const advice = buildAdvice(archiveEnemy.id, elements);
  const bestElements = uniqueElements(
    advice.flatMap((item) => item.bestElements),
  );

  return {
    id: archiveEnemy.id,
    name: archiveEnemy.name,
    type: archiveEnemy.type,
    family: archiveEnemy.family,
    faction: null,
    region: archiveEnemy.region,
    description: archiveEnemy.description,
    elements,
    bestElements,
    materials: inferMaterialsForEnemy(archiveEnemy.name),
    image: archiveEnemy.image,
    portrait: archiveEnemy.image,
    sourceUrl: archiveEnemy.wikiUrl,
    advice,
  } satisfies EnemyCatalogItem;
}

function collectMaterials(drops: RawEnemy["drops"]): EnemyMaterial[] {
  if (!drops || typeof drops === "string") {
    return [];
  }

  const flattenedDrops = Array.isArray(drops)
    ? drops
    : Object.values(drops ?? {}).flat();

  return flattenedDrops
    .filter((drop) => drop.name)
    .map((drop) => {
      const material = resolveMaterial(drop.name ?? "");

      return {
        id: material?.id ?? null,
        name: material?.name ?? drop.name ?? "Unknown Material",
        rarity: drop.rarity ?? material?.rarity ?? null,
        minimumLevel:
          drop["minimum-level"] ?? drop.minimumLevel ?? sourceLevel(drop.source),
        source: drop.source ?? null,
        material,
      };
    });
}

function inferMaterialsForEnemy(enemyName: string) {
  const normalizedEnemyName = normalizeLookup(enemyName);
  const matchingGroups = inferredDropGroups.filter((group) =>
    group.sources.some((source) =>
      sourceMatchesEnemy(normalizeLookup(source), normalizedEnemyName),
    ),
  );

  return matchingGroups.flatMap((group) =>
    group.items.map((item) => toEnemyMaterial(item)),
  );
}

function buildInferredDropGroups() {
  const commonGroups = Object.values(
    commonAscensionData as Record<string, RawMaterialGroup>,
  )
    .filter((group) => group.items?.length && group.sources?.length)
    .map((group) => ({
      sources: group.sources ?? [],
      items: (group.items ?? []).flatMap((item) => {
        const material = item.id
          ? materialIdLookup.get(item.id)
          : resolveMaterial(item.name ?? "");

        return material
          ? [
              {
                id: material.id,
                name: material.name,
                rarity: item.rarity ?? material.rarity,
              },
            ]
          : [];
      }),
    }));

  const bossGroups = Object.entries(
    bossMaterialData as Record<string, RawMaterialGroup>,
  )
    .filter(([, group]) => group.source)
    .map(([id, group]) => {
      const material = materialIdLookup.get(id) ?? resolveMaterial(group.name ?? "");

      return {
        sources: [group.source ?? ""],
        items: material
          ? [
              {
                id: material.id,
                name: material.name,
                rarity: group.rarity ?? material.rarity,
              },
            ]
          : [],
      };
    });

  return [...commonGroups, ...bossGroups].filter(
    (group) => group.sources.length > 0 && group.items.length > 0,
  );
}

function toEnemyMaterial(item: { id: string; name: string; rarity: number }) {
  const material = materialIdLookup.get(item.id) ?? null;

  return {
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    minimumLevel: null,
    source: null,
    material,
  };
}

function sourceMatchesEnemy(source: string, enemyName: string) {
  if (!source || !enemyName) {
    return false;
  }

  if (enemyName.includes(source) || source.includes(enemyName)) {
    return true;
  }

  const aliasPairs = [
    ["hilichurlarcher", "hilichurlshooter"],
    ["fatuioperative", "fatuifrostoperative"],
    ["fatuioperative", "fatuiwindoperative"],
    ["fontemeraberrant", "blubberbeast"],
    ["fontemeraberrant", "hunterray"],
    ["fontemeraberrant", "armoredcrab"],
    ["fontemeraberrant", "balloctopus"],
    ["fontemeraberrant", "seahorse"],
    ["fontemeraberrant", "hare"],
    ["hydrophantasm", "taintedwater"],
    ["clockworkmeka", "meka"],
    ["breacherprimus", "breacher"],
    ["consecratedbeast", "consecrated"],
    ["saurian", "koholasaur"],
    ["saurian", "tepetlisaur"],
    ["saurian", "yumkasaur"],
    ["saurian", "iktomisaur"],
    ["frostnightscion", "frostnight"],
  ];

  return aliasPairs.some(
    ([left, right]) =>
      (source.includes(left) && enemyName.includes(right)) ||
      (source.includes(right) && enemyName.includes(left)),
  );
}

function buildAdvice(id: string, elements: EnemyElement[]): EnemyElementAdvice[] {
  if (adviceOverrides[id]) {
    return adviceOverrides[id];
  }

  if (elements.length === 0) {
    return [
      {
        element: "General",
        bestElements: [],
        note: "No fixed elemental counter is listed; bring your strongest team and match any temporary shield or infusion that appears.",
      },
    ];
  }

  return elements.map((element) => ({
    element,
    bestElements: counterByElement[element].bestElements,
    note: counterByElement[element].note,
  }));
}

function normalizeElements(values: Array<string | undefined>) {
  return uniqueElements(
    values
      .filter((value): value is string => Boolean(value))
      .map((value) => {
        const normalized = value.trim().toLowerCase();

        if (normalized === "cyro" || normalized === "cydro") {
          return "Cryo";
        }

        return enemyElements.find(
          (element) => element.toLowerCase() === normalized,
        );
      })
      .filter((element): element is EnemyElement => Boolean(element)),
  );
}

function uniqueElements(values: EnemyElement[]) {
  return enemyElements.filter((element) => values.includes(element));
}

function resolveMaterial(name: string) {
  const normalized = normalizeLookup(name);
  return (
    materialLookup.get(normalized) ??
    materialLookup.get(normalized.replace(/s$/, "")) ??
    null
  );
}

function normalizeLookup(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\u00ad/g, "")
    .replace(/["'’]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function findPublicAsset(directory: string, id: string, asset: string) {
  const fullPath = join(process.cwd(), directory, id, asset);

  if (!existsSync(fullPath)) {
    return null;
  }

  return `/${directory.replaceAll("\\", "/").replace("public/", "")}/${id}/${asset}`;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function sourceLevel(source?: string) {
  const match = source?.match(/Lv\.\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
