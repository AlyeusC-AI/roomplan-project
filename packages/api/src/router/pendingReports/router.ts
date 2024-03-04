import { router } from "../../trpc";

import getPendingReports from "./getPendingReports";

export const pendingReportsRouter = router({
  getPendingReports,
});
