import { prisma } from "@restorationx/db";
import { TRPCError } from "@trpc/server";

const requireEquipment = async (
  organizationId: number,
  equipmentPublicId: string
) => {
  const equipment = await prisma.equipment.findFirst({
    where: {
      organizationId: organizationId,
      publicId: equipmentPublicId,
    },
  });
  if (!equipment) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "An unexpected error occurred, please try again later.",
      // optional: pass the original error to retain stack trace
      cause: "No equipment",
    });
  }
  return equipment;
};

export default requireEquipment;
