import fs from 'fs';
import path from 'path';
import genshindb from 'genshin-db';

const DATA_DIR = path.join(process.cwd(), 'data');
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

  console.log('Fetching materials from genshin-db...');
  const allMaterialNames = genshindb.materials('names', { matchCategories: true }) || [];
  
  const materials = [];

  for (const name of allMaterialNames) {
    const mat = genshindb.materials(name);
    if (!mat) continue;

    const id = mat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const imageUrl = mat.images?.fandom || mat.images?.nameicon;

    if (imageUrl) {
      const filename = `${id}.png`;
      await downloadImage(imageUrl, filename);
    }

    materials.push({
      id: id,
      name: mat.name,
      description: mat.description || '',
      type: mat.materialtype || '',
      rarity: mat.rarity ? parseInt(mat.rarity as string, 10) : 1,
      image: `/images/materials/${id}.png`
    });
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(materials, null, 2));
  console.log(`Saved ${materials.length} materials to ${JSON_FILE}`);
}

scrapeMaterials().catch(console.error);

