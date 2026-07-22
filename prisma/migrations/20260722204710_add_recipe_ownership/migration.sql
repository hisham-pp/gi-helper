-- Add owned field to CookingProgress
ALTER TABLE "cooking_progress" ADD COLUMN "owned" BOOLEAN NOT NULL DEFAULT false;

-- Update owned to true for recipes that have been cooked at least once
UPDATE "cooking_progress" SET "owned" = true WHERE "completedCount" >= 1;
