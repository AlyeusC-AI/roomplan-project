/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,label]` on the table `ProjectStatusValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectStatusValue_organizationId_label_key" ON "ProjectStatusValue"("organizationId", "label");
