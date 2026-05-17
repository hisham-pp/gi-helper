-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "templateType" TEXT;

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "element" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "weaponType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_goal_templates" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_goal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_goal_template_materials" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "required" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_goal_template_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon_goal_templates" (
    "id" TEXT NOT NULL,
    "weaponId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapon_goal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon_goal_template_materials" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "required" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapon_goal_template_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "characters"("name");

-- CreateIndex
CREATE INDEX "characters_rarity_idx" ON "characters"("rarity");

-- CreateIndex
CREATE INDEX "characters_element_idx" ON "characters"("element");

-- CreateIndex
CREATE UNIQUE INDEX "weapons_name_key" ON "weapons"("name");

-- CreateIndex
CREATE INDEX "weapons_rarity_idx" ON "weapons"("rarity");

-- CreateIndex
CREATE INDEX "weapons_weaponType_idx" ON "weapons"("weaponType");

-- CreateIndex
CREATE INDEX "character_goal_templates_characterId_idx" ON "character_goal_templates"("characterId");

-- CreateIndex
CREATE INDEX "character_goal_templates_category_idx" ON "character_goal_templates"("category");

-- CreateIndex
CREATE INDEX "character_goal_template_materials_materialId_idx" ON "character_goal_template_materials"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "character_goal_template_materials_templateId_materialId_key" ON "character_goal_template_materials"("templateId", "materialId");

-- CreateIndex
CREATE INDEX "weapon_goal_templates_weaponId_idx" ON "weapon_goal_templates"("weaponId");

-- CreateIndex
CREATE INDEX "weapon_goal_templates_category_idx" ON "weapon_goal_templates"("category");

-- CreateIndex
CREATE INDEX "weapon_goal_template_materials_materialId_idx" ON "weapon_goal_template_materials"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "weapon_goal_template_materials_templateId_materialId_key" ON "weapon_goal_template_materials"("templateId", "materialId");

-- CreateIndex
CREATE INDEX "goals_templateType_templateId_idx" ON "goals"("templateType", "templateId");

-- AddForeignKey
ALTER TABLE "character_goal_templates" ADD CONSTRAINT "character_goal_templates_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_goal_template_materials" ADD CONSTRAINT "character_goal_template_materials_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "character_goal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_goal_template_materials" ADD CONSTRAINT "character_goal_template_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapon_goal_templates" ADD CONSTRAINT "weapon_goal_templates_weaponId_fkey" FOREIGN KEY ("weaponId") REFERENCES "weapons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapon_goal_template_materials" ADD CONSTRAINT "weapon_goal_template_materials_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "weapon_goal_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weapon_goal_template_materials" ADD CONSTRAINT "weapon_goal_template_materials_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
