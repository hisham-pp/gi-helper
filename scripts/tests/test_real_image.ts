import { Jimp } from "jimp";
import fs from "fs";
import { findTopCandidates } from "../../src/lib/cv/item-matcher";
import materialHashes from "../../src/data/material-hashes.json";

// Constants from hashing
const DHASH_W = 17;
const DHASH_H = 16;
const HIST_BINS = 8;

async function testImage() {
  // Load the sample screenshot
  const screenshot = await Jimp.read("C:/workspace/pers/gi-helper/public/samples/GenshinImpact_20261009_220802.jpg");
  
  // Try to crop a known cell. Let's just crop something around x=100, y=100.
  // Actually, we need a precise cell crop like the scanner does.
  // Scanner grid-detector.ts slice config (approx):
  // cellWidth = w / 9.5; cellHeight = h / 5;
  // Let's just use Jimp to do what image-hasher.ts does to the "SCANNED" image in the UI screenshot.
  
  const uiScreenshot = await Jimp.read("C:/Users/hisha/.gemini/antigravity-ide/brain/f088f26d-28c4-4165-a95b-348e26bd4c3a/.user_uploaded/media_1791613641691.png");
  // Crop the SCANNED box from the UI screenshot.
  // By inspecting the UI, the SCANNED box is around x=60, y=300? 
  // Let's find it by searching for a specific pixel or just hardcoding an area to save it and view it.
  
  uiScreenshot.crop(50, 200, 250, 300);
  await uiScreenshot.writeAsync("C:/workspace/pers/gi-helper/scripts/tests/extracted_cell.png");
  console.log("Extracted cell from UI screenshot.");
}

testImage().catch(console.error);
