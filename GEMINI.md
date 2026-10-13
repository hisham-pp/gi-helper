# Gemini Project Context: Genshin Material Tracker & AI Inventory Scanner

Production-ready full-stack material tracker and Multimodal AI Inventory Scanner for Genshin Impact built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## Project Overview

- **Purpose:** Provide a robust tool for Genshin Impact players to scan inventory screenshots, track materials, and export them to `.GOOD` format for character/weapon optimizers.
- **Main Technologies:**
  - **Frontend/Backend:** Next.js 15 (App Router, Dynamic Route Handlers)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS, Glassmorphic UI design
  - **State/UI:** React 19, Lucide Icons, Sonner (Toasts)
  - **AI Vision Engine:** Multimodal REST adapters (Google Gemini, OpenAI GPT, Anthropic Claude, xAI Grok, Custom/OpenRouter)
  - **PWA:** Manifest and service worker included.
- **Architecture:**
  - **App Router:** `src/app/` structure with `page.tsx`, `materials/page.tsx`, and `api/scanner/ai-vision/route.ts`.
  - **AI Vision Scanner:** Replaced local CV slicing with direct Multimodal Vision LLM extraction.
  - **In-Prompt Material Dictionary:** All 475 canonical Genshin materials are embedded directly in system prompts for zero-hallucination extraction.
  - **Resilient Fallback Resolver:** `src/lib/ai/material-matcher.ts` matches raw OCR output to canonical material IDs and names.
  - **Storage:** Client-side `localStorage` for API keys and detected items, with server `.env` fallback.

---

## Building and Running

### Prerequisites

- Node.js 22.x
- `pnpm` (preferred) or `npm`

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Environment Variables (Optional):**
   Copy `.env.example` to `.env` if you want to provide server-level fallback API keys.
   ```bash
   cp .env.example .env
   ```
3. **Run Dev Server:**
   ```bash
   pnpm dev
   ```

---

## AI Vision Scanner Architecture

Located under `src/lib/ai/`:

1. **Adapter Registry (`src/lib/ai/adapters/`):**
   - Implements `AiVisionAdapter` interface for:
     - `GeminiVisionAdapter` (Gemini 1.5 Flash, 2.0 Flash)
     - `OpenAiVisionAdapter` (GPT-4o-mini, GPT-4o)
     - `ClaudeVisionAdapter` (Claude 3.5 Sonnet, Haiku)
     - `GrokVisionAdapter` (Grok 2 Vision)
     - `CustomVisionAdapter` (OpenRouter, Ollama, DeepSeek)
2. **Settings Precedence (`src/lib/scanner-settings.ts`):**
   - API keys saved in browser `localStorage` take precedence over server `.env` keys.
3. **Canonical Reference:**
   - Pre-loaded 475 materials from single canonical `src/data/materials.json` (served dynamically at `/data/materials.json`).

---

## Key Files & Directories

- `src/app/`: Next.js 15 App Router pages, `/api/scanner/ai-vision/route.ts`, and `/data/materials.json/route.ts`.
- `src/components/scanner/`: Scanner UI, Settings Modal, Review Modal, Result Grid.
- `src/lib/ai/`: AI adapters, prompt generator, and material matcher.
- `src/data/materials.json`: Single canonical dataset of 475 materials.
- `public/`: Static assets (`/images/materials/`).
- `tests/ai-vision.test.ts`: Automated unit tests for AI adapters and material matching.
