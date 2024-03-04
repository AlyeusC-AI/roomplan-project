-- AlterTable
ALTER TABLE "GenericRoomReading" ADD COLUMN     "humidity" TEXT,
ADD COLUMN     "temperature" TEXT;

-- AlterTable
ALTER TABLE "RoomReading" ADD COLUMN     "moistureContentWall" TEXT,
ADD COLUMN     "mostureContentFloor" TEXT;
