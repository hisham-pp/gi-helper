# GI Helper

A free, fan-made Genshin Impact inventory scanner: recognise your materials from
screenshots or a screen recording, review them, and export a **GOOD** file for
Genshin Optimizer and other tools.

Live at [gi-helper.vercel.app](https://gi-helper.vercel.app). Built with
Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS.

---

## Features

- **On-device scanner:** drop inventory screenshots (Character Development Items
  tab). Cards, materials, rarity and quantities are recognised in your browser in
  Web Workers. No API key, nothing uploaded.
- **Video scanner:** drop a screen recording while you scroll the inventory. The
  frames where scrolling settles are scanned, and quantities are merged by vote.
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

| Command                                                 | Description                                                          |
| :------------------------------------------------------ | :------------------------------------------------------------------- |
| `pnpm dev`                                              | Development server at `localhost:3000` (Turbopack)                   |
| `pnpm build` / `pnpm start`                             | Production build (type-checks) / serve it                            |
| `pnpm lint`                                             | ESLint (Next.js core web vitals + TypeScript rules)                  |
| `pnpm test`                                             | All unit tests (`node:test` via `tsx`), including the detector suites |
| `pnpm test:e2e`                                         | Playwright smoke tests against the production build (build first)    |
| `pnpm test:material-detector` / `pnpm eval:material-detector` | Material recognizer tests / accuracy report                     |
| `pnpm test:grid-detector` / `pnpm eval:grid-detector`   | Grid detector tests / accuracy report                                |
| `pnpm sync-data`                                        | Re-scrape materials and characters, rebuild the atlas and thumbnails |
| `pnpm format`                                           | Prettier                                                             |

CI (`.github/workflows/ci.yml`) runs lint, unit tests, the build and the E2E
smoke tests on every pull request. A daily workflow syncs game data.

---

## AI Vision providers

| Provider                   | Default model             | Key                                                       |
| :------------------------- | :------------------------ | :-------------------------------------------------------- |
| Google Gemini (free tier)  | `gemini-flash-latest`     | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| OpenAI                     | `gpt-6-luna`              | [OpenAI Platform](https://platform.openai.com/api-keys)    |
| Anthropic Claude           | `claude-sonnet-5-5`       | [Anthropic Console](https://console.anthropic.com/settings/keys) |
| xAI Grok                   | `grok-4.7`                | [xAI Console](https://console.x.ai)                        |
| Custom / OpenAI-compatible | `google/gemini-3.8-flash` | Any endpoint, e.g. [OpenRouter](https://openrouter.ai/keys) or local Ollama |

A model saved in your settings that the app no longer lists falls back to the
provider's default.

---

## Project docs

- [`AGENTS.md`](AGENTS.md): project structure, conventions and testing rules.
- [`docs/material-detector.md`](docs/material-detector.md),
  [`docs/grid-detector.md`](docs/grid-detector.md),
  [`docs/video-scanner.md`](docs/video-scanner.md): the scanning engine.
- [`docs/feedback.md`](docs/feedback.md): feedback page, inbox and Supabase setup.
- [`docs/roadmap.md`](docs/roadmap.md): what's planned next.

---

## License

MIT. GI Helper is an unofficial fan project and isn't affiliated with or
endorsed by HoYoverse. Genshin Impact, its names, artwork and material icons are
trademarks and copyrights of HoYoverse.
