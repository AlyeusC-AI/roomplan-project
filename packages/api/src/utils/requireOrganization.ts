import { TRPCError } from "@trpc/server";

import requireUser from "./requireUser";

const requireOrganization = (user: Awaited<ReturnType<typeof requireUser>>) => {
  if (!user.org?.organizationId) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "An unexpected error occurred, please try again later.",
      // optional: pass the original error to retain stack trace
      cause: "No project",
    });
  }
  return user.org?.organization;
};
export default requireOrganization;
