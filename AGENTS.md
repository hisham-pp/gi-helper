# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 15 App Router project with Prisma and PostgreSQL. Route files live under `app/`, with authenticated pages grouped in `app/(authenticated)/` and server actions in `app/actions.ts`. Reusable UI and feature components live in `components/` (`auth/`, `dashboard/`, `layout/`, `ui/`). Shared logic belongs in `lib/`. Database schema, migrations, and seed data live in `prisma/`. Static assets are served from `public/`, and large Genshin reference datasets live in `data/`. Use `docs/` for contributor-facing notes such as template expansion guides.

## Build, Test, and Development Commands
Prefer `pnpm`; the repo pins `pnpm@10.17.1` and Node `22.x`.

- `pnpm dev`: start the local Next.js dev server.
- `pnpm build`: create a production build.
- `pnpm start`: apply deployed migrations, reseed shared data, and start the app.
- `pnpm lint`: run ESLint with the Next.js core-web-vitals config.
- `pnpm format`: run Prettier across the repo.
- `pnpm db:migrate`: create/apply a local Prisma migration.
- `pnpm db:seed`: reseed database content from `prisma/seed.ts`.
- `pnpm prisma:generate`: regenerate the Prisma client.

## Coding Style & Naming Conventions
Use TypeScript throughout. Follow Prettier defaults with semicolons, double quotes, and Tailwind class sorting via `prettier-plugin-tailwindcss`. Components and exported React functions use `PascalCase`; utility modules and route segments use lowercase or kebab-case. Keep IDs and seed keys lowercase and hyphenated, for example `majestic-hooked-beak`. Place shared validation, constants, and helpers in `lib/` rather than duplicating logic inside route files or components.

## Testing Guidelines
There is no committed unit or E2E test suite yet. Until one exists, treat `pnpm lint`, `pnpm build`, and focused manual checks as the minimum gate for changes. When adding tests later, keep them close to the feature or under a dedicated `tests/` directory and name them `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative messages such as `fix seeder` and `add images and data`. Keep commits focused and descriptive: `add weapon template seed data` is better than `updates`. PRs should include a concise summary, note schema or seed changes, link related issues, and include screenshots for UI changes. If a change affects setup or contributor workflow, update `README.md` or `docs/` in the same PR.
