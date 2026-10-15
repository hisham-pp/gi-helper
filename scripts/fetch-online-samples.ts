/**
 * Downloads the inventory screenshots and recordings listed in
 * tests/online-samples/manifest.json (posted by other players, so not stored
 * in the repository) into tests/online-samples/files/. Files already there
 * are kept. Tests and `pnpm eval:card-scanner` use them when present.
 *
 *   pnpm fetch:online-samples
 */
import fs from "node:fs";
import path from "node:path";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const DIR = path.join(process.cwd(), "tests", "online-samples");

interface Manifest {
  samples: { file: string; url: string }[];
}

async function main() {
  const manifest: Manifest = JSON.parse(fs.readFileSync(path.join(DIR, "manifest.json"), "utf8"));
  const out = path.join(DIR, "files");
  fs.mkdirSync(out, { recursive: true });
  let fetched = 0;
  const failed: string[] = [];
  for (const { file, url } of manifest.samples) {
    const target = path.join(out, file);
    if (fs.existsSync(target)) continue;
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      const type = res.headers.get("content-type") ?? "";
      if (!res.ok || !/^(image|video)\/|octet-stream/.test(type)) throw new Error(`HTTP ${res.status} ${type}`);
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      fetched++;
      console.log(`  ${file}`);
    } catch (err) {
      failed.push(`${file}: ${(err as Error).message}`);
    }
  }
  console.log(`Fetched ${fetched} file(s) into ${path.relative(process.cwd(), out)}.`);
  if (failed.length > 0) {
    console.warn(`Could not fetch ${failed.length}:\n  ${failed.join("\n  ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
