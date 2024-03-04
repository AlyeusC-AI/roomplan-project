import { prisma } from "../../";

import { addDays, addHours, isBefore } from "date-fns";

const getProjectIdFromAccessLink = async (accessId: string) => {
  const accessLink = await prisma.photoAccessLink.findFirst({
    where: {
      accessId,
    },
  });

  console.log(accessLink);

  if (!accessLink) return null;

  if (accessLink?.expiresAt) {
    if (isBefore(accessLink.expiresAt, Date.now())) {
      return null;
    }
  }
  return accessLink.projectId;
};

export default getProjectIdFromAccessLink;
