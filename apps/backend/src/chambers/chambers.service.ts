import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateChamberDto, UpdateChamberDto } from './dto';

@Injectable()
export class ChambersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateChamberDto): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    console.log('🚀 ~ ChambersService ~ data:', data);

    // Validate that the project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new BadRequestException(
        `Project with ID ${data.projectId} not found`,
      );
    }

    // Validate that all roomIds exist and belong to the project
    if (data.rooms && data.rooms.length > 0) {
      const roomIds = data.rooms.map((room) => room.roomId);
      const existingRooms = await this.prisma.room.findMany({
        where: {
          id: { in: roomIds },
          projectId: data.projectId,
        },
      });

      if (existingRooms.length !== roomIds.length) {
        const existingRoomIds = existingRooms.map((room) => room.id);
        const missingRoomIds = roomIds.filter(
          (id) => !existingRoomIds.includes(id),
        );
        throw new BadRequestException(
          `The following room IDs do not exist or do not belong to the project: ${missingRoomIds.join(', ')}`,
        );
      }
    }

    return this.prisma.chamber.create({
      data: {
        name: data.name,
        projectId: data.projectId,
        roomChambers: data.rooms
          ? {
              createMany: {
                data: data.rooms.map((room) => ({
                  roomId: room.roomId,
                  isEffected: room.isEffected,
                })),
              },
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

  async findOne(id: string): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
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
    data: UpdateChamberDto,
  ): Promise<
    Prisma.ChamberGetPayload<{
      include: { roomChambers: { include: { room: true } } };
    }>
  > {
    // Check if chamber exists
    const existingChamber = await this.findOne(id);

    // Validate that all roomIds exist and belong to the project
    if (data.rooms && data.rooms.length > 0) {
      const roomIds = data.rooms.map((room) => room.roomId);
      const existingRooms = await this.prisma.room.findMany({
        where: {
          id: { in: roomIds },
          projectId: existingChamber.projectId,
        },
      });

      if (existingRooms.length !== roomIds.length) {
        const existingRoomIds = existingRooms.map((room) => room.id);
        const missingRoomIds = roomIds.filter(
          (id) => !existingRoomIds.includes(id),
        );
        throw new BadRequestException(
          `The following room IDs do not exist or do not belong to the project: ${missingRoomIds.join(', ')}`,
        );
      }
    }

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
