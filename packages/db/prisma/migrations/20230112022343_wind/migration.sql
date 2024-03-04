-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "wind" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photoView" SET DEFAULT 'photoListView';
