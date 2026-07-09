-- AlterTable
ALTER TABLE "owned_characters"
  ADD COLUMN IF NOT EXISTS "level" INTEGER,
  ADD COLUMN IF NOT EXISTS "normalAttackLevel" INTEGER,
  ADD COLUMN IF NOT EXISTS "elementalSkillLevel" INTEGER,
  ADD COLUMN IF NOT EXISTS "elementalBurstLevel" INTEGER;
