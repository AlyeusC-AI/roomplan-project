import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Equipment, ImageType, Prisma } from '@prisma/client';

// Define types for filtering and sorting
export interface ImageFilters {
  showInReport?: boolean;
  hasComments?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  projectId?: string;
  roomIds?: string[];
  searchTerm?: string;
  ids?: string[];
  type: ImageType;
}

export interface ImageSortOptions {
  field: 'createdAt' | 'order' | 'url';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; projectId: string }): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    const room = await this.prisma.room.findFirst({
      where: {
        name: data.name,
        projectId: data.projectId,
      },
    });

    if (room) {
      throw new Error('Room already exists');
    }

    return this.prisma.room.create({
      data: {
        ...data,
        walls: {
          create: [
            {
              name: 'Wall',
              type: 'WALL',
            },
            {
              name: 'Floor',
              type: 'FLOOR',
            },
          ],
        },
      },
      include: {
        images: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  async findAll(projectId: string): Promise<
    Prisma.RoomGetPayload<{
      include: {
        walls: true;
        images: { include: { comments: true } };
      };
    }>[]
  > {
    return this.prisma.room.findMany({
      where: { projectId },
      include: {
        equipmentsUsed: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            equipment: {
              select: {
                name: true,
              },
            },
          },
        },
        walls: true,
        images: {
          orderBy: {
            order: 'asc',
          },
          include: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Prisma.RoomGetPayload<{
    include: {
      images: { include: { comments: true } };
      equipmentsUsed: true;
      walls: true;
    };
  }> | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        equipmentsUsed: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            equipment: {
              select: {
                name: true,
              },
            },
          },
        },
        walls: true,
        images: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      equipmentUsed?: { id: string; quantity: number }[];
      length?: number;
      width?: number;
      height?: number;
      totalSqft?: number;
      windows?: number;
      doors?: number;
      humidity?: number;
      dehuReading?: number;
      temperature?: number;
      roomPlanSVG?: string;
      scannedFileKey?: string;
      cubiTicketId?: string;
      cubiModelId?: string;
      cubiRoomPlan?: string;
    },
  ): Promise<
    Prisma.RoomGetPayload<{
      include: {
        images: { include: { comments: true } };
        equipmentsUsed: true;
      };
    }>
  > {
    const room = await this.prisma.room.findUniqueOrThrow({
      where: { id },
      select: {
        projectId: true,
      },
    });

    // Calculate totalSqft if length and width are provided
    let totalSqft = data.totalSqft;
    if (data.length && data.width) {
      totalSqft = data.length * data.width;
    }
    console.log('🚀 ~ RoomsService ~ data.equipmentUsed:', data.equipmentUsed);

    return this.prisma.room.update({
      where: { id },
      data: {
        name: data.name,
        length: data.length,
        width: data.width,
        height: data.height,
        totalSqft,
        windows: data.windows,
        doors: data.doors,
        humidity: data.humidity,
        dehuReading: data.dehuReading,
        temperature: data.temperature,
        roomPlanSVG: data.roomPlanSVG,
        scannedFileKey: data.scannedFileKey,
        cubiTicketId: data.cubiTicketId,
        cubiModelId: data.cubiModelId,
        cubiRoomPlan: data.cubiRoomPlan,
        equipmentsUsed: data.equipmentUsed
          ? {
              deleteMany: {},
              create: data.equipmentUsed.map((e) => ({
                equipment: {
                  connect: {
                    id: e.id,
                  },
                },
                project: {
                  connect: {
                    id: room.projectId,
                  },
                },
                quantity: e.quantity,
              })),
            }
          : undefined,
      },
      include: {
        equipmentsUsed: true,
        images: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    return this.prisma.room.delete({
      where: { id },
      include: {
        notes: true,
        images: {
          include: {
            comments: true,
          },
        },
      },
    });
  }

  // Add image to room
  async addImage(data: {
    url: string;
    showInReport?: boolean;
    order?: number;
    projectId: string;
    roomId?: string;
    noteId?: string;
    name?: string;
    description?: string;
    type?: ImageType;
  }): Promise<
    Prisma.ImageGetPayload<{
      include: { comments: true };
    }>
  > {
    let roomId = data.roomId;
    if (!roomId) {
      const room = await this.prisma.room.findFirst({
        where: {
          name: 'Untitled Room',
          projectId: data.projectId,
        },
      });
      if (!room) {
        const newRoom = await this.prisma.room.create({
          data: {
            name: 'Untitled Room',
            projectId: data.projectId,
          },
        });
        roomId = newRoom.id;
      } else {
        roomId = room.id;
      }
    }

    // If noteId is provided, verify it exists and belongs to the same project
    if (data.noteId) {
      const note = await this.prisma.note.findUnique({
        where: { id: data.noteId },
        include: {
          room: {
            include: {
              project: true,
            },
          },
        },
      });

      if (!note) {
        throw new NotFoundException('Note not found');
      }

      if (note.room.projectId !== data.projectId) {
        throw new BadRequestException(
          'Note does not belong to the same project',
        );
      }
    }

    // Create the image
    const image = await this.prisma.image.create({
      data: {
        ...data,
        url: data.url,
        showInReport: data.showInReport ?? false,
        order: data.order ?? 0,
        projectId: data.projectId,
        roomId: roomId,
        noteId: data.noteId,
        type: data.type ?? (data.noteId ? 'NOTE' : 'ROOM'),
        name: data.name,
        description: data.description,
      },
      include: {
        comments: true,
      },
    });

    return image;
  }

  // Remove image from room and disconnect from any notes
  async removeImage(imageId: string): Promise<
    Prisma.ImageGetPayload<{
      include: { comments: true };
    }>
  > {
    // Then delete the image
    return this.prisma.image.delete({
      where: { id: imageId },
      include: {
        comments: true,
      },
    });
  }

  // Add comment to image
  async addComment(
    imageId: string,
    data: { content: string; userId: string },
  ): Promise<Prisma.CommentGetPayload<{}>> {
    return this.prisma.comment.create({
      data: {
        ...data,
        imageId,
      },
    });
  }

  // Remove comment
  async removeComment(
    commentId: string,
  ): Promise<Prisma.CommentGetPayload<{}>> {
    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // Get all report images for a room
  async getReportImages(roomId: string): Promise<
    Prisma.ImageGetPayload<{
      include: { comments: true };
    }>[]
  > {
    return this.prisma.image.findMany({
      where: {
        roomId,
        showInReport: true,
      },
      include: {
        comments: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // Update multiple images' showInReport status
  async updateImagesInReport(
    imageIds: string[],
    showInReport: boolean,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.image.updateMany({
      where: {
        id: {
          in: imageIds,
        },
      },
      data: {
        showInReport,
      },
    });
  }

  // Update images order in bulk
  async updateImagesOrder(
    updates: { id: string; order: number }[],
  ): Promise<Prisma.BatchPayload> {
    // Using transaction to ensure all updates succeed or none do
    return this.prisma
      .$transaction(
        updates.map(({ id, order }) =>
          this.prisma.image.update({
            where: { id },
            data: { order },
          }),
        ),
      )
      .then(() => ({ count: updates.length }));
  }

  // Get all images for a room
  async getAllRoomImages(roomId: string): Promise<
    Prisma.ImageGetPayload<{
      include: { comments: true };
    }>[]
  > {
    return this.prisma.image.findMany({
      where: {
        roomId,
      },
      include: {
        comments: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  // Toggle all images in a room for report
  async toggleAllRoomImagesInReport(
    roomId: string,
    showInReport: boolean,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.image.updateMany({
      where: {
        roomId,
      },
      data: {
        showInReport,
      },
    });
  }

  // Advanced image search with filters, sorting, and pagination
  async findImages(
    filters: ImageFilters,
    sort: ImageSortOptions = { field: 'createdAt', direction: 'desc' },
    pagination: PaginationOptions = { page: 1, limit: 20 },
  ): Promise<{
    data: Prisma.ImageGetPayload<{ include: { comments: true; room: true } }>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where: Prisma.ImageWhereInput = {
      AND: [
        // Basic filters
        filters.showInReport !== undefined
          ? { showInReport: filters.showInReport }
          : {},
        filters.projectId ? { projectId: filters.projectId } : {},
        filters.roomIds?.length ? { roomId: { in: filters.roomIds } } : {},
        filters.ids?.length ? { id: { in: filters.ids } } : {},
        // Date range filters
        filters.createdAfter || filters.createdBefore
          ? {
              createdAt: {
                ...(filters.createdAfter ? { gte: filters.createdAfter } : {}),
                ...(filters.createdBefore
                  ? { lte: filters.createdBefore }
                  : {}),
              },
            }
          : {},
        filters.type ? { type: filters.type } : {},

        // Has comments filter
        filters.hasComments
          ? {
              comments: {
                some: {},
              },
            }
          : {},

        // Search term filter (searches in URL)
        filters.searchTerm
          ? {
              url: {
                contains: filters.searchTerm,
                mode: 'insensitive',
              },
            }
          : {},
      ],
    };

    // Calculate pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.image.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get paginated data with sorting
    const data = await this.prisma.image.findMany({
      where,
      include: {
        comments: true,
        room: true,
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  // Get image statistics for a project
  async getImageStats(projectId: string): Promise<{
    totalImages: number;
    imagesInReport: number;
    imagesWithComments: number;
    imagesByRoom: { roomId: string; roomName: string; count: number }[];
  }> {
    const [totalImages, imagesInReport, imagesWithComments, imagesByRoom] =
      await Promise.all([
        // Total images count
        this.prisma.image.count({
          where: { projectId },
        }),
        // Images in report count
        this.prisma.image.count({
          where: { projectId, showInReport: true },
        }),
        // Images with comments count
        this.prisma.image.count({
          where: {
            projectId,
            comments: { some: {} },
          },
        }),
        // Images count by room
        this.prisma.room.findMany({
          where: { projectId },
          select: {
            id: true,
            name: true,
            _count: {
              select: { images: true },
            },
          },
        }),
      ]);

    return {
      totalImages,
      imagesInReport,
      imagesWithComments,
      imagesByRoom: imagesByRoom.map((room) => ({
        roomId: room.id,
        roomName: room.name,
        count: room._count.images,
      })),
    };
  }

  // Bulk operations with filtering
  async bulkUpdateImages(
    filter: ImageFilters,
    updates: { showInReport?: boolean; order?: number; roomId?: string },
  ): Promise<Prisma.BatchPayload> {
    const where: Prisma.ImageWhereInput = {
      AND: [
        // Reuse the same filter logic from findImages
        filter.showInReport !== undefined
          ? { showInReport: filter.showInReport }
          : {},
        filter.projectId ? { projectId: filter.projectId } : {},
        filter.roomIds?.length ? { roomId: { in: filter.roomIds } } : {},
        filter.ids?.length ? { id: { in: filter.ids } } : {},
        filter.createdAfter || filter.createdBefore
          ? {
              createdAt: {
                ...(filter.createdAfter ? { gte: filter.createdAfter } : {}),
                ...(filter.createdBefore ? { lte: filter.createdBefore } : {}),
              },
            }
          : {},
        filter.hasComments
          ? {
              comments: {
                some: {},
              },
            }
          : {},
      ],
    };

    return this.prisma.image.updateMany({
      where,
      data: updates,
    });
  }

  // Bulk remove images with filtering
  async bulkRemoveImages(filter: ImageFilters): Promise<Prisma.BatchPayload> {
    const where: Prisma.ImageWhereInput = {
      AND: [
        // Reuse the same filter logic from findImages
        filter.showInReport !== undefined
          ? { showInReport: filter.showInReport }
          : {},
        filter.projectId ? { projectId: filter.projectId } : {},
        filter.roomIds?.length ? { roomId: { in: filter.roomIds } } : {},
        filter.createdAfter || filter.createdBefore
          ? {
              createdAt: {
                ...(filter.createdAfter ? { gte: filter.createdAfter } : {}),
                ...(filter.createdBefore ? { lte: filter.createdBefore } : {}),
              },
            }
          : {},
        filter.hasComments
          ? {
              comments: {
                some: {},
              },
            }
          : {},
        filter.ids?.length ? { id: { in: filter.ids } } : {},
      ],
    };

    return this.prisma.image.deleteMany({
      where,
    });
  }

  // Get comments for an image
  async getComments(imageId: string): Promise<Prisma.CommentGetPayload<{}>[]> {
    return this.prisma.comment.findMany({
      where: { imageId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Area Affected methods
  async updateAreaAffected(
    roomId: string,
    type: 'floor' | 'walls' | 'ceiling',
    data: {
      material?: string;
      totalAreaRemoved?: string;
      totalAreaMicrobialApplied?: string;
      cabinetryRemoved?: string;
      isVisible?: boolean;
      extraFields?: any;
    },
  ): Promise<
    Prisma.RoomGetPayload<{
      include: {
        floorAffected: true;
        wallsAffected: true;
        ceilingAffected: true;
      };
    }>
  > {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        floorAffected: true,
        wallsAffected: true,
        ceilingAffected: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const fieldMap = {
      floor: 'floorAffected',
      walls: 'wallsAffected',
      ceiling: 'ceilingAffected',
    };

    const idFieldMap = {
      floor: 'floorRoomId',
      walls: 'wallsRoomId',
      ceiling: 'ceilingRoomId',
    };

    const affectedField = fieldMap[type];
    const idField = idFieldMap[type];

    if (room[affectedField]) {
      // Update existing area affected
      await this.prisma.areaAffected.update({
        where: { id: room[affectedField].id },
        data,
      });
    } else {
      // Create new area affected and connect to room
      const areaAffected = await this.prisma.areaAffected.create({
        data,
      });

      await this.prisma.room.update({
        where: { id: roomId },
        data: {
          [idField]: areaAffected.id,
        },
      });
    }

    return this.prisma.room.findUniqueOrThrow({
      where: { id: roomId },
      include: {
        floorAffected: true,
        wallsAffected: true,
        ceilingAffected: true,
      },
    });
  }

  async deleteAreaAffected(
    roomId: string,
    type: 'floor' | 'walls' | 'ceiling',
  ): Promise<
    Prisma.RoomGetPayload<{
      include: {
        floorAffected: true;
        wallsAffected: true;
        ceilingAffected: true;
      };
    }>
  > {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        floorAffected: true,
        wallsAffected: true,
        ceilingAffected: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const fieldMap = {
      floor: 'floorAffected',
      walls: 'wallsAffected',
      ceiling: 'ceilingAffected',
    };

    const idFieldMap = {
      floor: 'floorRoomId',
      walls: 'wallsRoomId',
      ceiling: 'ceilingRoomId',
    };

    const affectedField = fieldMap[type];
    const idField = idFieldMap[type];

    if (room[affectedField]) {
      // Delete the area affected record
      await this.prisma.areaAffected.delete({
        where: { id: room[affectedField].id },
      });

      // Update room to remove the reference
      await this.prisma.room.update({
        where: { id: roomId },
        data: {
          [idField]: null,
        },
      });
    }

    return this.prisma.room.findUniqueOrThrow({
      where: { id: roomId },
      include: {
        floorAffected: true,
        wallsAffected: true,
        ceilingAffected: true,
      },
    });
  }

  async getAreaAffected(roomId: string): Promise<
    Prisma.RoomGetPayload<{
      include: {
        floorAffected: true;
        wallsAffected: true;
        ceilingAffected: true;
      };
    }>
  > {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        floorAffected: true,
        wallsAffected: true,
        ceilingAffected: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }
}
