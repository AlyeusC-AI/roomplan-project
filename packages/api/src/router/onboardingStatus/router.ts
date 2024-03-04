import { router } from "../../trpc";

import getOnboardingStatus from "./getOnboardingStatus";
import setOnboardingStatus from "./setOnboardingStatus";

export const onboardingStatusRouter = router({
  getOnboardingStatus,
  setOnboardingStatus,
});
