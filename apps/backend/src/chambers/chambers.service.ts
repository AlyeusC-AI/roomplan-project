import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChambersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    projectId: string;
    rooms?: { roomId: string; isEffected: boolean }[];
  }): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    return this.prisma.chamber.create({
      data: {
        name: data.name,
        projectId: data.projectId,
        roomChambers: data.rooms
          ? {
              create: data.rooms.map((room) => ({
                roomId: room.roomId,
                isEffected: room.isEffected,
              })),
            }
          : undefined,
      },
      include: {
        roomChambers: {
          include: {
            room: true,
          },
        },
      },
    });
  }

  async findAll(projectId: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>[]
  > {
    return this.prisma.chamber.findMany({
      where: { projectId },
      include: {
        roomChambers: {
          include: {
            room: true,
          },
        },
      },
    });
  }

  async findOne(id: string): Promise<Prisma.ChamberGetPayload<{
    include: { roomChambers: { include: { room: true } } };
  }> | null> {
    const chamber = await this.prisma.chamber.findUnique({
      where: { id },
      include: {
        roomChambers: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!chamber) {
      throw new NotFoundException(`Chamber with ID ${id} not found`);
    }

    return chamber;
  }

  async update(
    id: string,
    data: {
      name?: string;
      rooms?: { roomId: string; isEffected: boolean }[];
    },
  ): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    // Check if chamber exists
    await this.findOne(id);

    return this.prisma.chamber.update({
      where: { id },
      data: {
        name: data.name,
        roomChambers: data.rooms
          ? {
              deleteMany: {},
              create: data.rooms.map((room) => ({
                roomId: room.roomId,
                isEffected: room.isEffected,
              })),
            }
          : undefined,
      },
      include: {
        roomChambers: {
          include: {
            room: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    // Check if chamber exists
    await this.findOne(id);

    return this.prisma.chamber.delete({
      where: { id },
      include: {
        roomChambers: {
          include: {
            room: true,
          },
        },
      },
    });
  }
}
