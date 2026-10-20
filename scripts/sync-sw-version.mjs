import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, "../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = `v${pkg.version}`;

const targets = [
  resolve(__dirname, "../public/sw.js"),
  resolve(__dirname, "../../gi-tests/public/sw.js"),
];

for (const swPath of targets) {
  if (!existsSync(swPath)) continue;
  const content = readFileSync(swPath, "utf8");
  const updated = content.replace(/const VERSION = ".*";/, `const VERSION = "${version}";`);
  if (updated !== content) {
    writeFileSync(swPath, updated, "utf8");
    console.log(`[SW] Synced Service Worker VERSION to ${version} in ${swPath}`);
  }
}
