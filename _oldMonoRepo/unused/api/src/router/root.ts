import { router } from "../trpc";

import { equipmentRouter } from "./equipment/router";
import { fileRouter } from "./file/router";
import { groupViewRouter } from "./groupView/router";
import { inferenceRouter } from "./inferences/router";
import { mediaRouter } from "./media/router";
import { mobileRouter } from "./mobile/router";
import { notificationRouter } from "./notification/router";
import { onboardingStatusRouter } from "./onboardingStatus/router";
import { pendingReportsRouter } from "./pendingReports/router";
import { photoRouter } from "./photos/router";
import { photoViewRouter } from "./photoView/router";
import { projectsRouter } from "./projects/router";
import { projectStatusRouter } from "./projectStatus/router";
import { readingsRouter } from "./readings/router";
import { roomsRouter } from "./rooms/router";
import { statsRouter } from "./stats/router";
import { weatherReportingRouter } from "./weatherReporting/router";

export const appRouter = router({
  equipment: equipmentRouter,
  file: fileRouter,
  inferences: inferenceRouter,
  readings: readingsRouter,
  photoView: photoViewRouter,
  stats: statsRouter,
  projects: projectsRouter,
  notification: notificationRouter,
  onboardingStatus: onboardingStatusRouter,
  weatherReportItems: weatherReportingRouter,
  photos: photoRouter,
  groupView: groupViewRouter,
  media: mediaRouter,
  projectStatus: projectStatusRouter,
  rooms: roomsRouter,
  pendingReports: pendingReportsRouter,
  mobile: mobileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
