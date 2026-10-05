-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('READY', 'SENT', 'PUBLISHING', 'PUBLISHED', 'SKIPPED', 'FAILED');

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "forDate" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "captionBn" TEXT NOT NULL,
    "hashtags" TEXT[],
    "imagePrompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'READY',
    "fbPostId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_title_key" ON "Topic"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Post_forDate_key" ON "Post"("forDate");
