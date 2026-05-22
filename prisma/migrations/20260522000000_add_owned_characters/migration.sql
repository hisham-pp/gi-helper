-- CreateTable
CREATE TABLE "owned_characters" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owned_characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "owned_characters_characterId_idx" ON "owned_characters"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "owned_characters_userId_characterId_key" ON "owned_characters"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "owned_characters" ADD CONSTRAINT "owned_characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
