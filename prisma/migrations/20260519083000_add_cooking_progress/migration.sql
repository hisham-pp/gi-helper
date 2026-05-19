CREATE TABLE "cooking_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooking_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cooking_progress_userId_recipeId_key" ON "cooking_progress"("userId", "recipeId");
CREATE INDEX "cooking_progress_recipeId_idx" ON "cooking_progress"("recipeId");

ALTER TABLE "cooking_progress" ADD CONSTRAINT "cooking_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
