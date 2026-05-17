# Character & Weapon Goal Templates Feature

## Overview
This feature adds predefined goal templates for characters and weapons, allowing users to quickly create farming goals with pre-configured material requirements for ascensions and talent leveling.

## Database Schema Changes

### New Models

1. **Character**
   - Stores character information (name, image, rarity, element, weapon type, region)
   - Links to character goal templates

2. **Weapon**
   - Stores weapon information (name, image, rarity, weapon type)
   - Links to weapon goal templates

3. **CharacterGoalTemplate**
   - Predefined goal templates for characters
   - Categories: ascension, talent
   - Contains name, description, and sort order
   - Links to required materials

4. **CharacterGoalTemplateMaterial**
   - Junction table linking templates to materials with required quantities

5. **WeaponGoalTemplate**
   - Predefined goal templates for weapons
   - Similar structure to character templates

6. **WeaponGoalTemplateMaterial**
   - Junction table for weapon template materials

### Updated Models

- **Goal**: Added `templateType` and `templateId` fields to track if a goal was created from a template
- **Material**: Added relations to template materials

## Seed Data

### Characters (8 total)
- **5-Star**: Nahida, Raiden Shogun, Zhongli, Kazuha, Hu Tao, Yelan
- **4-Star**: Bennett, Xingqiu

### Weapons (6 total)
- **5-Star**: Mistsplitter Reforged, Staff of Homa, Thundering Pulse, Kagura's Verity
- **4-Star**: Prototype Rancour, Favonius Lance

### Goal Templates
Each character/weapon has multiple templates for:
- **Ascension levels**: Materials needed for each ascension phase
- **Talent levels**: Materials for leveling talents (characters only)

Example templates for Nahida:
- Ascension 1 (Lv. 20 → 40)
- Ascension 2 (Lv. 40 → 50)
- All Talents Level 1 → 6
- Single Talent Level 6 → 10

## UI Components

### 1. Goal Templates Page (`/goal-templates`)
- Tab-based interface for Characters and Weapons
- Grid layout showing all available characters/weapons
- Each card displays:
  - Character/weapon image with rarity-based gradient
  - Name and basic info (element, weapon type)
  - List of available templates
- Click any template to instantly create a goal

### 2. Goal Templates Component
- Client-side component with tab switching
- Responsive grid layout (1-3 columns based on screen size)
- Visual feedback during goal creation
- Toast notifications for success/error states

### 3. Updated Materials Page
- Added "Templates" button in the Goals tab
- Updated "Create Goal" button to "Custom Goal" for clarity
- Updated empty state message

## Server Actions

### `createGoalFromTemplateAction`
- Creates a new goal from a character or weapon template
- Automatically copies all material requirements from the template
- Sets goal name as "{Character/Weapon Name} - {Template Name}"
- Tracks template source via `templateType` and `templateId`

## User Flow

1. User navigates to Materials page → Goals tab
2. Clicks "Templates" button
3. Browses characters or weapons in tabbed interface
4. Clicks on a specific template (e.g., "Nahida - Ascension 1")
5. Goal is instantly created with all materials pre-configured
6. User is redirected to Goals tab to see their new goal
7. User can track progress and update inventory as usual

## Benefits

- **Speed**: Create complex goals in one click instead of manually adding each material
- **Accuracy**: Pre-configured material requirements reduce user error
- **Discoverability**: Users can explore what materials are needed for different characters/weapons
- **Flexibility**: Users can still create custom goals or edit template-based goals
- **Scalability**: Easy to add more characters, weapons, and templates via seed data

## Future Enhancements

1. **More Templates**: Add templates for higher ascension levels and talent levels
2. **Combined Goals**: "Full Build" templates that include all ascensions + talents
3. **Template Editing**: Allow users to customize templates before creating goals
4. **Template Search/Filter**: Filter by element, weapon type, rarity
5. **Material Breakdown**: Show detailed material breakdown before creating goal
6. **Constellation Materials**: Add templates for character constellations
7. **Refinement Materials**: Add templates for weapon refinements

## Files Modified/Created

### Database
- `prisma/schema.prisma` - Added new models and relations
- `prisma/seed.ts` - Updated to seed characters, weapons, and templates
- `prisma/seed-data/characters.ts` - Character data
- `prisma/seed-data/weapons.ts` - Weapon data
- `prisma/seed-data/character-templates.ts` - Character goal templates
- `prisma/seed-data/weapon-templates.ts` - Weapon goal templates
- `prisma/seed-data/index.ts` - Export new seed data

### Server
- `app/actions.ts` - Added `createGoalFromTemplateAction`

### UI
- `app/(authenticated)/goal-templates/page.tsx` - New page for browsing templates
- `components/dashboard/goal-templates.tsx` - Template browser component
- `components/dashboard/dashboard-shell.tsx` - Updated Goals tab UI

### Documentation
- `docs/character-weapon-goals-feature.md` - This file

## Migration

Run the following commands to apply the changes:

```bash
# Generate and apply migration
npx prisma migrate dev --name add_character_weapon_templates

# Seed the database with new data
npx prisma db seed
```

## Testing

1. Navigate to `/materials?tab=goals`
2. Click "Templates" button
3. Browse characters and weapons
4. Click on any template to create a goal
5. Verify goal is created with correct materials
6. Check that progress tracking works as expected
