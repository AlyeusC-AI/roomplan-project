import { router } from "../../trpc";

import getGroupView from "./getGroupView";
import setGroupView from "./setGroupView";

export const groupViewRouter = router({
  getGroupView,
  setGroupView,
});
