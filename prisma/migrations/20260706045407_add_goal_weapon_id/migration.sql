-- AlterTable
ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "weaponId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "goals_weaponId_idx" ON "goals"("weaponId");
