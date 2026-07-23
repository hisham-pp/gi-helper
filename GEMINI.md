# Gemini Project Context: Genshin Material Tracker

This project is a production-ready full-stack material tracker for Genshin Impact. It allows users to track their material inventory, define farming goals, and visualize recursive crafting requirements.

## Project Overview

- **Purpose:** Provide a robust tool for Genshin Impact players to manage materials and progress towards character/weapon upgrades.
- **Main Technologies:**
  - **Frontend/Backend:** Next.js 15 (App Router, Server Actions, Route Handlers)
  - **Language:** TypeScript
  - **Styling:** Tailwind CSS
  - **ORM:** Prisma
  - **Database:** PostgreSQL (Production), SQLite (Local Dev fallback)
  - **State/UI:** React 19, Lucide Icons, Sonner (Toasts), Zod (Validation)
  - **PWA:** Basic PWA manifest and service worker included.
- **Architecture:**
  - **App Router:** Next.js 15 structure with `(authenticated)` group for protected pages.
  - **Server Actions:** Primary method for data mutations (defined in `app/actions.ts`).
  - **Route Handlers:** Used for API endpoints (inventory export/import, image proxy).
  - **Data Layer:** Prisma schema defining `User`, `Material`, `Inventory`, `Goal`, `Character`, `Weapon`, and templates.
  - **Seeding:** Idempotent Prisma seed system with modular data in `prisma/seed-data/`.

## Building and Running

### Prerequisites

- Node.js 22.x
- pnpm (preferred) or npm

### Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Environment Variables:**
    Copy `.env.example` to `.env` and configure `DATABASE_URL`.
3.  **Database Migration:**
    ```bash
    npx prisma migrate dev
    ```
4.  **Seed Database:**
    ```bash
    npx prisma db seed
    ```

### Development

- **Run dev server:** `npm run dev`
- **Linting:** `npm run lint`
- **Formatting:** `npm run format`

### Production

- **Build:** `npm run build`
- **Start:** `npm run start` (Runs migrations and seeds before starting)

## Development Conventions

### Coding Style

- **Components:** Functional components with React 19.
- **Typing:** Strict TypeScript usage. Domain types are located in `lib/types.ts`.
- **Validation:** Use Zod for schema validation, especially in Server Actions and API routes.
- **Icons:** Use `lucide-react`.
- **UI Components:** Reusable components are located in `components/ui/` (based on a shadcn-like structure but customized).

### Data Access & Mutations

- **Mutations:** Prefer Server Actions (`app/actions.ts`) over direct API routes for UI-driven changes.
- **Queries:** Use Prisma directly in Server Components or Server Actions. Data fetching utilities are in `lib/data.ts`.
- **Optimistic UI:** Implement optimistic updates for inventory and goal changes where possible to improve user experience.

### Database

- **Schema Changes:** Modify `prisma/schema.prisma` and run `npx prisma migrate dev`.
- **Seed Data:** Material and template data are managed in `prisma/seed-data/`. Use the sync scripts in `scripts/` to update reference data from external sources if needed.

## Key Files & Directories

- `app/`: Next.js 15 pages and API routes.
- `components/`: UI and feature components.
- `lib/`: Business logic, crafting calculations (`crafting.ts`), and constants.
- `prisma/`: Database schema, migrations, and seed logic.
- `docs/`: Feature requirements and implementation details.
- `scripts/`: Data synchronization utilities.

## Core Logic: Crafting

The application handles recursive 3:1 crafting. The logic is primarily located in `lib/crafting.ts`. It calculates how many "higher tier" materials can be made from "lower tier" materials recursively.

## Authentication

Simple session-based authentication using cookies and a custom `Session` model in Prisma. Logic is in `lib/auth.ts`.
