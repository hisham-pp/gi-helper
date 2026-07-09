-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai-responses',
    "baseUrl" TEXT,
    "apiKey" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-5-mini',
    "maxTokens" INTEGER NOT NULL DEFAULT 700,
    "temperature" DOUBLE PRECISION,
    "systemPrompt" TEXT,
    "contextTopics" TEXT,
    "includeTrackerContext" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ai_settings_userId_key" ON "ai_settings"("userId");

-- AddForeignKey
ALTER TABLE "ai_settings" ADD CONSTRAINT "ai_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
