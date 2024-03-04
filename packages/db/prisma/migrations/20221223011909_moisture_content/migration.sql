/*
  Warnings:

  - You are about to drop the column `mostureContentFloor` on the `RoomReading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RoomReading" DROP COLUMN "mostureContentFloor",
ADD COLUMN     "moistureContentFloor" TEXT;
