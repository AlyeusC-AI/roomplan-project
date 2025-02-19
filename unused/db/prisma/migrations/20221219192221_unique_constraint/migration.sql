/*
  Warnings:

  - A unique constraint covering the columns `[equipmentId,projectId]` on the table `ProjectEquipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectEquipment_equipmentId_projectId_key" ON "ProjectEquipment"("equipmentId", "projectId");
