/**
 * Copies the OCR engine the artifact detail panel reader uses into
 * public/ocr/ (gitignored), so the browser loads it from this site rather
 * than a CDN: tesseract.js' worker script, the LSTM builds of
 * tesseract.js-core (with and without SIMD; tesseract.js picks one), and the
 * English and Simplified Chinese language data (integer "best" models).
 * Runs after every install (package.json "postinstall"); plain Node, so it
 * works without dev dependencies.
 *
 *   node scripts/copy-ocr-assets.mjs
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));
const out = path.join(root, "public", "ocr");

/** A package's folder, resolved from this project (pnpm keeps transitive ones out of node_modules/). */
function packageDir(name, from = require) {
  return path.dirname(from.resolve(`${name}/package.json`));
}

function main() {
  let tesseract;
  try {
    tesseract = packageDir("tesseract.js");
  } catch {
    console.warn("copy-ocr-assets: tesseract.js isn't installed; skipped.");
    return;
  }
  const core = packageDir("tesseract.js-core", createRequire(path.join(tesseract, "package.json")));
  const files = [
    [path.join(tesseract, "dist", "worker.min.js"), "worker.min.js"],
    ...["tesseract-core-lstm.wasm.js", "tesseract-core-simd-lstm.wasm.js", "tesseract-core-relaxedsimd-lstm.wasm.js"].map((f) => [
      path.join(core, f),
      f,
    ]),
  ];
  for (const lang of ["eng", "chi_sim"]) {
    let dir;
    try {
      dir = packageDir(`@tesseract.js-data/${lang}`);
    } catch {
      console.warn(`copy-ocr-assets: @tesseract.js-data/${lang} isn't installed; panels in that language can't be read.`);
      continue;
    }
    files.push([path.join(dir, "4.0.0_best_int", `${lang}.traineddata.gz`), `${lang}.traineddata.gz`]);
  }
  fs.mkdirSync(out, { recursive: true });
  let bytes = 0;
  for (const [from, to] of files) {
    const target = path.join(out, to);
    const size = fs.statSync(from).size;
    // Unchanged files are left alone (same size and not older).
    if (fs.existsSync(target) && fs.statSync(target).size === size && fs.statSync(target).mtimeMs >= fs.statSync(from).mtimeMs) continue;
    fs.copyFileSync(from, target);
    bytes += size;
  }
  console.log(`copy-ocr-assets: public/ocr is up to date (${(bytes / 1024 / 1024).toFixed(1)} MB copied).`);
}

main();
