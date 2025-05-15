import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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
      data,
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
      include: { images: { include: { comments: true } } };
    }>[]
  > {
    return this.prisma.room.findMany({
      where: { projectId },
      include: {
        images: {
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
    include: { images: { include: { comments: true } } };
  }> | null> {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        images: {
          include: {
            comments: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: { name?: string },
  ): Promise<
    Prisma.RoomGetPayload<{
      include: { images: { include: { comments: true } } };
    }>
  > {
    return this.prisma.room.update({
      where: { id },
      data,
      include: {
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
    return this.prisma.image.create({
      data: {
        ...data,
        roomId,
      },
      include: {
        comments: true,
      },
    });
  }

  // Remove image from room
  async removeImage(imageId: string): Promise<
    Prisma.ImageGetPayload<{
      include: { comments: true };
    }>
  > {
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
