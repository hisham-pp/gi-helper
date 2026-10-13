/**
 * Builds every GI Helper icon from one master image:
 *
 *   scripts/brand/icon-source.{png,webp}   the icon as a rounded tile, any size,
 *                                          on a plain white (or transparent) square
 *
 *   src/app/favicon.ico                    16/32/48 px browser tab icon
 *   src/app/icon.png                       256² tab icon, transparent corners
 *   src/app/apple-icon.png                 180² iOS home screen (full bleed)
 *   public/icons/icon-192.png              install icons; also the in-app brand
 *   public/icons/icon-512.png              icon (BrandIcon) and share image
 *   public/icons/icon-maskable-512.png     Android adaptive icon (full bleed,
 *                                          symbol inside the circular safe zone)
 *
 * The tile is found automatically: its bounding box (non-white pixels) and
 * corner radius (measured along the diagonal). Replace the source and re-run:
 *
 *   pnpm build:brand-icons
 *
 * Needs sharp, resolved from this project or from the copy installed with Next.js.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "scripts", "brand");
const APP_DIR = path.join(ROOT, "src", "app");
const ICONS_DIR = path.join(ROOT, "public", "icons");

type Sharp = typeof import("sharp");

function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

function findSource(): string {
  for (const ext of ["png", "webp", "jpg", "jpeg"]) {
    const file = path.join(SOURCE_DIR, `icon-source.${ext}`);
    if (fs.existsSync(file)) return file;
  }
  throw new Error(`No icon source found: add scripts/brand/icon-source.png (or .webp/.jpg)`);
}

interface Tile {
  left: number;
  top: number;
  size: number;
  radius: number;
}

/** Locates the rounded tile: bounding box of non-background pixels, and its corner radius. */
async function locateTile(sharp: Sharp, file: string): Promise<Tile> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const isBackground = (x: number, y: number) => {
    const i = (y * W + x) * C;
    return data[i + 3] < 16 || (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235);
  };

  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (isBackground(x, y)) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error("The icon source looks blank");

  const size = Math.min(maxX - minX, maxY - minY) + 1;
  // A rounded corner of radius r leaves r·(1 − 1/√2) of background along the diagonal
  let gap = 0;
  while (gap < size / 2 && isBackground(minX + gap, minY + gap)) gap++;
  const radius = Math.round(gap / (1 - Math.SQRT1_2));

  return { left: minX, top: minY, size, radius };
}

/** SVG alpha mask: a rounded square, optionally feathered at the edges. */
function roundedMask(size: number, radius: number, inset: number, feather = 0): Buffer {
  const blur = feather
    ? `<defs><filter id="f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${feather}"/></filter></defs>`
    : "";
  const r = Math.max(0, radius - inset);
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${blur}` +
      `<rect x="${inset}" y="${inset}" width="${size - 2 * inset}" height="${size - 2 * inset}" rx="${r}" fill="#fff"${feather ? ' filter="url(#f)"' : ""}/></svg>`,
  );
}

/** ICO container holding PNG images (supported by every current browser). */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;
  images.forEach(({ size, png }, i) => {
    const o = i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, o);
    directory.writeUInt8(size >= 256 ? 0 : size, o + 1);
    directory.writeUInt8(0, o + 2); // palette
    directory.writeUInt8(0, o + 3); // reserved
    directory.writeUInt16LE(1, o + 4); // colour planes
    directory.writeUInt16LE(32, o + 6); // bits per pixel
    directory.writeUInt32LE(png.length, o + 8);
    directory.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([header, directory, ...images.map((image) => image.png)]);
}

async function main() {
  const sharp = loadSharp();
  const source = findSource();
  const tile = await locateTile(sharp, source);
  console.log(
    `Tile in ${path.relative(ROOT, source)}: ${tile.size}px at (${tile.left}, ${tile.top}), corner radius ~${tile.radius}px`,
  );

  const raw = await sharp(source)
    .ensureAlpha()
    .extract({ left: tile.left, top: tile.top, width: tile.size, height: tile.size })
    .png()
    .toBuffer();

  // Rounded tile with transparent corners (inset slightly to drop the white fringe)
  const rounded = await sharp(raw)
    .composite([{ input: roundedMask(tile.size, tile.radius, 2), blend: "dest-in" }])
    .png()
    .toBuffer();

  // Full-bleed square: crop just inside the rounded corners
  const inset = Math.ceil(tile.radius * (1 - Math.SQRT1_2)) + 6;
  const bleedSize = tile.size - 2 * inset;
  const fullBleed = await sharp(raw)
    .extract({ left: inset, top: inset, width: bleedSize, height: bleedSize })
    .png()
    .toBuffer();

  // Android adaptive icon: shrink the symbol into the central safe zone. The
  // margin is the image's own edge pixels stretched outward and blurred, so the
  // colours meet the scaled image exactly; a soft-edged mask hides the join.
  const MASKABLE = 512;
  const inner = Math.round(MASKABLE * 0.72);
  const pad = Math.round((MASKABLE - inner) / 2);
  const scaled = await sharp(fullBleed).resize(inner, inner).png().toBuffer();
  const background = await sharp(
    await sharp(scaled)
      .extend({ top: pad, bottom: MASKABLE - inner - pad, left: pad, right: MASKABLE - inner - pad, extendWith: "copy" })
      .png()
      .toBuffer(),
  )
    .blur(24)
    .png()
    .toBuffer();
  const foreground = await sharp(scaled)
    .composite([{ input: roundedMask(inner, Math.round(inner * 0.12), 6, 12), blend: "dest-in" }])
    .png()
    .toBuffer();
  const maskable = await sharp(background)
    .composite([{ input: foreground, left: pad, top: pad }])
    .png()
    .toBuffer();

  const resize = (input: Buffer, size: number) => {
    const pipeline = sharp(input).resize(size, size, { kernel: "lanczos3" });
    // Small tab sizes lose edge contrast when downscaled; a light sharpen brings it back
    if (size <= 48) return pipeline.sharpen({ sigma: 0.6 }).png({ compressionLevel: 9 }).toBuffer();
    // Dithered 256-colour palette: looks the same, about a quarter of the bytes
    return pipeline.png({ palette: true, quality: 92, dither: 1, compressionLevel: 9, effort: 10 }).toBuffer();
  };

  fs.mkdirSync(ICONS_DIR, { recursive: true });
  const outputs: [string, Buffer][] = [
    [path.join(APP_DIR, "icon.png"), await resize(rounded, 256)],
    [path.join(APP_DIR, "apple-icon.png"), await resize(fullBleed, 180)],
    [path.join(ICONS_DIR, "icon-192.png"), await resize(rounded, 192)],
    [path.join(ICONS_DIR, "icon-512.png"), await resize(rounded, 512)],
    [path.join(ICONS_DIR, "icon-maskable-512.png"), await resize(maskable, 512)],
    [
      path.join(APP_DIR, "favicon.ico"),
      buildIco(
        await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await resize(rounded, size) }))),
      ),
    ],
  ];

  for (const [file, data] of outputs) {
    fs.writeFileSync(file, data);
    console.log(`Wrote ${path.relative(ROOT, file)} (${Math.round(data.length / 1024)} KB)`);
  }

  // The vector icon from the previous pipeline would shadow icon.png
  const oldSvg = path.join(APP_DIR, "icon.svg");
  if (fs.existsSync(oldSvg)) {
    fs.rmSync(oldSvg);
    console.log(`Removed ${path.relative(ROOT, oldSvg)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
