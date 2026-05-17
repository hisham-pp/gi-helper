# Seed Data Structure

This directory contains all seed data for the Genshin Impact tracker application.

## Structure

```
seed-data/
├── materials/           # All material types
│   ├── enemy-drops.ts
│   ├── elite-drops.ts
│   ├── talent-books.ts
│   ├── local-specialties.ts
│   ├── boss-materials.ts
│   ├── gem-materials.ts
│   └── index.ts
├── characters/          # Individual character files
│   ├── navia.ts
│   ├── nahida.ts
│   ├── raiden.ts
│   ├── bennett.ts
│   └── ... (one file per character)
│   └── index.ts
├── types.ts            # Shared TypeScript types
├── helpers.ts          # Helper functions
└── index.ts            # Main export file
```

## Adding a New Character

1. Create a new file in `characters/` folder: `characters/character-name.ts`
2. Define the character data and goal templates:

```typescript
import type { SeedCharacter, SeedCharacterGoalTemplate } from "../types";

export const characterName: SeedCharacter = {
  id: "character-id",
  name: "Character Name",
  image: "https://enka.network/ui/UI_AvatarIcon_CharacterName.png",
  rarity: 5,
  element: "Element",
  weaponType: "Weapon",
  region: "Region",
};

export const characterNameGoalTemplates: SeedCharacterGoalTemplate[] = [
  // Ascension templates
  {
    characterId: "character-id",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension materials",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "material-id", required: 1 },
      // ... more materials
    ],
  },
  // Talent templates
  {
    characterId: "character-id",
    name: "All Talents Level 1 → 6",
    description: "Materials to level all three talents from 1 to 6",
    category: "talent",
    sortOrder: 1,
    materials: [
      { materialId: "material-id", required: 9 },
      // ... more materials
    ],
  },
];
```

3. Add imports to `characters/index.ts`:

```typescript
import { characterName, characterNameGoalTemplates } from "./character-name";

export const characters = [
  // ... existing characters
  characterName,
];

export const characterGoalTemplates = [
  // ... existing templates
  ...characterNameGoalTemplates,
];
```

## Adding New Materials

Add materials to the appropriate file in the `materials/` folder:

- `enemy-drops.ts` - Common enemy drops (3-tier families)
- `elite-drops.ts` - Elite enemy drops (3-tier families)
- `talent-books.ts` - Talent books (3-tier families)
- `local-specialties.ts` - Regional specialty items
- `boss-materials.ts` - Boss drops and special materials
- `gem-materials.ts` - Elemental gems (4-tier families)

## Character Data Structure

Each character file contains:

- **Character info**: Basic character data (name, element, weapon, etc.)
- **Goal templates**: Pre-defined material requirements for:
  - 6 Ascension phases (Lv. 20→40, 40→50, 50→60, 60→70, 70→80, 80→90)
  - Talent leveling (1→6 for all talents, 6→10 for single talent, 6→10 for triple crown)

## Talent Leveling Note

Each character has **three talents** (Normal Attack, Elemental Skill, Elemental Burst) that are leveled separately but use the same material types.
