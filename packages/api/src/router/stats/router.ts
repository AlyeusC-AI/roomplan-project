import { router } from "../../trpc";

import getProjectStatusOverTime from "./getProjectStatusOverTime";

export const statsRouter = router({
  getProjectStatusOverTime,
});
