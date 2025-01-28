import { prisma } from "../../";

import { AccessLinkExpiration } from "../../types/access-link";
import { addDays, addHours } from "date-fns";
const crypto = require("crypto");
const expirationMap = {
  [AccessLinkExpiration.ONE_HOUR]: () => addHours(Date.now(), 1),
  [AccessLinkExpiration.ONE_DAY]: () => addDays(Date.now(), 1),
  [AccessLinkExpiration.SEVEN_DAYS]: () => addDays(Date.now(), 7),
  [AccessLinkExpiration.FOURTEEN_DAYS]: () => addDays(Date.now(), 14),
  [AccessLinkExpiration.THIRTY_DAYS]: () => addDays(Date.now(), 30),
};

const createPhotoAccessLink = async (
  userId: string,
  {
    projectPublicId,
    email,
    phoneNumber,
    expiresAt,
  }: {
    projectPublicId: string;
    email?: string;
    phoneNumber?: string;
    expiresAt: AccessLinkExpiration;
  }
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      org: {
        select: {
          organization: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });
  const project = await prisma.project.findFirst({
    where: {
      publicId: projectPublicId,
      organizationId: user?.org?.organization.id,
    },
  });

  if (!project) return null;

  const accessId = crypto.randomBytes(64).toString("hex");

  let expiresAtDate;
  if (expiresAt && expiresAt !== AccessLinkExpiration.NEVER) {
    const dateFn = expirationMap[expiresAt];
    expiresAtDate = dateFn();
  }

  return await prisma.photoAccessLink.create({
    data: {
      projectId: project.id,
      expiresAt: expiresAtDate,
      accessId,
      phoneNumber,
      email,
    },
  });
};

export default createPhotoAccessLink;
