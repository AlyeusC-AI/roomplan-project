import { prisma } from "../../..";

import { NotesAuditAction } from "../../..";
import getProjectForOrg from "../../project/getProjectForOrg";
import getUser from "../../user/getUser";

export type ReadingData = {
  temperature?: string;
  humidity?: string;
};

const updateRoomNote = async (
  userId: string,
  projectPublicId: string,
  roomId: string,
  noteId: string,
  body: string
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

  const note = await prisma.notes.findFirst({
    where: {
      roomId: room.id,
      isDeleted: false,
      publicId: noteId,
    },
  });

  if (!note) {
    console.error("No reading");
    return null;
  }

  const updatedNote = await prisma.notes.update({
    where: {
      id: note.id,
    },
    data: {
      body: body,
      notesAuditTrail: {
        create: {
          action: NotesAuditAction.updated,
          body,
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

  return updatedNote;
};

export default updateRoomNote;
