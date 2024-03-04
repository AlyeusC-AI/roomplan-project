import { router } from "../../trpc";

import getAll from "./getAll";

export const inferenceRouter = router({
  getAll,
});
