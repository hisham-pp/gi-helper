import { Jimp } from "jimp";

async function compareGrays() {
  const synth = await Jimp.read("synthetic_chaos_device.png");
  const user = await Jimp.read("user_crop_extracted.png");

  // Synthetic hash generation in generate-hashes.ts:
  // cx = 0.1 * 256 = 25, cy = 25, cw = 206, ch = 206
  const synthCrop = synth.clone().crop({ x: 25, y: 25, w: 206, h: 206 }).resize({ w: 17, h: 16 });

  // User crop hashing in image-hasher.ts:
  // cx = 0.1 * w, cy = 0.1 * h, cw = 0.8 * w, ch = 0.8 * h
  const userW = user.bitmap.width, userH = user.bitmap.height;
  const userCrop = user.clone().crop({
    x: Math.floor(userW * 0.1),
    y: Math.floor(userH * 0.1),
    w: Math.floor(userW * 0.8),
    h: Math.floor(userH * 0.8)
  }).resize({ w: 17, h: 16 });

  await synthCrop.write("synth_17x16.png");
  await userCrop.write("user_17x16.png");

  console.log("Saved synth_17x16.png and user_17x16.png");
}

compareGrays().catch(console.error);
