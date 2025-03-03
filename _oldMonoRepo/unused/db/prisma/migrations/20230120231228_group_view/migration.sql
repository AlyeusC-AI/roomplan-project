-- CreateEnum
CREATE TYPE "GroupByViews" AS ENUM ('roomView', 'dateView');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groupView" "GroupByViews" NOT NULL DEFAULT 'dateView';
