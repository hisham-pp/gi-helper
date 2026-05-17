# How to Add More Character & Weapon Templates

This guide explains how to add new characters, weapons, and goal templates to the system.

## Adding a New Character

### Step 1: Add Character Data

Edit `prisma/seed-data/characters.ts`:

```typescript
{
  id: "character-id",           // Unique ID (lowercase, hyphenated)
  name: "Character Name",        // Display name
  image: "https://enka.network/ui/UI_AvatarIcon_Name.png",  // Character portrait
  rarity: 5,                     // 4 or 5
  element: "Pyro",               // Pyro, Hydro, Electro, Cryo, Anemo, Geo, Dendro
  weaponType: "Sword",           // Sword, Claymore, Polearm, Bow, Catalyst
  region: "Mondstadt",           // Mondstadt, Liyue, Inazuma, Sumeru, Fontaine, etc.
}
```

### Step 2: Add Character Templates

Edit `prisma/seed-data/character-templates.ts`:

```typescript
{
  characterId: "character-id",   // Must match character ID from Step 1
  name: "Ascension 1 (Lv. 20 → 40)",
  description: "First ascension materials",
  category: "ascension",         // "ascension" or "talent"
  sortOrder: 1,                  // Display order within category
  materials: [
    { materialId: "material-id", required: 3 },  // Material IDs must exist in database
    { materialId: "another-material", required: 5 },
  ],
}
```

### Step 3: Find Material IDs

Check existing materials in `prisma/seed-data/` files:

- `enemy-drops.ts` - Common enemy materials
- `elite-drops.ts` - Elite boss materials
- `talent-books.ts` - Talent books
- `local-specialties.ts` - Regional specialties

Or query the database:

```bash
npx prisma studio
# Browse the "materials" table
```

### Step 4: Run Seed

```bash
npx prisma db seed
```

## Adding a New Weapon

### Step 1: Add Weapon Data

Edit `prisma/seed-data/weapons.ts`:

```typescript
{
  id: "weapon-id",               // Unique ID (lowercase, hyphenated)
  name: "Weapon Name",           // Display name
  image: "https://enka.network/ui/UI_EquipIcon_Type_Name.png",  // Weapon icon
  rarity: 5,                     // 3, 4, or 5
  weaponType: "Sword",           // Sword, Claymore, Polearm, Bow, Catalyst
}
```

### Step 2: Add Weapon Templates

Edit `prisma/seed-data/weapon-templates.ts`:

```typescript
{
  weaponId: "weapon-id",         // Must match weapon ID from Step 1
  name: "Ascension 1 (Lv. 20 → 40)",
  description: "First ascension materials",
  category: "ascension",         // Usually "ascension" for weapons
  sortOrder: 1,
  materials: [
    { materialId: "material-id", required: 5 },
    { materialId: "another-material", required: 3 },
  ],
}
```

### Step 3: Run Seed

```bash
npx prisma db seed
```

## Template Categories

### For Characters

**Ascension Templates**

- Ascension 1 (Lv. 20 → 40)
- Ascension 2 (Lv. 40 → 50)
- Ascension 3 (Lv. 50 → 60)
- Ascension 4 (Lv. 60 → 70)
- Ascension 5 (Lv. 70 → 80)
- Ascension 6 (Lv. 80 → 90)

**Talent Templates**

- All Talents Level 1 → 6
- Single Talent Level 6 → 10
- All Talents Level 1 → 10 (combined)

### For Weapons

**Ascension Templates**

- Ascension 1 (Lv. 20 → 40)
- Ascension 2 (Lv. 40 → 50)
- Ascension 3 (Lv. 50 → 60)
- Ascension 4 (Lv. 60 → 70)
- Ascension 5 (Lv. 70 → 80)
- Ascension 6 (Lv. 80 → 90)

## Finding Character/Weapon Images

### Enka Network (Recommended)

Character portraits:

```
https://enka.network/ui/UI_AvatarIcon_{CharacterName}.png
```

Weapon icons:

```
https://enka.network/ui/UI_EquipIcon_{WeaponType}_{WeaponName}.png
```

Examples:

- `UI_AvatarIcon_Nahida.png`
- `UI_AvatarIcon_Shougun.png` (Raiden Shogun)
- `UI_EquipIcon_Sword_Narukami.png` (Mistsplitter)
- `UI_EquipIcon_Pole_Homa.png` (Staff of Homa)

### Finding the Correct Icon Name

1. Visit https://enka.network/
2. Search for the character/weapon
3. Inspect the image URL
4. Copy the icon name

## Material Requirements Reference

### Typical Ascension Materials (Characters)

**Ascension 1 (20→40)**

- 1x Gemstone Sliver
- 3x Local Specialty
- 3x Common Enemy Drop (Tier 1)

**Ascension 2 (40→50)**

- 3x Gemstone Fragment
- 10x Local Specialty
- 15x Common Enemy Drop (Tier 1)
- 2x Elite Boss Material

**Ascension 3 (50→60)**

- 6x Gemstone Fragment
- 20x Local Specialty
- 12x Common Enemy Drop (Tier 2)
- 4x Elite Boss Material

**Ascension 4 (60→70)**

- 3x Gemstone Chunk
- 30x Local Specialty
- 18x Common Enemy Drop (Tier 2)
- 8x Elite Boss Material

**Ascension 5 (70→80)**

- 6x Gemstone Chunk
- 45x Local Specialty
- 12x Common Enemy Drop (Tier 3)
- 12x Elite Boss Material

**Ascension 6 (80→90)**

- 6x Gemstone
- 60x Local Specialty
- 24x Common Enemy Drop (Tier 3)
- 20x Elite Boss Material

### Typical Talent Materials (Characters)

**Level 1→6 (All 3 Talents)**

- 9x Teachings
- 63x Guide
- 18x Common Enemy Drop (Tier 1)
- 66x Common Enemy Drop (Tier 2)

**Level 6→10 (Single Talent)**

- 4x Guide
- 38x Philosophies
- 6x Common Enemy Drop (Tier 2)
- 22x Common Enemy Drop (Tier 3)
- 6x Weekly Boss Material
- 1x Crown of Insight

### Typical Ascension Materials (Weapons)

**Ascension 1 (20→40)**

- 3-5x Weapon Ascension Material (Tier 1)
- 3-5x Common Enemy Drop (Tier 1)
- 2-3x Elite Enemy Drop (Tier 1)

**Ascension 2 (40→50)**

- 3-5x Weapon Ascension Material (Tier 2)
- 12-18x Common Enemy Drop (Tier 2)
- 8-12x Elite Enemy Drop (Tier 2)

## Tips

1. **Start Small**: Add one character with 2-3 templates first
2. **Verify Material IDs**: Always check that material IDs exist before adding templates
3. **Test After Adding**: Run seed and test in the UI after each addition
4. **Use Consistent Naming**: Follow the existing naming patterns
5. **Sort Order**: Use sortOrder to control display order within categories
6. **Descriptions**: Keep descriptions concise and informative

## Common Issues

### "Foreign key constraint violated"

- Material ID doesn't exist in the database
- Check spelling and verify material exists in seed data

### "Unique constraint failed"

- Character/weapon ID already exists
- Template ID collision (characterId + category + sortOrder must be unique)

### Images Not Loading

- Verify the Enka Network URL is correct
- Check that the icon name matches exactly (case-sensitive)
- Try accessing the URL directly in a browser

## Example: Adding Ganyu

```typescript
// In characters.ts
{
  id: "ganyu",
  name: "Ganyu",
  image: "https://enka.network/ui/UI_AvatarIcon_Ganyu.png",
  rarity: 5,
  element: "Cryo",
  weaponType: "Bow",
  region: "Liyue",
}

// In character-templates.ts
{
  characterId: "ganyu",
  name: "Ascension 1 (Lv. 20 → 40)",
  description: "First ascension materials for Ganyu",
  category: "ascension",
  sortOrder: 1,
  materials: [
    { materialId: "whopperflower-nectar", required: 3 },
    { materialId: "slime-condensate", required: 3 },
  ],
},
{
  characterId: "ganyu",
  name: "All Talents Level 1 → 6",
  description: "Materials to level all talents from 1 to 6",
  category: "talent",
  sortOrder: 1,
  materials: [
    { materialId: "whopperflower-nectar", required: 18 },
    { materialId: "shimmering-nectar", required: 66 },
  ],
}
```

## Bulk Adding

For adding many characters/weapons at once:

1. Create a spreadsheet with all data
2. Use a script to generate the TypeScript objects
3. Add all at once to the seed files
4. Run seed once to add everything

## Maintenance

- Keep seed data organized by region or element
- Document any special cases or unusual material requirements
- Update this guide when adding new template categories
- Consider creating a web-based admin interface for easier template management
