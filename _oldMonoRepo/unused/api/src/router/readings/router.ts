import { router } from "../../trpc";

import addGenericReading from "./addGenericReading";
import addReading from "./addReading";
import deleteGenericReading from "./deleteGenericReading";
import deleteReading from "./deleteReading";
import getAll from "./getAll";
import updateGenericReading from "./updateGenericReading";
import updateReading from "./updateReading";

export const readingsRouter = router({
  getAll,
  updateReading,
  addReading,
  deleteReading,
  addGenericReading,
  deleteGenericReading,
  updateGenericReading,
});
