-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('notification', 'activity');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "publicId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isSeen" BOOLEAN NOT NULL,
    "link" TEXT,
    "linkText" TEXT,
    "type" "NotificationType" NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_publicId_key" ON "Notification"("publicId");
