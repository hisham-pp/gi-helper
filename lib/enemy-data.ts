import bossMaterialData from "@/data/materials/boss-material/en.json";
import commonAscensionData from "@/data/materials/common-ascension/en.json";
import cookingIngredientData from "@/data/materials/cooking-ingredients/en.json";
import { enemyArchiveEntries } from "@/lib/enemy-archive";
import { localEnemyEntries } from "@/lib/enemy-local";
import { seedMaterials } from "@/prisma/seed-data/generated/materials";
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

type RawIngredient = {
  name: string;
  description?: string;
  rarity?: number;
  sources?: string[];
};

const rawIngredients = cookingIngredientData as unknown as Record<
  string,
  RawIngredient
>;
const materials = [
  ...seedMaterials,
  ...Object.entries(rawIngredients).map(([id, ingredient]) => ({
    id,
    name: ingredient.name,
    image: `/images/materials/cooking-ingredients/${id}`,
    rarity: ingredient.rarity ?? 1,
    category: "Cooking Ingredient",
    description:
      ingredient.description ?? `${ingredient.name} cooking ingredient.`,
    details: {
      sources: ingredient.sources ?? [],
    },
    combinable: false,
    combineRatio: null,
    parentMaterialId: null,
  })),
];
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
  azhdaha: [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
      note: "Azhdaha cycles Geo plus elemental infusions; avoid Geo and whichever element he is currently infused with, and bring a shielder for his slams.",
    },
  ],
  childe: [
    {
      element: "General",
      bestElements: ["Cryo", "Pyro"],
      note: "Phase one is Hydro (Cryo and Electro work well) and later phases turn Electro (switch to Cryo or Pyro); never mirror his current element.",
    },
  ],
  stormterror: [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
      note: "No shields to break; use ranged attacks or the platform openings with any strong elemental DPS — Anemo damage is resisted.",
    },
  ],
  "lupus-boreas": [
    {
      element: "General",
      bestElements: ["Pyro"],
      note: "Immune to Cryo and Anemo; Pyro (or strong Physical damage) is the reliable answer to his frost attacks.",
    },
  ],
  "lupus-boreas-dominator-of-wolves": [
    {
      element: "General",
      bestElements: ["Pyro"],
      note: "Immune to Cryo and Anemo; Pyro (or strong Physical damage) is the reliable answer to his frost attacks.",
    },
  ],
  "la-signora": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo"],
      note: "Use Pyro against her Cryo first phase, then Hydro or Cryo once she turns Pyro in the second half.",
    },
  ],
  "magatsu-mitake-narukami-no-mikoto": [
    {
      element: "General",
      bestElements: ["Pyro", "Cryo", "Hydro", "Dendro"],
      note: "Immune to Electro; any other strong element works — save burst damage for after her Musou no Hitotachi phase.",
    },
  ],
  "shouki-no-kami-the-prodigal": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Dendro"],
      note: "Immune to Electro and Anemo; use the other elements and break the matrix cubes to interrupt his empowered phases.",
    },
  ],
  "everlasting-lord-of-arcane-wisdom": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Dendro"],
      note: "Immune to Electro and Anemo; use the other elements and break the matrix cubes to interrupt his empowered phases.",
    },
  ],
  "guardian-of-apeps-oasis": [
    {
      element: "General",
      bestElements: ["Electro", "Pyro", "Cryo", "Hydro"],
      note: "Immune to Dendro; clear the consumption phase quickly and burst the exposed core.",
    },
  ],
  "guardian-of-apep-s-oasis": [
    {
      element: "General",
      bestElements: ["Electro", "Pyro", "Cryo", "Hydro"],
      note: "Immune to Dendro; clear the consumption phase quickly and burst the exposed core.",
    },
  ],
  "all-devouring-narwhal": [
    {
      element: "General",
      bestElements: ["Electro", "Cryo", "Dendro", "Pyro"],
      note: "Resists Hydro; keep damage high to shorten the devoured phase and hit the fin weak points.",
    },
  ],
  "the-knave": [
    {
      element: "General",
      bestElements: ["Hydro", "Cryo"],
      note: "Immune to Pyro; Hydro and Cryo counter her Balemoon flames — bring healing to clear the Bond of Life she applies.",
    },
  ],
  "lord-of-eroded-primal-fire": [
    {
      element: "General",
      bestElements: ["Hydro", "Cryo"],
      note: "A Pyro-aligned trounce boss; Hydro and Cryo are the safest counters to its flame phases.",
    },
  ],
  "il-dottore": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Rotates mechanical segments and elemental experiments; bring a flexible multi-element team and adapt to the active phase.",
    },
  ],
  "the-doctor": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Rotates mechanical segments and elemental experiments; bring a flexible multi-element team and adapt to the active phase.",
    },
  ],
  "the-game-before-the-gate": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "No fixed elemental weakness; play around its game-board mechanics and keep sustained damage on the boss.",
    },
  ],
  "iniquitous-baptist": [
    {
      element: "General",
      bestElements: ["Pyro", "Cryo", "Electro", "Hydro"],
      note: "Summons rotating elemental shields; bring at least two counter elements so a single ward never stalls the fight.",
    },
  ],
  "tenebrous-papilla": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Raises a Void Ward below half HP that heavily reduces damage; Natlan Nightsoul attacks bypass it.",
    },
  ],
  "tenebrous-mimiflora": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Raises a Void Ward that heavily reduces damage; Natlan Nightsoul attacks bypass it.",
    },
  ],
  "watcher-fallen-vigil": [
    {
      element: "General",
      bestElements: ["Anemo", "Geo", "Dendro"],
      note: "It records Pyro, Hydro, Cryo, and Electro hits to power Phenomena's Delirium; Anemo, Geo, and Dendro teams avoid feeding it.",
    },
  ],
  "super-heavy-landrover-mechanized-fortress": [
    {
      element: "General",
      bestElements: ["Pyro"],
      note: "Pyro attacks fill its overload gauge and shatter the Cryo shield it raises, stunning it for big damage windows.",
    },
  ],
  "frostnight-herra": [
    {
      element: "General",
      bestElements: ["Hydro", "Electro", "Dendro"],
      note: "Weak to Lunar reactions — Lunar-Charged or Lunar-Bloom teams knock it out of its resistant state fastest.",
    },
  ],
  "the-great-snowboar-king": [
    {
      element: "General",
      bestElements: ["Pyro"],
      note: "Melt his ice armor with Pyro when he hides behind it and becomes invulnerable.",
    },
  ],
  "unusual-hilichurl": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
      note: "No defenses at all — burst him down fast before he flees.",
    },
  ],
};

const familyAdviceFallbacks: Record<string, EnemyElementAdvice[]> = {
  Automatons: [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Machines resist Physical damage; use elemental DPS and hit exposed cores or weak points.",
    },
  ],
  Fatui: [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Counter the active armor or barrier if one appears; otherwise any strong elemental DPS works.",
    },
  ],
  "Other Human Factions": [
    {
      element: "General",
      bestElements: ["Cryo", "Hydro", "Electro", "Pyro"],
      note: "Human fighters carry no elemental armor; any strong damage works, and Freeze or other crowd control keeps them locked down.",
    },
  ],
  "The Abyss": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Counter whichever ward or shield appears, and burst them down between casts.",
    },
  ],
  "Mystical Beasts": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "No fixed elemental armor; use your strongest elemental DPS and dodge their charge attacks.",
    },
  ],
  "Enemies of Note": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "A major boss without a single fixed weakness; bring a flexible team and adapt to its phases.",
    },
  ],
  "Elemental Lifeforms": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"],
      note: "Match the counter to its element when it reveals one; otherwise any strong elemental DPS works.",
    },
  ],
  Hilichurls: [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
      note: "Basic tribal enemies; any strong damage works — counter shields by element if they raise one.",
    },
  ],
  "Unique Enemies": [
    {
      element: "General",
      bestElements: ["Pyro", "Hydro", "Cryo", "Electro"],
      note: "No fixed elemental weakness; use your strongest team and adapt to what it does.",
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
  const richEnemies: EnemyCatalogItem[] =
    localEnemyEntries.map(buildLocalEnemy);
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

function buildLocalEnemy(localEnemy: (typeof localEnemyEntries)[number]) {
  const elements = normalizeElements(localEnemy.elements);
  const advice = buildAdvice(localEnemy.id, elements, localEnemy.family);
  const bestElements = uniqueElements(
    advice.flatMap((item) => item.bestElements),
  );

  return {
    id: localEnemy.id,
    name: localEnemy.name,
    type: localEnemy.type,
    family: localEnemy.family,
    faction: localEnemy.faction,
    region: localEnemy.region,
    description: localEnemy.description,
    elements,
    bestElements,
    materials: collectMaterials(localEnemy.drops as RawEnemy["drops"]),
    image: localEnemy.image,
    portrait: localEnemy.portrait,
    sourceUrl: null,
    advice,
  } satisfies EnemyCatalogItem;
}

function buildArchiveEnemy(archiveEnemy: (typeof enemyArchiveEntries)[number]) {
  const elements = normalizeElements(archiveEnemy.elements);
  const advice = buildAdvice(archiveEnemy.id, elements, archiveEnemy.family);
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
          drop["minimum-level"] ??
          drop.minimumLevel ??
          sourceLevel(drop.source),
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
      const material =
        materialIdLookup.get(id) ?? resolveMaterial(group.name ?? "");

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

  // Tolerate simple plural/singular differences between a drop source and an
  // enemy id, e.g. the "Eremites" source vs the "eremite-*" enemy ids.
  const singularSource = source.replace(/s$/, "");
  const singularEnemy = enemyName.replace(/s$/, "");
  if (
    singularSource.length >= 4 &&
    (singularEnemy.includes(singularSource) ||
      singularSource.includes(singularEnemy))
  ) {
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
    ["sternshieldcrab", "armoredcrab"],
    ["prototypecalbreguet", "icewindsuite"],
    // Boss materials whose "source" uses the overworld/trounce boss name while
    // the enemy catalog uses the archive name.
    ["coraldefenders", "bolteaterbathysmalvishap"],
    ["coraldefenders", "rimebiterbathysmalvishap"],
    ["statueofmarbleandbrass", "legatusgolem"],
    ["kongamato", "gluttonousyumkasaurmountainking"],
    ["holawaqangoubou", "goldflamequcusaurtyrant"],
  ];

  return aliasPairs.some(
    ([left, right]) =>
      (source.includes(left) && enemyName.includes(right)) ||
      (source.includes(right) && enemyName.includes(left)),
  );
}

function buildAdvice(
  id: string,
  elements: EnemyElement[],
  family?: string,
): EnemyElementAdvice[] {
  if (adviceOverrides[id]) {
    return adviceOverrides[id];
  }

  if (elements.length === 0) {
    if (family && familyAdviceFallbacks[family]) {
      return familyAdviceFallbacks[family];
    }

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

function sourceLevel(source?: string) {
  const match = source?.match(/Lv\.\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}
