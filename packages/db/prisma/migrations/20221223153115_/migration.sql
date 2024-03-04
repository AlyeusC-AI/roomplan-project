/*
  Warnings:

  - The `equipmentUsed` column on the `RoomReading` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "RoomReading" DROP COLUMN "equipmentUsed",
ADD COLUMN     "equipmentUsed" TEXT[] DEFAULT ARRAY[]::TEXT[];
