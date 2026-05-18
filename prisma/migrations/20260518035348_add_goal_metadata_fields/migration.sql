-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "category" TEXT,
ADD COLUMN     "characterId" TEXT;

-- CreateIndex
CREATE INDEX "goals_category_idx" ON "goals"("category");

-- CreateIndex
CREATE INDEX "goals_characterId_idx" ON "goals"("characterId");
