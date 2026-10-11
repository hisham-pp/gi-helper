import fs from "fs";
import path from "path";
import gdb from "genshin-db";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "materials");
const JSON_FILE = path.join(DATA_DIR, "materials.json");

interface RawMaterial {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity?: number;
  image: string;
  sortRank?: number;
  order?: number;
}

/**
 * Locale-independent four-level sort comparator for materials.
 * Order: sortRank asc (missing → MAX_SAFE_INTEGER), rarity desc (highest rarity first), name asc (locale-insensitive), id asc (tie-breaker).
 */
function compareMaterials(a: RawMaterial, b: RawMaterial): number {
  const rankA = a.sortRank ?? Number.MAX_SAFE_INTEGER;
  const rankB = b.sortRank ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) return rankA - rankB;

  const rarA = a.rarity ?? 0;
  const rarB = b.rarity ?? 0;
  if (rarA !== rarB) return rarB - rarA; // desc: highest rarity first (matches in-game order)

  const nameComp = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  if (nameComp !== 0) return nameComp;

  // Tie-breaker: id (lexicographic, ascending)
  return a.id.localeCompare(b.id, "en");
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://genshin-impact.fandom.com/",
      },
    });
    if (!response.ok)
      throw new Error(
        `unexpected response ${response.status} ${response.statusText}`,
      );
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(buffer));
    return true;
  } catch (error) {
    return false;
  }
}

async function getFandomImageUrl(itemName: string): Promise<string | null> {
  try {
    const formattedName = itemName.replace(/ /g, "_");
    const title = encodeURIComponent(`File:Item_${formattedName}.png`);
    const apiUrl = `https://genshin-impact.fandom.com/api.php?action=query&titles=${title}&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetch(apiUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;

    let url = pages[pageId].imageinfo?.[0]?.url || null;
    if (url) {
      url = url.split("/revision")[0];
    }
    return url;
  } catch (e) {
    return null;
  }
}

async function scrapeMaterials() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const materialNames = gdb.materials("names", {
    matchCategories: true,
  }) as string[];
  const materialsData = [];

  for (const name of materialNames) {
    const material = gdb.materials(name);
    if (!material || !material.images || !material.images.filename_icon)
      continue;

    // Filter to only character/weapon enhancement materials and EXP items
    const validCategories = [
      "AVATAR_MATERIAL",
      "EXP_FRUIT",
      "WEAPON_EXP_STONE",
    ];
    if (!material.category || !validCategories.includes(material.category))
      continue;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const iconName = material.images.filename_icon;
    const url = `https://enka.network/ui/${iconName}.png`;
    const filename = `${id}.png`;

    const existingPath = path.join(IMAGES_DIR, filename);
    let success = false;

    if (fs.existsSync(existingPath)) {
      success = true;
    } else {
      console.log(`Downloading ${name}...`);
      success = await downloadImage(url, filename);
      if (!success) {
        console.log(`  Falling back to Fandom Wiki for ${name}...`);
        const fandomUrl = await getFandomImageUrl(name);
        if (fandomUrl) {
          success = await downloadImage(fandomUrl, filename);
        }
      }
      if (!success) {
        console.log(`  [FAILED] Could not download image for ${name}`);
      }
    }

    const entry: RawMaterial = {
      id,
      name: material.name,
      description: material.description,
      type: material.category,
      rarity: material.rarity,
      image: `/images/materials/${filename}`,
    };

    // Task 1.1: capture sortRank from genshin-db; omit the field entirely if absent
    if (material.sortRank !== undefined && material.sortRank !== null) {
      entry.sortRank = material.sortRank;
    }

    materialsData.push(entry);
  }

  // Task 1.2 / 1.3: sort materials, warn on duplicate sort keys, assign order, write sorted array

  // Warn about duplicate (sortRank, rarity, normalized-name) keys before sorting
  const seenKeys = new Map<string, string>();
  for (const mat of materialsData) {
    const normalizedName = mat.name.normalize("NFC").toLowerCase();
    const key = `${mat.sortRank ?? "MAX"}:${mat.rarity ?? 0}:${normalizedName}`;
    if (seenKeys.has(key)) {
      process.stderr.write(
        `WARNING: duplicate sort key "${key}" for materials "${seenKeys.get(key)}" and "${mat.id}" — tie-breaking by id\n`,
      );
    } else {
      seenKeys.set(key, mat.id);
    }
  }

  // Sort using the locale-independent comparator
  materialsData.sort(compareMaterials);

  // Assign sequential 1-based order integers
  for (let i = 0; i < materialsData.length; i++) {
    materialsData[i].order = i + 1;
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(materialsData, null, 2));
  console.log(`Saved ${materialsData.length} materials to ${JSON_FILE}`);
}

scrapeMaterials().catch(console.error);
