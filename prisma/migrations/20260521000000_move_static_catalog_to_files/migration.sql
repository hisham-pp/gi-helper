-- Static reference data now lives in versioned source files.
-- User state keeps string IDs that are resolved against the static catalog in app code.

ALTER TABLE "inventory" DROP CONSTRAINT IF EXISTS "inventory_materialId_fkey";
ALTER TABLE "goal_materials" DROP CONSTRAINT IF EXISTS "goal_materials_materialId_fkey";

DROP TABLE IF EXISTS "character_goal_template_materials" CASCADE;
DROP TABLE IF EXISTS "weapon_goal_template_materials" CASCADE;
DROP TABLE IF EXISTS "character_goal_templates" CASCADE;
DROP TABLE IF EXISTS "weapon_goal_templates" CASCADE;
DROP TABLE IF EXISTS "characters" CASCADE;
DROP TABLE IF EXISTS "weapons" CASCADE;
DROP TABLE IF EXISTS "materials" CASCADE;
