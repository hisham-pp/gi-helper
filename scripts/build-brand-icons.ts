/**
 * Builds every GI Helper app icon from one drawing of the brand mark (teal
 * scanner brackets framing a cyan gem on dark glass; the header and share
 * image use the generated icon.svg too):
 *
 *   src/app/icon.svg                      browser tab icon (rounded tile)
 *   src/app/apple-icon.png                180² iOS home-screen icon (full bleed)
 *   public/icons/icon-192.png             install icons (rounded tile)
 *   public/icons/icon-512.png
 *   public/icons/icon-maskable-512.png    Android adaptive icon (full bleed)
 *
 * iOS and Android round the corners themselves, so their variants fill the
 * whole square, drop the rim and shrink the mark into the mask's safe zone. Edit the mark here and re-run:
 *
 *   pnpm build:brand-icons
 *
 * Rasterising needs sharp, resolved from this project or from the copy
 * installed with Next.js.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const ROOT = process.cwd();

type Sharp = typeof import("sharp");

function loadSharp(): Sharp {
  const local = createRequire(path.join(ROOT, "package.json"));
  try {
    return local("sharp");
  } catch {
    return createRequire(local.resolve("next/package.json"))("sharp");
  }
}

interface MarkOptions {
  /** Rounded tile with a glass rim (tab/install icons) or a full-bleed square. */
  variant: "tile" | "full-bleed";
}

/** The brand mark on a 128-unit canvas: scanner brackets framing a faceted gem. */
function brandSvg({ variant }: MarkOptions): string {
  const tile = variant === "tile";
  const radius = tile ? 30 : 0;
  // Full-bleed icons get masked to a circle or squircle: shrink the mark into the safe zone
  const markTransform = tile ? "" : ` transform="translate(64 64) scale(0.8) translate(-64 -64)"`;

  // Corner brackets: an L with a rounded elbow at each corner of the scan frame
  const lo = 26;
  const hi = 102;
  const arm = 20;
  const bend = 8;
  const brackets = [
    `M${lo} ${lo + arm}V${lo + bend}a${bend} ${bend} 0 0 1 ${bend} -${bend}H${lo + arm}`,
    `M${hi - arm} ${lo}H${hi - bend}a${bend} ${bend} 0 0 1 ${bend} ${bend}V${lo + arm}`,
    `M${hi} ${hi - arm}V${hi - bend}a${bend} ${bend} 0 0 1 -${bend} ${bend}H${hi - arm}`,
    `M${lo + arm} ${hi}H${lo + bend}a${bend} ${bend} 0 0 1 -${bend} -${bend}V${hi - arm}`,
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d2c36"/>
      <stop offset="1" stop-color="#020e13"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".08"/>
      <stop offset=".5" stop-color="#ffffff" stop-opacity=".01"/>
      <stop offset="1" stop-color="#a5f3fc" stop-opacity=".06"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".6"/>
      <stop offset=".4" stop-color="#ffffff" stop-opacity=".08"/>
      <stop offset=".7" stop-color="#ffffff" stop-opacity=".05"/>
      <stop offset="1" stop-color="#a5f3fc" stop-opacity=".55"/>
    </linearGradient>
    <linearGradient id="bracket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#99f6e4"/>
      <stop offset="1" stop-color="#14b8a6"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#22d3ee" stop-opacity=".75"/>
      <stop offset=".45" stop-color="#22d3ee" stop-opacity=".25"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="128" height="128" rx="${radius}" fill="url(#tile)"/>
  <rect width="128" height="128" rx="${radius}" fill="url(#sheen)"/>${
    tile
      ? `
  <rect x="1.5" y="1.5" width="125" height="125" rx="${radius - 1.5}" fill="none" stroke="url(#rim)" stroke-width="3"/>`
      : ""
  }
  <g${markTransform}>
    <circle cx="64" cy="64" r="34" fill="url(#glow)"/>
    <path d="${brackets}" fill="none" stroke="url(#bracket)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#ecfeff" stroke-opacity=".35" stroke-width=".8" stroke-linejoin="round">
      <path d="M52 44H76L70 57H58Z" fill="#cffafe"/>
      <path d="M52 44L58 57H41Z" fill="#a5f3fc"/>
      <path d="M76 44L87 57H70Z" fill="#67e8f9"/>
      <path d="M41 57H58L64 88Z" fill="#22d3ee"/>
      <path d="M58 57H70L64 88Z" fill="#a5f3fc"/>
      <path d="M70 57H87L64 88Z" fill="#0891b2"/>
    </g>
  </g>
</svg>
`;
}

async function main() {
  const sharp = loadSharp();
  const tileSvg = brandSvg({ variant: "tile" });
  const fullBleedSvg = brandSvg({ variant: "full-bleed" });

  const appDir = path.join(ROOT, "src", "app");
  const iconsDir = path.join(ROOT, "public", "icons");
  fs.mkdirSync(iconsDir, { recursive: true });

  const outputs: { file: string; svg: string; size?: number }[] = [
    { file: path.join(appDir, "icon.svg"), svg: tileSvg },
    { file: path.join(appDir, "apple-icon.png"), svg: fullBleedSvg, size: 180 },
    { file: path.join(iconsDir, "icon-192.png"), svg: tileSvg, size: 192 },
    { file: path.join(iconsDir, "icon-512.png"), svg: tileSvg, size: 512 },
    { file: path.join(iconsDir, "icon-maskable-512.png"), svg: fullBleedSvg, size: 512 },
  ];

  for (const { file, svg, size } of outputs) {
    if (size === undefined) {
      fs.writeFileSync(file, svg);
    } else {
      // Render at the target size from vector (density scales the 128-unit canvas)
      const png = await sharp(Buffer.from(svg), { density: (72 * size) / 128 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer();
      fs.writeFileSync(file, png);
    }
    console.log(`Wrote ${path.relative(ROOT, file)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
