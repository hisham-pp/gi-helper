import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

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

  console.log('Launching browser to scrape genshintrack.com...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://genshintrack.com/dashboard/inventory', { waitUntil: 'networkidle' });

  // Wait for the material cards to load
  // According to genshintrack.com, they have material cards. We'll extract them.
  // Wait a bit to ensure JS loads data
  await page.waitForTimeout(5000);

  // Note: we might need to click "All" or navigate, but let's try to extract what's on the page.
  // Since we don't know the exact DOM structure, we'll extract images and their alt text/labels.
  const extractedMaterials = await page.evaluate(() => {
    const items: { id: string; name: string; imageUrl: string; }[] = [];
    
    // Look for image elements that seem to be materials
    // Usually they are inside divs with some text
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src;
      // Many sites use alt for name, or nearby text
      let name = img.alt || '';
      
      // If no alt, try to find text in parent or sibling
      if (!name) {
        const parent = img.parentElement?.parentElement;
        if (parent && parent.innerText) {
          name = parent.innerText.split('\n')[0].trim();
        }
      }
      
      if (name && src && src.includes('http') && !src.includes('logo') && !src.includes('avatar')) {
        // filter out generic images
        if (name.length > 2) {
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          items.push({ id, name, imageUrl: src });
        }
      }
    });
    
    // Remove duplicates
    const uniqueMap = new Map();
    items.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    
    return Array.from(uniqueMap.values());
  });

  console.log(`Found ${extractedMaterials.length} potential materials.`);

  const materialsData = [];

  for (const item of extractedMaterials) {
    const filename = `${item.id}.png`;
    console.log(`Downloading ${item.name}...`);
    await downloadImage(item.imageUrl, filename);
    
    materialsData.push({
      id: item.id,
      name: item.name,
      description: "",
      type: "material",
      rarity: 1,
      image: `/images/materials/${filename}`
    });
  }

  fs.writeFileSync(JSON_FILE, JSON.stringify(materialsData, null, 2));
  console.log(`Saved ${materialsData.length} materials to ${JSON_FILE}`);
  
  await browser.close();
}

scrapeMaterials().catch(console.error);
