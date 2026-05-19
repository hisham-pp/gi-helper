# Genshin Material Tracker

Production-ready full-stack material tracker for Genshin Impact built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
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
- Full backup export/import for shared materials plus user inventory and goals
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

## Vercel Deployment

Vercel runs the configured build command for deployments, but it does not run the
app's `start` script. The included [vercel.json](./vercel.json) points Vercel at
`pnpm vercel-build`, which runs Prisma migrations, seeds shared reference data,
and then builds Next.js.

Make sure the Vercel project has `DATABASE_URL` and `DIRECT_URL` configured for
the production PostgreSQL database. Set `SEED_MASTER_PASSWORD` on the first
deploy if you want the seeded `master` account to use a password other than the
local fallback.

## Railway Deployment

This application is optimized for deployment on Railway with a PostgreSQL database.

### Recommended Setup

1. Create a new Railway project from this repo.
2. Add a **PostgreSQL** service to your Railway project.
3. Railway will automatically provide a `DATABASE_URL` environment variable to your application.
4. Deploy normally. Railway will use:
   - `npm run build` for build
   - `npm run start` for runtime

The runtime start command runs Prisma migrations, seeds shared materials, and then starts Next.js.

### Included Railway Config

- [railway.json](./railway.json)
- `postinstall` Prisma client generation
- `start` script with `prisma migrate deploy && prisma db seed && next start`

### Backup

- Use the `Export all` button in the top bar to download a full JSON backup.
- Use `Import all` to restore that backup for the logged-in user.

## API Endpoints

- `GET /api/inventory/export`
- `POST /api/inventory/import`
- `GET /api/material-image/[materialId]`

## Notes

- Authentication is simple by design: local username/password plus session cookies.
- Inventory and goals are scoped per user.
- The architecture is intentionally simple so characters and weapons can be added later without reworking the app foundation.
