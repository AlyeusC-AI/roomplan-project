import { prisma } from "../..";

const getProjectNotesForProject = async (projectId: number) => {
  return prisma.projectNotes.findMany({
    where: { projectId },
    select: {
      body: true,
      date: true,
      mentions: true,
      updatedAt: true,
      userId: true,
    },
    orderBy: {
      date: "asc",
    },
  });
};

export default getProjectNotesForProject;
