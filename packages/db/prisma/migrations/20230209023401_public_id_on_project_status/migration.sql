/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ProjectStatusValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `ProjectStatusValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectStatusValue" ADD COLUMN     "publicId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStatusValue_publicId_key" ON "ProjectStatusValue"("publicId");
