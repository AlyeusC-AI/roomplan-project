-- CreateTable
CREATE TABLE "WeatherReportItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "f_scale" TEXT,
    "speed" TEXT,
    "size" TEXT,
    "location" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "lon" TEXT NOT NULL,
    "comments" TEXT NOT NULL,

    CONSTRAINT "WeatherReportItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeatherReportItem" ADD CONSTRAINT "WeatherReportItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
