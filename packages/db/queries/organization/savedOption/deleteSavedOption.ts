import { prisma } from "../../../";

import getUser from "../../user/getUser";
import getIsAdmin from "../getIsAdmin";

const deleteSavedOption = async (userId: string, publicId: string) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return false;

  await prisma.organizationSavedOption.update({
    where: {
      publicId,
    },
    data: {
      isDeleted: true,
    },
  });

  return true;
};

export default deleteSavedOption;
