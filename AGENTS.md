# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 App Router project with React 19, TypeScript, and Tailwind CSS.

- **Application Routes (`src/app/`):**
  - `src/app/page.tsx`: Landing page containing the Inventory Scanner and results grid.
  - `src/app/materials/page.tsx`: 475-material directory with category filtering and ordering.
  - `src/app/api/scanner/ai-vision/route.ts`: Server Route Handler for Vision AI calls (Gemini, OpenAI, Claude, Grok, Custom) and connection testing.
  - `src/app/debug/`: Testing utilities and debug exploration views.
- **Components (`src/components/`):**
  - `src/components/scanner/`: Inventory scanner UI, drag-and-drop zone (`UploadZone.tsx`), multi-provider settings (`ScannerSettingsModal.tsx`), review modal (`ScanReviewModal.tsx`), and exported GOOD table (`ResultGrid.tsx`).
  - `src/components/materials/`: Material directory cards, category filters, and detail modals.
  - `src/components/layout/`: Navigation bar, theme toggles, and header controls.
  - `src/components/ui/`: Reusable primitives and badges.
- **Shared Logic & AI Engine (`src/lib/`):**
  - `src/lib/ai/adapters/`: Pluggable AI vision adapters implementing the `AiVisionAdapter` interface for Gemini, OpenAI, Claude, Grok, and Custom/OpenRouter.
  - `src/lib/ai/material-matcher.ts`: Exact and fuzzy Levenshtein resolver mapping raw OCR strings to canonical materials.
  - `src/lib/ai/prompts.ts`: In-prompt reference dictionary generator embedding canonical material IDs into AI system prompts.
  - `src/lib/scanner-settings.ts`: Local storage persistence and react hooks for scanner settings.
  - `src/lib/good-format.ts`: Standard Genshin Open Object Description (GOOD) exporter.
  - `src/lib/cv/`: Preserved legacy Canvas CV/dHash matching modules (kept for future reference).
- **Data & Static Assets:**
  - `src/data/materials.json`: Single canonical reference data containing all 475 Genshin Impact materials (served dynamically at `/data/materials.json`).
  - `public/images/materials/`: High-resolution icons for all 475 materials.

---

## Build, Test, and Development Commands

Prefer `pnpm`; the repo pins `pnpm@10.17.1` and Node `22.x`.

- `pnpm dev`: Start the local Next.js development server at `http://localhost:3000`.
- `pnpm build`: Create an optimized production build.
- `pnpm start`: Start the production server.
- `pnpm test`: Run unit tests using Node's built-in test runner (`tsx --test tests/**/*.test.ts`).
- `pnpm lint`: Run ESLint with Next.js core web vitals configuration.
- `pnpm format`: Run Prettier across the repository.

---

## Coding Style & Architectural Conventions

- **TypeScript Throughout:** Maintain strict TypeScript types. Domain types are defined in `src/lib/types.ts` and `src/lib/ai/adapters/types.ts`.
- **AI Vision Adapters:** When adding or updating AI models, implement the `AiVisionAdapter` contract in `src/lib/ai/adapters/` and register them in `src/lib/ai/adapters/index.ts`.
- **Precedence Rule:** User API keys in `localStorage` must always take precedence over server `.env` variables.
- **Components:** Functional React 19 components in `PascalCase`. Route segments and helper modules use `kebab-case`.
- **Icons & Styling:** Use `lucide-react` for icons and Tailwind CSS with glassmorphic, theme-aware classes.
- **Preserve Documentation & Legacy Modules:** Keep existing comments and legacy CV modules in `src/lib/cv/` intact.

---

## Testing Guidelines

- When modifying the AI vision pipeline or material matcher, add or update tests in `tests/ai-vision.test.ts`.
- Always verify changes with `pnpm build` and `npx tsx --test tests/ai-vision.test.ts`.
