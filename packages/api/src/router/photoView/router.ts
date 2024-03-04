import { router } from "../../trpc";

import getPhotoView from "./getPhotoView";
import setPhotoView from "./setPhotoView";

export const photoViewRouter = router({
  setPhotoView,
  getPhotoView,
});
