# Genshin Material Tracker

Production-ready full-stack material tracker for Genshin Impact built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and SQLite.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Simple username/password authentication
- Server actions plus route handlers
- Railway-compatible deployment

## Features

- Preloaded seed database with 80+ Genshin materials across enemy drops, elite drops, and talent books
- Inventory CRUD with optimistic UI updates
- Multi-user inventory and goals with cookie sessions
- Farming goals and goal material requirements
- Recursive 3:1 crafting calculations
- Dashboard overview cards and progress bars
- Dedicated routed material tracker page plus future-ready module pages
- Search and category filters
- Responsive card-based UI
- Dark mode
- JSON inventory import/export
- Proxied material image caching
- Basic PWA manifest and service worker
- Idempotent Prisma seed with split seed-data modules

## Project Structure

```text
app/
  api/
  actions.ts
  challenges/
  collectibles/
  globals.css
  layout.tsx
  login/
  loading.tsx
  manifest.ts
  map/
  materials/
  page.tsx
  register/
  shrines/
components/
  auth/
  dashboard/
  layout/
  providers/
docs/
  requirements.md
lib/
  constants.ts
  crafting.ts
  data.ts
  material-seed.ts
  prisma.ts
  types.ts
  utils.ts
  validation.ts
prisma/
  migrations/
  schema.prisma
  seed-data/
  seed.ts
public/
  service-worker.js
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Run Prisma migrations:

```bash
npx prisma migrate dev
```

4. Seed the database:

```bash
npx prisma db seed
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Create an account from `/register`, then log in from `/login`.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run db:migrate
npm run db:seed
```

## Environment Variables

See [.env.example](./.env.example).

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="Genshin Material Tracker"
```

## Prisma Notes

- Schema is defined in [prisma/schema.prisma](./prisma/schema.prisma).
- Initial migration is committed under [prisma/migrations/20260516193000_init/migration.sql](./prisma/migrations/20260516193000_init/migration.sql).
- Auth and multi-user migration is committed under [prisma/migrations/20260516203000_add_auth_and_multi_user/migration.sql](./prisma/migrations/20260516203000_add_auth_and_multi_user/migration.sql).
- Seed data is split under [prisma/seed-data](./prisma/seed-data) and re-exported by [lib/material-seed.ts](./lib/material-seed.ts).
- The seed script uses `upsert`, so rerunning it adds or updates shared material reference data without clearing user data. That makes it safe to run on every deployment start.

## Railway Deployment

SQLite on Railway should use a mounted volume if you want persistence across redeploys. If you do not mount a volume, SQLite data may be ephemeral depending on the runtime environment.

### Recommended Setup

1. Create a new Railway project from this repo.
2. Add an environment variable:

```env
DATABASE_URL="file:/data/prod.db"
```

3. Attach a persistent volume mounted at `/data`.
4. Deploy normally. Railway will use:
   - `npm run build` for build
   - `npm run start` for runtime

The runtime start command runs Prisma migrations, seeds shared materials, and then starts Next.js.

### Included Railway Config

- [railway.json](./railway.json)
- `postinstall` Prisma client generation
- `start` script with `prisma migrate deploy && prisma db seed && next start`

## API Endpoints

- `GET /api/inventory/export`
- `POST /api/inventory/import`
- `GET /api/material-image/[materialId]`

## Notes

- Authentication is simple by design: local username/password plus session cookies.
- Inventory and goals are scoped per user.
- The architecture is intentionally simple so characters and weapons can be added later without reworking the app foundation.
