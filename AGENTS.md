# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 App Router project with React 19, TypeScript, and Tailwind CSS.

- **Application Routes (`src/app/`):**
  - `src/app/(site)/layout.tsx`: Shared layout for the public pages; renders the common top bar (`src/components/layout/SiteHeader.tsx`), which stays mounted across page switches. On phones the page links (`HeaderNav`) take their own full-width row under the logo. Add new public pages inside `(site)`.
  - `src/app/(site)/template.tsx`: Remounts on every navigation and wraps the page in `PageTransition` (`src/components/layout/`), which plays the squash-and-stretch page switch.
  - `src/app/(site)/page.tsx`: Landing page containing the Inventory Scanner (Scanner, Video and AI Vision tabs). Results go to `/inventory`, so it has no extra bottom space; the footer shows the scan counter (`ScanCounter`) here.
  - `src/app/(site)/inventory/page.tsx`: Scanned inventory (`src/components/scanner/ScannedInventory.tsx`): quantity edits, Clear All and GOOD export (which offers the feedback form, throttled by `src/lib/feedback/prompt.ts`). The scanners add to the shared store (`src/lib/scanner-inventory.ts`) and switch here after a scan.
  - `src/app/(site)/materials/page.tsx`: 475-material directory with category filtering and ordering.
  - `src/app/(site)/versions/page.tsx`: Release notes page, built from `src/data/versions/` at build time.
  - `src/app/(site)/about/page.tsx`: About page (features, how it works, privacy, fan-project disclaimer), linked from the shared footer (`SiteFooter`).
  - `src/app/(site)/feedback/page.tsx`: Public feedback list with the Send feedback modal (feedback, bug, idea or other; a name that starts as a random character's, with their avatar; up to 3 screenshots). Only the "feedback" kind is listed; `feedback/inbox/page.tsx` is the private inbox for seeded accounts. Linked from the footer and About page. See `docs/feedback.md`.
  - `src/app/api/feedback/`: Feedback route handlers (list and send, images, inbox session, inbox list/update/delete).
  - `src/app/api/stats/scans/route.ts`: Scan counter: GET totals (CDN-cached for a minute), POST `{ scanner }` after a scan.
  - `src/app/api/scanner/ai-vision/route.ts`: Server Route Handler for Vision AI calls (Gemini, OpenAI, Claude, Grok, Custom) and connection testing.
  - `src/app/debug/`: Testing utilities and debug exploration views.
- **Components (`src/components/`):**
  - `src/components/scanner/`: Inventory scanner UI: local on-device scanner (`ClassicScannerView.tsx`), screen-recording scanner (`VideoScannerView.tsx`), AI Vision scanner (`AiScannerView.tsx`), drag-and-drop zone (`UploadZone.tsx`), multi-provider settings (`ScannerSettingsModal.tsx`), review modal (`ScanReviewModal.tsx`), and the scanned-inventory cards (`ResultGrid.tsx`, used by `ScannedInventory.tsx` on `/inventory`).
  - `src/components/grid-detector/`: Grid & Material Studio (`/debug`): sessions, card editor, detection settings.
  - `src/components/material-detector/`: Recognition panels used by the studio (per-card candidates, rarity and quantity readings).
  - `src/components/materials/`: Material directory cards, category filters, and detail modals.
  - `src/components/layout/`: Navigation bar, theme toggles, and header controls. `PillNav` is the glass pill of page links with a sliding thumb, used by the top bar (`HeaderNav`) and the footer (`FooterNav`).
  - `src/components/ui/`: Reusable primitives and badges.
- **Shared Logic & AI Engine (`src/lib/`):**
  - `src/lib/ai/adapters/`: Pluggable AI vision adapters implementing the `AiVisionAdapter` interface for Gemini, OpenAI, Claude, Grok, and Custom/OpenRouter.
  - `src/lib/ai/material-matcher.ts`: Exact and fuzzy Levenshtein resolver mapping raw OCR strings to canonical materials.
  - `src/lib/ai/prompts.ts`: In-prompt reference dictionary generator embedding canonical material IDs into AI system prompts.
  - `src/lib/scanner-settings.ts`: Local storage persistence and react hooks for scanner settings.
  - `src/lib/good-format.ts`: Standard Genshin Open Object Description (GOOD) exporter.
  - `src/lib/grid-detector/`: Card/grid detection engine (pure TS) with a Web Worker client. See `docs/grid-detector.md`.
  - `src/lib/material-detector/`: On-device material recognition (material, rarity, quantity) of detected cards, with a Web Worker scan client. See `docs/material-detector.md`.
  - `src/lib/video-scanner/`: Screen-recording scanner: picks the frames where scrolling settles, scans them with the material scan workers, fills coverage gaps and merges quantities by vote. See `docs/video-scanner.md`.
  - `src/lib/supabase-rpc.ts`: `callRpc` for the `public.*` Postgres functions (publishable key, server-only), shared by feedback and the scan counter; `src/lib/request-client.ts` has `clientIp`, `isSameOrigin` and the salted `hashClient`.
  - `src/lib/scan-stats.ts`: Scan counter. The scanners call `recordScan(scanner, files)` once a scan recognises materials; files from the "Try a sample" buttons (`markSampleFile` in `UploadZone`) don't count. Server side in `scan-stats-server.ts`.
  - `src/lib/characters.ts`: Playable characters (`getCharacter`, `randomCharacter`, `characterAvatarUrl`), used for feedback names and avatars.
  - `src/lib/feedback/`: Feedback server calls (`server.ts`, Supabase RPCs with the publishable key), shared types and limits, the `bad-words` filter (`profanity.ts`) and image checks. See `docs/feedback.md`.
- **Database (`supabase/migrations/`):** Supabase project `gi-helper`. Feedback tables live in the unexposed `feedback_private` schema and are reached only through the `public.feedback_*` security-definer functions; the scan counter likewise uses `stats_private` via `public.scan_stats` / `public.scan_record` (20 counted scans per sender and 600 overall per 10 minutes). Inbox accounts are seeded with `pnpm feedback:admin <username>` (bcrypt hash, no Supabase Auth). Server env: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, optional `FEEDBACK_HASH_SALT`.
- **Data & Static Assets:**
  - `src/data/materials.json`: Single canonical reference data containing all 475 Genshin Impact materials (served dynamically at `/data/materials.json`).
  - `src/data/versions/<major>-<minor>-<patch>/release.json`: Release notes per version (`{ title, date: "YYYY-MM-DD", summary?, changes: [{ type: "new" | "improved" | "fixed" | "removed", text }] }`). The folder name is the version; add a folder to publish a release. Loaded and validated by `src/lib/versions.ts`.
  - `public/images/materials/`: High-resolution icons for all 475 materials.
  - `public/samples/test-set-02/`: Sample inventory screen recording, used by the Video tab's "Try a sample recording" button.
  - Brand icons: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png` and `public/icons/*.png` are all generated from one master image, `scripts/brand/icon-source.png` (a rounded tile on white), by `pnpm build:brand-icons`. To change the icon, replace the source and re-run; don't edit the outputs. `BrandIcon` shows it in the UI. The manifest is `src/app/manifest.ts`, built from `src/lib/site.ts`.
  - `public/images/material-thumbs/`: 128² WebP icons (~4 KB each) for lists, grids and pickers, via `materialThumbUrl()` / `MaterialThumb` (generated by `pnpm build:material-thumbs`, also run by `sync-data`).
  - `public/data/material-atlas.{png,json}`: Reference bank for the material recognizer (generated by `pnpm build:material-atlas`).
  - `src/data/digit-templates.json`: Quantity digit glyphs (generated by `pnpm build:digit-templates`).
  - `src/data/characters.json` and `public/images/character-avatars/<id>.webp`: Playable characters (id, name, rarity, element) and their 128² WebP avatars (~8 KB each; only the WebP is stored). Generated from genshin-db and enka.network icons by `pnpm scrape:characters` (also run by `sync-data`).

---

## Build, Test, and Development Commands

Prefer `pnpm`; the repo pins `pnpm@10.17.1` and Node `22.x`.

- `pnpm dev`: Start the local Next.js development server at `http://localhost:3000`.
- `pnpm build`: Create an optimized production build.
- `pnpm start`: Start the production server.
- `pnpm test`: Run unit tests using Node's built-in test runner (`tsx --test tests/**/*.test.ts`).
- `pnpm test:material-detector` / `pnpm eval:material-detector`: Material recognizer tests and accuracy report.
- `pnpm test:grid-detector` / `pnpm eval:grid-detector`: Grid detector tests and accuracy report.
- `pnpm scrape:characters`: Rebuilds `src/data/characters.json` and the character avatars (update genshin-db first when new characters release).
- `pnpm feedback:admin <username> [--generate]`: Prints the SQL that seeds or resets a feedback inbox account (run it in the Supabase SQL editor).
- `pnpm lint`: Run ESLint with Next.js core web vitals configuration.
- `pnpm format`: Run Prettier across the repository.

---

## Coding Style & Architectural Conventions

- **TypeScript Throughout:** Maintain strict TypeScript types. Domain types are defined in `src/lib/types.ts` and `src/lib/ai/adapters/types.ts`.
- **AI Vision Adapters:** When adding or updating AI models, implement the `AiVisionAdapter` contract in `src/lib/ai/adapters/` and register them in `src/lib/ai/adapters/index.ts`.
- **Precedence Rule:** User API keys in `localStorage` must always take precedence over server `.env` variables.
- **Components:** Functional React 19 components in `PascalCase`. Route segments and helper modules use `kebab-case`.
- **Icons & Styling:** Use `lucide-react` for icons and Tailwind CSS with glassmorphic, theme-aware classes.
- **Light/Dark Theme:** Tailwind's `white` is the theme ink (`--ink`: white in dark, slate in light), so `text-white`, `bg-white/10` and `border-white/10` adapt automatically; use `snow` for anything that must stay white. Wrap intentionally dark surfaces (scan chamber, dark banners) in `on-dark` to keep white ink and pale accents there. Light versions of the glass classes live in `src/styles/glass-light.css`; pale accent text (`text-cyan-300`, ...) is remapped to deep shades in light mode in `globals.css`.
- **Modals:** Load modals with `next/dynamic` (`ssr: false`) and mount them only while open (see `src/components/scanner/lazy-modals.ts`); call `usePauseBackground()` inside so the animated background stops under the blur. Use `useModalMotion(onClose)` (`src/lib/use-modal-motion.ts`) for the open/close squash-and-stretch: attach its `dialogRef`/`backdropRef` and close through its `close`/`closeThen` instead of calling `onClose` directly. Toasts are styled by `GlassToaster` (`src/components/ui/`); test toasts and modals from the Motion Playground on `/debug`. Never use the browser's `confirm()`/`alert()`: use `useConfirm()` (`src/components/ui/use-confirm.tsx`), which shows the glass `ConfirmModal`. The shared page loader is `src/app/(site)/loading.tsx` (glass placeholders).
- **Preserve Documentation:** Keep existing comments intact.

---

## Testing Guidelines

- When modifying the AI vision pipeline or material matcher, add or update tests in `tests/ai-vision.test.ts`.
- When modifying the video scanner's frame selection or merging, update `tests/video-scanner.test.ts` and re-check the sample recording in the Video tab (expected numbers in `docs/video-scanner.md`).
- When modifying the material recognizer, keep `pnpm test:material-detector` green and check `pnpm eval:material-detector` (also with `--impostors` and `--scale 0.5`); per-card ground truth is in `tests/material-detector/ground-truth.json`.
- When modifying the feedback filter, image checks or error messages, update `tests/feedback.test.ts`; `tests/characters.test.ts` checks the character list and avatars, `tests/scan-stats.test.ts` the scan counter's sample skipping and scanner kinds. Schema changes go in a new file under `supabase/migrations/`.
- Always verify changes with `pnpm build` and `npx tsx --test tests/ai-vision.test.ts`.
