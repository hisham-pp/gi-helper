import fs from 'fs';
import path from 'path';
import gdb from 'genshin-db';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'materials');
const JSON_FILE = path.join(DATA_DIR, 'materials.json');

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(path.join(IMAGES_DIR, filename), Buffer.from(buffer));
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
  }
}

async function scrapeMaterials() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const materialNames = gdb.materials('names', { matchCategories: true }) as string[];
  const materialsData = [];

  for (const name of materialNames) {
    const material = gdb.materials(name);
    if (!material || !material.images || !material.images.filename_icon) continue;

    // Filter to only character/weapon enhancement materials
    if (!material.category || !material.category.includes('MATERIAL')) continue;

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const iconName = material.images.filename_icon;
    const url = `https://enka.network/ui/${iconName}.png`;
    const filename = `${id}.png`;
    
    console.log(`Downloading ${name}...`);
    await downloadImage(url, filename);
    
    materialsData.push({
      id,
      name: material.name,
      description: material.description,
      type: material.category,
      rarity: material.rarity,
      image: `/images/materials/${filename}`
    });
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(materialsData, null, 2));
  console.log(`Saved ${materialsData.length} materials to ${JSON_FILE}`);
}

scrapeMaterials().catch(console.error);
