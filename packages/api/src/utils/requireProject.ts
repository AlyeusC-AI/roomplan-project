import { prisma } from "@restorationx/db";
import { TRPCError } from "@trpc/server";

const requireProject = async (
  publicId: string,
  organizationId: number | undefined
) => {
  const project = await prisma.project.findFirst({
    where: {
      publicId,
      organizationId,
    },
  });
  if (!project) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "An unexpected error occurred, please try again later.",
      // optional: pass the original error to retain stack trace
      cause: "No project",
    });
  }
  return project;
};

export default requireProject;
