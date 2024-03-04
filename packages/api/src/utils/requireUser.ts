import { prisma } from "@restorationx/db";
import { TRPCError } from "@trpc/server";

const requireUser = async (userId: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      org: {
        include: {
          organization: true,
        },
      },
    },
  });
  if (!user) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "An unexpected error occurred, please try again later.",
      // optional: pass the original error to retain stack trace
      cause: "No organization",
    });
  }
  return user;
};

export default requireUser;
