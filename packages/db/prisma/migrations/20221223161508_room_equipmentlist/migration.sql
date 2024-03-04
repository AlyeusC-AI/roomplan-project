-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "equipmentUsed" TEXT[] DEFAULT ARRAY[]::TEXT[];
