-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ProjectNotes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "publicId" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectNotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectNotes" ADD CONSTRAINT "ProjectNotes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
