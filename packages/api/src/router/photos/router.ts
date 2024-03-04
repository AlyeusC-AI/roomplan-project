import { router } from "../../trpc";
import createImageNote from "./createImageNote";

import deleteProjectPhotos from "./deleteProjectPhotos";
import getProjectPhotos from "./getProjectPhotos";
import setIncludeInReport from "./includeInReport";
import setRoomForProjectPhotos from "./setRoomForProjectPhotos";

export const photoRouter = router({
  getProjectPhotos,
  setIncludeInReport,
  deleteProjectPhotos,
  setRoomForProjectPhotos,
  createImageNote,
});
