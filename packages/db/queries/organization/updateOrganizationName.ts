import { AccessLevel, prisma } from "../../";

import getUser from "../user/getUser";

const updateOrganizationName = async (
  userId: string,
  orgName: string,
  orgAddress: string
) => {
  const haloUser = await getUser(userId);
  const organizationId = haloUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No org Id");
    return { failed: true, reason: "no-org" };
  }

  const isAllowed =
    haloUser.org?.isAdmin ||
    haloUser.org?.accessLevel === AccessLevel.admin ||
    haloUser.org?.accessLevel === AccessLevel.accountManager;

  if (!isAllowed) {
    console.error("Not allowed");
    return { failed: true, reason: "not-allowed" };
  }
  if (haloUser.org?.isDeleted) {
    console.error("org deleted");
    return { failed: true, reason: "no-org" };
  }
  if (!orgAddress && !orgName) {
    console.error("invalid data");
    return { failed: true, reason: "invalid data" };
  }
  await prisma.organization.update({
    where: {
      id: organizationId,
    },
    data: {
      ...(orgName ? { name: orgName } : {}),
      ...(orgAddress ? { address: orgAddress } : {}),
    },
  });
  return true;
};

export default updateOrganizationName;
