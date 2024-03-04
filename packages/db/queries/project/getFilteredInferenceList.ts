import { prisma } from "../../";

const getFilteredInferenceList = async (
  publicId: string,
  organizationId: number,
  rooms?: string[],
  onlySelected?: boolean,
  sortDirection?: "asc" | "desc"
) =>
  prisma.project.findFirst({
    where: {
      publicId,
      organizationId,
    },
    select: {
      rooms: {
        select: {
          name: true,
          publicId: true,
          isDeleted: true,
          inferences: {
            where: {
              isDeleted: false,
              ...(onlySelected
                ? {
                    image: {
                      includeInReport: onlySelected,
                    },
                  }
                : {}),
            },
            select: {
              isDeleted: true,
              imageKey: true,
              publicId: true,
              createdAt: true,
              image: {
                select: {
                  includeInReport: true,
                },
              },
            },
            orderBy: {
              createdAt: sortDirection,
            },
          },
          detections: {
            where: {
              isDeleted: false,
            },
            select: {
              isDeleted: true,
              publicId: true,
              category: true,
              code: true,
              item: true,
              quality: true,
              imageKey: true,
              xMinCord: true,
              yMinCord: true,
              xMaxCord: true,
              yMaxCord: true,
              confidence: true,
              dimension: true,
              unit: true,
            },
            orderBy: {
              category: "asc",
            },
          },
          notes: {
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
              },
            },
            where: {
              isDeleted: false,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        where: {
          isDeleted: false,
          ...(rooms
            ? {
                name: {
                  in: rooms,
                },
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

export default getFilteredInferenceList;
