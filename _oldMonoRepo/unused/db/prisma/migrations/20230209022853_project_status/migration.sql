-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectStatusValueId" INTEGER;

-- CreateTable
CREATE TABLE "ProjectStatusValue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "ProjectStatusValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectStatusValueId_fkey" FOREIGN KEY ("projectStatusValueId") REFERENCES "ProjectStatusValue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStatusValue" ADD CONSTRAINT "ProjectStatusValue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
