import { prisma } from "@restorationx/db";
import { TRPCError } from "@trpc/server";

const requireProjectEquipment = async (
  projectId: number,
  usedItemPublicId: string
) => {
  const equipment = await prisma.projectEquipment.findFirst({
    where: {
      publicId: usedItemPublicId,
      projectId: projectId,
    },
  });
  if (!equipment) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "An unexpected error occurred, please try again later.",
      // optional: pass the original error to retain stack trace
      cause: "No used equipment",
    });
  }
  return equipment;
};

export default requireProjectEquipment;
