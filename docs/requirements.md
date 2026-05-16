# Genshin Material Tracker Requirements

## Purpose

Build a production-ready full-stack web application named `Genshin Material Tracker` for tracking Genshin Impact materials, inventory, farming goals, and recursive crafting progress.

## Primary Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Route handlers and/or server actions
- Railway-compatible deployment

## Functional Requirements

### 1. Material System

- Preload common Genshin Impact materials automatically through Prisma seed data.
- Each material must include:
  - `id`
  - `name`
  - `image`
  - `rarity`
  - `category`
  - `description`
  - `combinable`
  - `combineRatio`
  - `parentMaterialId` nullable
- Seed at least 30 materials.
- Include real public image URLs.
- Include valid crafting chains such as:
  - `Slime Condensate -> Slime Secretions -> Slime Concentrate`
  - with `3:1` crafting relationships

### 2. Inventory Tracking

- Users can add owned quantities.
- Users can update quantities.
- Users can remove/reset quantities.
- Users can view total inventory per material.

### 3. Target Tracking

- Users can create farming goals.
- Each goal can contain multiple required materials.
- Users can track progress toward each goal.

### 4. Combination Logic

- Implement automatic combination calculations.
- Support recursive crafting from lower-tier materials upward.
- Example:
  - Need `10` `Slime Secretions`
  - Own `30` `Slime Condensate`
  - App must determine that user can craft enough
  - App must expose deficit or surplus
- Provide crafting simulation output, not only raw counts.

### 5. Dashboard

- Create a general dashboard page as the product home.
- Show overview cards and module entry points.
- Include high-level summaries for material progress and future systems.
- Keep material tracking as a separate routed page, not the root dashboard.

### 6. UI Requirements

- Card-based layout
- Responsive, mobile-first design
- Material images shown throughout the app
- Search and filter for materials
- Route-level navigation for current and future modules.
- Required current routes:
  - `Dashboard`
  - `Material Tracker`
- Future-ready routes/placeholders:
  - `Map`
  - `Collectibles` such as Hydroculus, Dendroculus, Lumenspar
  - `Shrines`
  - `Challenges`
- Clean, minimal, modern design
- Dark mode
- Rarity-based colors
- Loading states
- Empty states
- Toast notifications
- Optimistic UI updates where practical

### 7. Database Requirements

- Use Prisma with SQLite.
- Include models/tables for:
  - `materials`
  - `inventory`
  - `goals`
  - `goal_materials`
- Include migration files in the repository.

### 8. API / Mutation Requirements

- Use Next.js route handlers and/or server actions.
- Implement CRUD operations.
- Include validation and error handling.
- Keep responses type-safe.

### 9. Deployment Requirements

- Must run on Railway free tier.
- Include:
  - `railway.json` if useful
  - production-ready Prisma setup
  - environment variable example
  - build/start scripts

### 10. Developer Experience

- ESLint
- Prettier
- Absolute imports
- Maintainable architecture
- No unnecessary complexity

### 11. Nice-to-Have Features

- PWA support
- Offline support
- Import/export inventory JSON
- Material planner calculator
- Architecture ready for future character/weapon expansion

## Constraints

- Use simple authentication only
- SQLite only
- No external paid services
- Must run locally with:
  - `npm install`
  - `npx prisma migrate dev`
  - `npm run dev`

## Implementation Notes

### Proposed Architecture

- `app/` for routed UI and route handlers
- `components/` for reusable UI blocks
- `features/materials`, `features/inventory`, `features/goals`, `features/crafting` for domain logic
- feature pages should be isolated so future systems can be added without merging concerns into one page
- `lib/` for Prisma client, utilities, validation, constants, and calculation helpers
- `prisma/` for schema, migrations, and seed

### Data Approach

- Materials are global shared reference data.
- Inventory and goals are user-scoped.
- A user can have one inventory row per material.
- Goal materials belong to one goal and one material.
- Crafting logic should calculate:
  - direct ownership
  - craftable equivalents from descendants
  - recursive material conversion
  - surplus/deficit after simulated crafting

### Authentication Approach

- Simple username/password authentication.
- Session cookie authentication with server-side session lookup.
- Registration page for creating accounts.
- Login required for dashboard and feature routes.
- Multi-user separation for inventory and goals.

### UI Approach

- Use a root dashboard page for product-wide navigation and status.
- Keep material tracking in its own dedicated page and component tree.
- Add placeholder pages for map, collectibles, shrines, and challenge systems.
- Server-render initial data for fast first load.
- Use server actions for mutations and route handlers for import/export and optional JSON endpoints.

### Delivery Checklist

- Complete source code
- Prisma schema
- Migration files
- Seed script
- README
- `.env.example`
- Railway setup
- Local run instructions
