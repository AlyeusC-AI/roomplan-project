-- CreateTable
CREATE TABLE "PendingRoofReports" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PendingRoofReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PendingRoofReports" ADD CONSTRAINT "PendingRoofReports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
