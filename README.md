# Genshin Material Tracker & AI Inventory Scanner

A modern, full-stack Genshin Impact material management tool and multimodal AI inventory scanner built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

Scan your in-game inventory screenshots using leading Vision AI models (Google Gemini, OpenAI GPT, Anthropic Claude, xAI Grok, or local/custom endpoints), verify detected items in an interactive review modal, and export directly to `.GOOD` format.

---

## Key Features

### 1. Multimodal AI Inventory Scanner

- **Direct Vision Recognition:** Upload screenshots of your in-game material bags to automatically identify items and counts.
- **Pluggable AI Adapter Architecture:** Switch between multiple providers on the fly:
  - **Google Gemini** (`gemini-1.5-flash` [Free Tier / Recommended], `gemini-2.0-flash`, `gemini-1.5-pro`)
  - **OpenAI** (`gpt-4o-mini`, `gpt-4o`)
  - **Anthropic Claude** (`claude-3-5-sonnet-latest`, `claude-3-5-haiku-latest`)
  - **xAI Grok** (`grok-2-vision-1212`, `grok-vision-beta`)
  - **Custom / OpenAI-Compatible** (OpenRouter, Local Ollama, DeepSeek, vLLM)
- **Local Storage Key Management:** API keys and model preferences are saved directly in browser `localStorage`, seamlessly overriding any server `.env` variables.
- **Live Connection Test:** Test API credentials with real-time feedback directly inside the settings modal.

### 2. Canonical Genshin Impact Dataset (475 Materials)

- Pre-compiled dataset covering all 475 materials:
  - Character Ascension Materials & Gems
  - Character Talent Books (Teachings, Guides, Philosophies)
  - Weapon Ascension Materials
  - Common & Elite Enemy Drops
  - Normal Boss & Weekly Trounce Domain Drops
  - Local Specialties, Ores, and Refinement Items
- Single canonical dataset under `src/data/materials.json` (also served dynamically at `/data/materials.json`).
- In-prompt reference dictionary ensures AI models select canonical IDs and names with zero hallucination.
- Resilient fuzzy matching fallback ([`src/lib/ai/material-matcher.ts`](./src/lib/ai/material-matcher.ts)) handles minor OCR typos and spelling variations.

### 3. Interactive Review & GOOD Format Export

- **Post-Scan Review Modal:** Verify every detected item, adjust quantities with quick `+`/`-` steppers, search and re-assign materials, or delete entries.
- **Genshin Open Object Description (GOOD):** Export scanned materials to standardized `.json` format compatible with popular Genshin optimizers and tools.

---

## Technology Stack

- **Framework:** Next.js 15 (App Router, Dynamic Route Handlers)
- **Frontend:** React 19, Tailwind CSS, Lucide Icons, Sonner (Toast notifications)
- **AI Vision Engine:** Multimodal REST adapters (Gemini, OpenAI, Claude, Grok, Custom)
- **Static Assets:** 475 material icons, PWA manifest
- **Runtime & Package Manager:** Node.js 22.x, `pnpm` (v10.17.1)

---

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── scanner/
│   │       └── ai-vision/route.ts      # Server Route Handler for Vision AI & connection tests
│   ├── debug/                          # Internal testing & debug pages
│   ├── materials/page.tsx              # Canonical materials directory page
│   ├── globals.css                     # Global design tokens and styles
│   ├── layout.tsx                      # Root layout with navbar & providers
│   └── page.tsx                        # Main landing & inventory scanner page
├── components/
│   ├── materials/                      # Material directory & category components
│   ├── scanner/                        # Scanner UI components:
│   │   ├── Scanner.tsx                 # Core scanner pipeline
│   │   ├── ScannerSettingsModal.tsx    # Multi-provider configuration modal
│   │   ├── ScannerSettingsButton.tsx   # Header quick-access settings button
│   │   ├── ScanReviewModal.tsx         # Interactive post-scan review modal
│   │   ├── UploadZone.tsx              # Drag-and-drop file upload zone
│   │   └── ResultGrid.tsx              # Scanned items table & export controls
│   └── ui/                             # Reusable UI primitives
├── data/
│   └── materials.json                  # Canonical 475-item material dataset
└── lib/
    ├── ai/
    │   ├── adapters/                   # Pluggable AI Vision Adapters:
    │   │   ├── types.ts                # AiVisionAdapter interface & contracts
    │   │   ├── gemini-adapter.ts       # Google Gemini Vision implementation
    │   │   ├── openai-adapter.ts       # OpenAI GPT implementation
    │   │   ├── claude-adapter.ts       # Anthropic Claude implementation
    │   │   ├── grok-adapter.ts         # xAI Grok implementation
    │   │   ├── custom-adapter.ts       # OpenAI-Compatible / OpenRouter implementation
    │   │   └── index.ts                # Adapter registry & factory
    │   ├── material-matcher.ts         # Exact & Levenshtein material resolver
    │   ├── prompts.ts                  # In-prompt reference dictionary generator
    │   └── vision-scanner.ts           # Vision scan execution helpers
    ├── good-format.ts                  # GOOD format exporter
    ├── materials.ts                    # Category helpers & rarity styles
    ├── scanner-settings.ts             # LocalStorage settings hook & persistence
    └── types.ts                        # Core TypeScript domain types
public/
└── images/
    └── materials/                      # 475 material thumbnail icons
```

---

## Getting Started

### Prerequisites

- Node.js `22.x` (or `20.x`+)
- `pnpm` (recommended): `npm install -g pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/hisham-pp/gi-helper.git
cd gi-helper

# Install dependencies
pnpm install
```

### Environment Variables (Optional)

You can configure optional server-side fallback API keys in `.env` (copy from `.env.example`):

```env
# Optional server fallback keys (browser localStorage overrides these)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GROK_API_KEY=""
CUSTOM_AI_API_KEY=""
```

> **Note:** Keys can be entered directly in the web UI under **Scanner Settings** (gear icon). Browser keys are saved in `localStorage` and never require editing `.env` files.

### Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Commands

| Command       | Description                                                |
| :------------ | :--------------------------------------------------------- |
| `pnpm dev`    | Start local Next.js development server at `localhost:3000` |
| `pnpm build`  | Create optimized production build                          |
| `pnpm start`  | Start production server                                    |
| `pnpm test`   | Run unit tests with Node test runner (`node:test`)         |
| `pnpm lint`   | Run ESLint with Next.js core web vitals configuration      |
| `pnpm format` | Run Prettier across the codebase                           |

---

## AI Scanner Provider Guide

1. **Google Gemini (Recommended):**
   - Free tier available via [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Fast responses (typically 1–2 seconds) using `gemini-1.5-flash` or `gemini-2.0-flash`.
2. **OpenAI:**
   - Requires API key from [OpenAI Platform](https://platform.openai.com/api-keys).
   - Recommended model: `gpt-4o-mini` (cost-effective) or `gpt-4o`.
3. **Anthropic Claude:**
   - Requires API key from [Anthropic Console](https://console.anthropic.com/settings/keys).
   - Recommended model: `claude-3-5-sonnet-latest` or `claude-3-5-haiku-latest`.
4. **xAI Grok:**
   - Requires API key from [xAI Console](https://console.x.ai).
   - Recommended model: `grok-2-vision-1212`.
5. **Custom / Local:**
   - Point to any OpenAI-compatible Vision API (e.g., OpenRouter `https://openrouter.ai/api/v1` or local Ollama).

---

## License

MIT
