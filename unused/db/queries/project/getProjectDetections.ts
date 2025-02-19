import { prisma } from "../..";

import { AreaAffectedType, Notes, NotesAuditTrail } from "../..";
import superjson from "superjson";

import getFilteredInferenceList from "./getFilteredInferenceList";

export interface InferenceItemDetection {
  publicId: string;
  imageKey?: string | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  confidence?: number | null;
  code: string;
  item: string;
  quality: string;
  category: string;
  dimension: number;
  unit: string;
}

export interface InferenceMetaData {
  imageKey: string;
  publicId: string;
  createdAt: string;
  image?: {
    includeInReport: boolean;
  };
}

export interface RoomData {
  name: string;
  publicId: string;
  inferences: InferenceMetaData[];
  detections: InferenceItemDetection[];
}

export interface RoomAffectedArea {
  type: AreaAffectedType;
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cause?: string;
  category?: number;
  cabinetryRemoved?: string;
  isDeleted: boolean;
  publicId: string;
}
export interface RoomDataWithoutInferences {
  name: string;
  publicId: string;
  gpp?: string;
  temperature?: string;
  humidity?: string;
  dehuReading?: string;
  length?: string;
  width?: string;
  height?: string;
  totalSqft?: string;
  windows?: number;
  doors?: number;
  areasAffected: RoomAffectedArea[];
  equipmentUsed?: string[];
  notes?: (Notes & { notesAuditTrail: NotesAuditTrail[] })[];
}

export const getInferenceList = async (
  publicId: string,
  organizationId: number,
  rooms?: string[],
  onlySelected?: boolean,
  sortDirection?: "asc" | "desc"
) => {
  const inferences = await getFilteredInferenceList(
    publicId,
    organizationId,
    rooms,
    onlySelected,
    sortDirection
  );

  // @ts-ignore
  return superjson.serialize(inferences).json as typeof inferences;
};

export const getRoomList = async (publicId: string, organizationId: number) =>
  await prisma.project.findFirst({
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
          gpp: true,
          temperature: true,
          humidity: true,
          dehuReading: true,
          length: true,
          width: true,
          height: true,
          totalSqft: true,
          windows: true,
          doors: true,
          equipmentUsed: true,
          areasAffected: {
            select: {
              type: true,
              publicId: true,
              material: true,
              totalAreaRemoved: true,
              totalAreaMicrobialApplied: true,
              cause: true,
              category: true,
              cabinetryRemoved: true,
              isDeleted: true,
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
  });

export const getRoomListWithNotes = async (
  publicId: string,
  organizationId: number
) =>
  await prisma.project.findFirst({
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
          gpp: true,
          temperature: true,
          humidity: true,
          dehuReading: true,
          length: true,
          width: true,
          height: true,
          totalSqft: true,
          windows: true,
          doors: true,
          areasAffected: {
            select: {
              type: true,
              publicId: true,
              material: true,
              totalAreaRemoved: true,
              totalAreaMicrobialApplied: true,
              cause: true,
              category: true,
              cabinetryRemoved: true,
              isDeleted: true,
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
                take: 1,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
const getProjectDetections = async (publicId: string, organizationId: number) =>
  await prisma.project.findFirst({
    where: { publicId, organizationId },
    select: {
      images: {
        where: {
          inference: {
            isNot: undefined,
          },
        },
        select: {
          key: true,
          inference: {
            select: {
              publicId: true,
              imageKey: true,
              room: true,
              detections: {
                select: {
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
                },
              },
            },
          },
        },
      },
    },
  });

export default getProjectDetections;
