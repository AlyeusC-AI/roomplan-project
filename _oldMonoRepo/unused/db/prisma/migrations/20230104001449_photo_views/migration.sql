-- CreateEnum
CREATE TYPE "PhotoViews" AS ENUM ('photoListView', 'photoGridView');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "photoView" "PhotoViews" NOT NULL DEFAULT 'photoGridView';
