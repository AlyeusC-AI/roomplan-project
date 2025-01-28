
import { prisma, SavedOptionType } from "../../../";
import { v4 } from "uuid";

import getUser from "../../user/getUser";
import getIsAdmin from "../getIsAdmin";

const createSavedOption = async (
  userId: string,
  type: SavedOptionType,
  label: string
): Promise<{ failed: boolean; reason?: string; result?: any  }> => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) return { failed: true, reason: "no-org" };

  const isAdmin = await getIsAdmin(organizationId, haloUser.id);
  if (!isAdmin) return { failed: true };

  const option = {
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  };

  const result = prisma.organizationSavedOption.create({
    data: {
      type,
      organizationId,
      label,
      value: option.value,
      publicId: v4(),
    },
    select: {
      label: true,
      value: true,
      publicId: true,
    },
  });

  return { failed: false, result };
};

export default createSavedOption;
