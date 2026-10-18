# GI Helper

A free, fan-made Genshin Impact inventory scanner: recognise your materials,
weapons, artifacts and characters from screenshots or a screen recording,
review them, and export a **GOOD** file for Genshin Optimizer and other tools.

Live at [gi-helper.vercel.app](https://gi-helper.vercel.app). Built with
Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS.

---

## Features

- **On-device scanner:** drop screenshots of a bag tab. It tells which one it is
  and reads, in your browser (Web Workers, no API key, nothing uploaded):
  - **Character Development Items** and **Materials**: each material and its count;
  - **Weapons**: weapon, level, refinement and lock (ascension from the level and
    the awakened icon);
  - **Artifacts**: set, slot, rarity, level, lock, main stat, and full substats with
    roll verification from detail panel screenshots or tap-through recordings;
  - the party setup's **character list**: each character and their level.
- **Video scanner:** drop a screen recording while you scroll any of those. The
  frames where scrolling settles are scanned; material counts are merged by vote,
  weapon, artifact and character rows are stitched across frames.
- **AI Vision (optional):** Gemini, OpenAI, Claude, Grok or any OpenAI-compatible
  endpoint, using your own API key. The key stays in your browser's localStorage
  and is only passed through the server for that request.
- **Review, then inventory:** fix low-confidence cards in the review modal. Your
  inventory lives on `/inventory` (in this browser), with a page each for
  materials, characters, weapons and artifacts, search, filters and quantity edits.
- **GOOD import and export:** import a GOOD file from Genshin Optimizer,
  Inventory Kamera or similar tools, update your materials with a scan, and
  export everything as one GOOD file. Keys newer than our game data and GOOD 3
  artifact fields are kept.
- **Game database:** every material (Character Development Items and the bag's
  Materials tab: local specialties, ingredients, fish, ores, wood), character,
  weapon and artifact set, with search and filters, marking what you own.
- **Feedback, release notes and About pages,** plus a live scan counter.

What's next is in [docs/roadmap.md](docs/roadmap.md).

---

## Getting started

Requirements: Node.js `22.x` and `pnpm` 10 (the repo pins `pnpm@10.17.1`).

```bash
git clone https://github.com/hisham-pp/gi-helper.git
cd gi-helper
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

All optional; see [`.env.example`](.env.example). AI Vision keys are **not** read
from the server: each visitor enters their own in Scanner Settings.

| Variable                                         | Used for                                                    |
| :----------------------------------------------- | :---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                           | Canonical URLs, sitemap and OG images on a custom domain    |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`       | Feedback page and scan counter (off without them)           |
| `SUPABASE_RPC_SECRET`, `FEEDBACK_HASH_SALT`      | Server-only secret for write functions; rate-limit IP salt  |

---

## Commands

| Command                     | Description                                                          |
| :-------------------------- | :------------------------------------------------------------------- |
| `pnpm dev`                  | Development server at `localhost:3000` (Turbopack)                   |
| `pnpm build` / `pnpm start` | Production build (type-checks) / serve it                            |
| `pnpm lint`                 | ESLint (Next.js core web vitals + TypeScript rules)                  |
| `pnpm format`               | Prettier                                                             |
| `pnpm test`                 | Runs test suites via companion repository `gi-tests`                 |
| `pnpm test:e2e`             | Runs Playwright smoke tests via companion repository `gi-tests`      |
| `pnpm sync-data`            | Runs data scraping & atlas rebuild via `gi-sync-catalogue`            |

---

## Suite Architecture & Companion Repositories

This application is part of the modular **[GI Helper Suite](https://github.com/hisham-pp/gi-suite)**:

- **[`gi-suite`](https://github.com/hisham-pp/gi-suite):** Umbrella repository holding all projects as Git submodules.
- **[`gi-docs`](https://github.com/hisham-pp/gi-docs):** Technical documentation, detector algorithmic specs, feedback design & roadmap.
- **[`gi-sync-catalogue`](https://github.com/hisham-pp/gi-sync-catalogue):** Genshin DB scrapers, asset generators, thumbnail builders & reference atlases.
- **[`gi-tests`](https://github.com/hisham-pp/gi-tests):** Unit tests, detector evaluations, offline benchmarks & Playwright E2E suites.

---

## Project docs

- [`AGENTS.md`](AGENTS.md): project structure, conventions and guidelines.
- Technical specs and detector theory are maintained in [`gi-docs`](https://github.com/hisham-pp/gi-docs).

---

## License

MIT. GI Helper is an unofficial fan project and isn't affiliated with or
endorsed by HoYoverse. Genshin Impact, its names, artwork and material icons are
trademarks and copyrights of HoYoverse.
