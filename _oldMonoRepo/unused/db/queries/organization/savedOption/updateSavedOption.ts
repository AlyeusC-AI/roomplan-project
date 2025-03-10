import { prisma } from "../../..";

import getUser from "../../user/getUser";
import getIsAdmin from "../getIsAdmin";

const updateSavedOption = async (
  userId: string,
  publicId: string,
  label: string,
  value: string
): Promise<{ failed: boolean; reason?: string }> => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return { failed: true };

  await prisma.organizationSavedOption.update({
    where: {
      publicId,
    },
    data: {
      label,
      value,
    },
  });

  return { failed: false };
};

export default updateSavedOption;
