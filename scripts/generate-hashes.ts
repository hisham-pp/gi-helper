import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';
import materialsData from '../src/data/materials.json';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'materials');
const HASHES_FILE = path.join(DATA_DIR, 'material-hashes.json');

async function generateHashes() {
  const hashes: Record<string, string> = {};

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found at ${IMAGES_DIR}. Please run scrape-materials.ts first!`);
    process.exit(1);
  }

  for (const material of materialsData) {
    const imgPath = path.join(IMAGES_DIR, `${material.id}.png`);
    if (!fs.existsSync(imgPath)) {
      console.warn(`Missing image for ${material.id}`);
      continue;
    }

    try {
      const image = await Jimp.read(imgPath);
      // Resize to 9x8 and convert to grayscale for dHash calculation
      image.resize({ w: 9, h: 8 });
      image.greyscale();

      let hash = "";
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const leftPixel = image.getPixelColor(x, y);
          const rightPixel = image.getPixelColor(x + 1, y);
          // Compare luminance
          hash += leftPixel > rightPixel ? "1" : "0";
        }
      }

      // Convert binary to hex
      let hexHash = "";
      for (let i = 0; i < hash.length; i += 4) {
        hexHash += parseInt(hash.slice(i, i + 4), 2).toString(16);
      }

      hashes[material.id] = hexHash;
      console.log(`Hashed ${material.id}: ${hexHash}`);
    } catch (e) {
      console.error(`Failed to hash ${material.id}`, e);
    }
  }

  fs.writeFileSync(HASHES_FILE, JSON.stringify(hashes, null, 2));
  console.log(`Saved ${Object.keys(hashes).length} hashes to ${HASHES_FILE}`);
}

generateHashes().catch(console.error);
