# GI Helper roadmap

Feature ideas and to-dos after 0.0.18, in the order I'd tackle them. Sizes are rough:
**S** about a day, **M** a few days, **L** a week or more.

## Direction

**Scan the whole account, not only materials, and export one complete GOOD file.**
Material planning and tracking is left to the apps that already do it well
(Seelie, Paimon.moe, Genshin Optimizer). GI Helper's job is to feed them.

Why this is the gap worth filling:

- Today the scanner reads one bag tab, **Character Development Items**
  (`materials.json` holds 475 items, all `AVATAR_MATERIAL`). Local specialties,
  cooking ingredients, ores and wood aren't covered. Weapons, artifacts and
  characters aren't scanned at all.
- The full-account scanners people use today mostly run on Windows next to the
  game. **Mobile and console players have very few options.** GI Helper already
  runs in the browser on any device, reads screenshots and screen recordings on
  the device, and needs no install or game-client access. That's the
  differentiator.
- Most of the engine carries over: the card/grid detector, icon-atlas matching,
  rarity and digit reading, the video keyframe picker with merge-by-vote, the
  review modal and the GOOD exporter.

Usage so far: 17 screenshot scans, 1 video scan and 0 AI Vision scans
(Supabase `scan_totals`).

---

## P0: Fix first (small, real defects): done in 0.0.19

- [x] **Lint was broken** (S): `eslint.config.mjs` loaded the eslintrc-style
      Next config directly, so ESLint 9 crashed. It now goes through `FlatCompat`
      with the TypeScript rules (`no-explicit-any` as a warning).

- [x] **GOOD export writes invalid keys for 5 materials** (S)
      `toGOODFormatName` in `src/lib/good-format.ts` only strips `' " -`, so
      `Ascended Sample: Knight` becomes `AscendedSample:Knight`, and the two
      `Artificed Spare Clockwork Component — Coppel…` items keep the em dash.
      Strip every non-alphanumeric character and test every name against
      `^[A-Za-z0-9]+$`. This matters more once weapons and artifacts use the same
      helper.
- [x] **AI Vision model lists are out of date** (S)
      The defaults include retired models (`claude-3-5-sonnet-latest`,
      `claude-3-opus-20240229`, `gpt-4o-mini`, `grok-2-vision-1212`,
      `gemini-1.5-flash`). Refresh them (Claude: `claude-sonnet-5-5` /
      `claude-haiku-5-5`), or have **Test connection** fetch the provider's model
      list.
- [x] **Daily data sync doesn't commit the recognizer atlas or characters** (S)
      `scrape-materials.yml` rebuilds `public/data/material-atlas.*`,
      `src/data/characters.json` and the avatars, but `file_pattern` only commits
      `materials.json` and the icons. New materials show up in the directory but
      the scanner can't recognise them. The same gap will hit every new atlas
      below, so fix it now. Bump `genshin-db` automatically (Renovate or Dependabot).
- [x] **CI for pull requests** (S)
      Run `pnpm lint`, `pnpm test`, `pnpm test:material-detector`,
      `pnpm test:grid-detector` and `pnpm build` on every PR. Every new scanner
      below adds a test suite, and they should be gated.
- [x] **E2E smoke tests** (M)
      `tests/e2e/` is empty. Cover: sample scan leads to review, then
      `/inventory`, then a GOOD download.
- [x] **Refresh `README.md`** (S)
      Its structure and model list are outdated. Point to `AGENTS.md` and `docs/`.

---

## P1: Foundation for more item kinds

Do this once, before the scanners, so each new scanner only adds recognition.

- [ ] **Game data for every kind** (M): weapons, artifact sets and character keys done in 0.0.20
      Extend the scrapers (`genshin-db` is already a dependency, and enka.network
      icons are already used for avatars):
      - [x] `weapons.json`: id, GOOD key, name, rarity, type, icon (awakened icons
        still to add for the weapon atlas: weapons at ascension 2+ show them).
      - [x] `artifact-sets.json`: GOOD `setKey`, rarities, piece names and the
        piece icons per set.
      - [x] The GOOD key and weapon type per character in `characters.json`.
        Still to add: constellation-boosted talents per character (C3/C5 add +3,
        and GOOD stores the base level).
      - [x] GOOD stat keys and names (`src/lib/good/types.ts`). Still to add:
        main-stat values by rarity and level, and substat roll values by rarity.
      - [x] The **Materials** bag tab: local specialties, cooking ingredients, ores,
        wood, fish and so on, with GOOD keys (`other-materials.json`, 285 items).
- [ ] **One atlas builder for every kind** (M)
      Generalize `build-material-atlas.ts` so it builds an atlas per kind
      (materials, weapons, artifact pieces, character avatars) and the recognizer
      can load just the one it needs.
- [x] **Inventory per kind** (M): done in 0.0.20
      Stores for characters, weapons, artifacts and imported extra materials
      (`src/lib/good-inventory.ts`) beside the existing materials store, and
      `/inventory` tabs for each with search, filters and remove. Editing
      characters, weapons and artifacts by hand is still to do.
- [x] **Full GOOD exporter and importer** (M): done in 0.0.20 (still to check by
      importing an export into Genshin Optimizer itself)
      Export `characters`, `weapons`, `artifacts` and `materials`, with a choice of
      sections, and `location` (equipped by) and `lock`. Follow the current
      Genshin Optimizer GOOD spec, and use **importing into Genshin Optimizer** as
      the acceptance test. Also add a GOOD importer, so people can load an existing
      file and re-scan only what changed.
- [ ] **Auto-detect what's being scanned** (M)
      Drop any screenshot or recording and work out which bag tab or screen it
      shows, from the active tab icon in the bag header or the card shapes, with a
      manual override. One drop zone instead of a mode per kind.
- [ ] **Sample sets and ground truth per kind** (ongoing)
      Same pattern as `public/samples/test-set-0x` +
      `tests/material-detector/ground-truth.json` + `pnpm eval:*`, so every scanner
      has an accuracy number from day one.

---

## P2: Scanners, in order of effort

### Other bag items: the Materials tab (M), the quickest win
- [ ] Same cards, rarity frames and quantity digits as Character Development
      Items, so this is mostly an atlas now: the data and icons are in
      `other-materials.json` (0.0.20).
- [ ] Test with screenshots and a recording of that tab, and add it to the
      sample sets.
- [ ] Optional: read **Mora** from the bag header.

### Weapons (M grid, then M detail)
- [ ] **From the grid:** match the icon against the weapon atlas, and read rarity,
      level ("Lv. 90", the same digit approach as quantities) and the lock icon.
      Fast, and it works with the existing screenshot and video flow.
- [ ] **From the detail panel:** refinement rank, the level cap (to settle the
      ascension where level alone is ambiguous, e.g. 80/80 vs 80/90) and
      **equipped by**. Match the small character avatar against the avatar atlas,
      which we already have.
- [ ] In review, let people bulk-set refinement for anything the detail panel
      didn't cover.

### Characters (M Enka, M–L screenshots)
- [ ] **Import by UID from enka.network** (server route with caching, respecting
      Enka's rules). This gives showcase characters with level, ascension,
      constellation, talents, weapon and artifacts in seconds. Map Enka ids to GOOD
      keys.
- [ ] **Quick manual roster:** pick owned characters from the avatar grid and set
      level, constellation and talents. Many players own 50+ characters, and this
      plus Enka covers most of it.
- [ ] **Scan from screenshots or recordings** of the character screen (Attributes,
      Constellation and Talents tabs). Subtract constellation talent boosts to store
      base levels.

### Artifacts (L+, the biggest value for optimizer users)
- [ ] **Set, slot, rarity and level from the grid:** each piece icon is unique per
      set and slot, so the artifact atlas identifies both without reading any text.
- [ ] **Main stat and substats from the detail panel:** this needs on-device text
      reading.
      - Option A: Tesseract.js in a worker. Snap results to the closed vocabulary
        (about 20 stat names) and parse the numbers.
      - Option B: glyph templates like `digit-templates.json`, extended to
        letters, `%` and `.`.
      - Option C: AI Vision as an opt-in fallback for low-confidence panels. That
        gives the existing adapters a real job.
- [ ] **Validation catches misreads:** the main-stat value follows from type,
      rarity and level. Substat values must be sums of valid rolls for the rarity,
      and the substat count and roll total must fit the level. Flag anything
      impossible in review.
- [ ] **"Tap-through" recording:** the player records the screen while tapping
      artifact after artifact. The keyframe picker watches the detail panel
      instead of the grid and reads each new artifact once. Suggest filters (5★
      only, +16 and up) so people don't have to tap 1,500 pieces.
- [ ] Equipped by (avatar match) and the lock state, as with weapons.
- [ ] Review: card crop beside the parsed stats, quick edits, and invalid rolls
      highlighted.

---

## Done beside the plan

- [x] **Database pages** (0.0.20): `/characters`, `/weapons` and `/artifacts`
      beside `/materials`, behind one "Database" link in the top bar, marking what's
      in the inventory.

## P3: Platform

- [ ] **Live screen capture on PC** (M)
      `getDisplayMedia` on the game window feeds frames straight into the keyframe
      picker. Tap through artifacts or scroll the bag, and the inventory fills in
      live. No recording file needed. It works for every scanner above.
- [ ] **Offline PWA and share target** (M)
      Cache the app shell, the atlases and the workers so scanning works offline.
      Add a Web Share Target so Android players can share screenshots from their
      gallery straight into GI Helper.
- [ ] **Profiles** (S–M)
      Separate inventories for alts or servers.
- [ ] **Scan history and undo** (M)
      A dated snapshot per scan, "changes since last scan" and Undo, because scans
      replace counts.
- [ ] **Game client language** (M)
      Icon matching is language-independent, but artifact and character text isn't.
      Start with the English client, document that, then add the big languages
      (`genshin-db` has localized names).
- [ ] **"What's new" nudge** (S) after a version bump.
- [ ] **Accessibility pass** (S–M): keyboard flow through review, focus traps and
      labels on icon-only buttons.

---

## Big bets (later)

- [ ] **Opt-in accuracy loop:** when someone corrects a card or stat in review,
      they can choose to send that crop and the right answer. It grows the
      ground-truth sets from real devices and resolutions. Opt-in only, with no
      full screenshots.
- [ ] **Account-free sync:** an encrypted blob keyed by a random sync code, if
      backup and restore isn't enough.

## Not now

- **Material planning or tracking:** Seelie, Paimon.moe and Genshin Optimizer
  already do it. Export to them instead.
- **HoYoLAB import:** it needs the player's login cookies, which we shouldn't ask
  for.
- **Food, gadgets, furnishings and the quest/precious tabs:** they aren't part of
  GOOD and nothing downstream uses them.
- Real user accounts, more AI providers, more motion polish.

## Suggested order

1. **P0 batch:** GOOD keys, AI models, the sync workflow and CI.
2. **Foundation:** data, atlas builder, per-kind inventory, full GOOD export and
   import.
3. **Materials tab** (quick win), then **weapons from the grid**.
4. **Characters:** Enka import and the manual roster.
5. **Artifacts:** grid identification, then detail-panel reading with roll
   validation, then tap-through recording.
6. **Live capture on PC**, weapon detail panels, then character screenshots.
