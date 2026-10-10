import path from "path";
import fs from "fs";
import { Jimp } from "jimp";
import { detectCellRarity } from "./test_rarity_module";

async function testSingleCrop() {
  const cellImg = await Jimp.read("scripts/cell_0.png");
  const w = cellImg.bitmap.width;
  const h = cellImg.bitmap.height;
  console.log("Single crop image size:", w, "x", h);

  const isSingle = w < 600 || h < 450 || w / h < 1.15;
  console.log("Is single item detected:", isSingle);

  // Detect rarity
  const { rarity } = detectCellRarity(cellImg);
  console.log("Detected rarity of cell_0.png:", rarity, "★");
}

testSingleCrop().catch(console.error);
