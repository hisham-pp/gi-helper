import fs from "fs";
import path from "path";
import gdb from "genshin-db";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const IMAGES_DIR = path.join(process.cwd(), "public", "images", "materials");
const JSON_FILE = path.join(DATA_DIR, "materials.json");

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function downloadImage(url: string, filename: string): Promise<boolean> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok)
      throw new Error(`unexpected response ${response.status} ${response.statusText}`);
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
    const apiUrl = `https://genshin-impact.fandom.com/api.php?action=query&titles=File:Item_${formattedName}.png&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetch(apiUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;
    return pages[pageId].imageinfo?.[0]?.url || null;
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

    // Filter to only character/weapon enhancement materials
    if (!material.category || !material.category.includes("MATERIAL")) continue;

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

    materialsData.push({
      id,
      name: material.name,
      description: material.description,
      type: material.category,
      rarity: material.rarity,
      image: `/images/materials/${filename}`,
    });
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(materialsData, null, 2));
  console.log(`Saved ${materialsData.length} materials to ${JSON_FILE}`);
}

scrapeMaterials().catch(console.error);
