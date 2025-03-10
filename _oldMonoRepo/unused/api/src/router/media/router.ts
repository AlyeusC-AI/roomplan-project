import { router } from "../../trpc";

import processMedia from "./processMedia";

export const mediaRouter = router({
  processMedia,
});
