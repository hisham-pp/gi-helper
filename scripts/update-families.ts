import fs from "fs";
import path from "path";

const JSON_FILE = path.join(process.cwd(), "src", "data", "materials.json");
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function getGroupForMaterial(itemName: string): Promise<string | null> {
  try {
    const formattedName = itemName.replace(/ /g, "_");
    const apiUrl = `https://genshin-impact.fandom.com/api.php?action=query&prop=revisions&titles=${encodeURIComponent(formattedName)}&rvprop=content&rvslots=main&format=json`;
    const res = await fetch(apiUrl, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1") return null;
    
    const wikitext = pages[pageId].revisions?.[0]?.slots?.main?.["*"];
    if (!wikitext) return null;
    
    // Look for |group = XYZ
    const match = wikitext.match(/\|\s*group\s*=\s*(.+)/);
    if (match) {
      // Remove any wiki links e.g. [[Slime Materials]] -> Slime Materials
      let group = match[1].trim();
      group = group.replace(/\[\[(.*?)\]\]/g, (m: string, p1: string) => {
        return p1.split('|').pop() || p1;
      });
      return group;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, "utf-8"));
  let updated = 0;
  
  for (const item of data) {
    if (item.family) continue;
    
    const group = await getGroupForMaterial(item.name);
    if (group) {
      console.log(`Found family for ${item.name}: ${group}`);
      item.family = group;
      updated++;
    } else {
      console.log(`No family found for ${item.name}`);
    }
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  
  if (updated > 0) {
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
    console.log(`Updated ${updated} materials with family data.`);
  } else {
    console.log("No new families to update.");
  }
}

run().catch(console.error);