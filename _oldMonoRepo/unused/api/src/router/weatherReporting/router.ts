import { router } from "../../trpc";

import addWeatherItemToReport from "./addWeatherItemToReport";
import deleteWeatherReportItemFromReport from "./deleteWeatherItemFromReport";
import getAll from "./getAll";

export const weatherReportingRouter = router({
  addWeatherItemToReport,
  getAll,
  deleteWeatherReportItemFromReport,
});
