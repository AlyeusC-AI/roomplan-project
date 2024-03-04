/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `ProjectStatusValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectStatusValue_label_key" ON "ProjectStatusValue"("label");
