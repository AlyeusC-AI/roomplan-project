import { router } from "../../trpc";

import getSignedUrl from "./getSignedUrl";

export const fileRouter = router({
  getSignedUrl,
});
