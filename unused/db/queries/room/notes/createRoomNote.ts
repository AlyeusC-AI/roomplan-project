import { prisma, NotesAuditAction } from "../../..";

import { v4 as uuidv4 } from "uuid";
import getUser from "../../user/getUser";
import getProjectForOrg from "../../project/getProjectForOrg";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const createRoomNote = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  body?: string
) => {
  const servicegeekUser = await getUser(userId);
  const organizationId = servicegeekUser?.org?.organization.id;
  if (!organizationId) {
    console.error("No org");
    return null;
  }

  const project = await getProjectForOrg(projectPublicId, organizationId);
  if (!project) {
    console.error("No project");
    return null;
  }

  const room = await prisma.room.findFirst({
    where: {
      projectId: project.id,
      publicId: roomId,
      isDeleted: false,
    },
  });

  if (!room) {
    console.error("No room");
    return null;
  }

  return prisma.notes.create({
    data: {
      body: body || "",
      roomId: room.id,
      publicId: uuidv4(),
      projectId: project.id,
      notesAuditTrail: {
        create: {
          action: NotesAuditAction.deleted,
          body: "",
          userId,
          userName: `${servicegeekUser.firstName} ${servicegeekUser.lastName}`,
        },
      },
    },
    select: {
      publicId: true,
      body: true,
      date: true,
      updatedAt: true,
      notesAuditTrail: {
        select: {
          userName: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
};

export default createRoomNote;
