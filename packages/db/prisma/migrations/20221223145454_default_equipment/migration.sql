-- CreateEnum
CREATE TYPE "EqiupmentType" AS ENUM ('fan', 'dehumidifier', 'airScrubber');

-- AlterTable
ALTER TABLE "RoomReading" ADD COLUMN     "equipmentUsed" "EqiupmentType"[] DEFAULT ARRAY[]::"EqiupmentType"[];
