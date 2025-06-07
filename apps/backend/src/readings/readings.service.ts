import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, WallType } from '@prisma/client';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // Room Reading methods
  async createRoomReading(data: {
    roomId: string;
    date: Date;
    humidity: number;
    temperature: number;
  }): Promise<
    Prisma.RoomReadingGetPayload<{
      include: { wallReadings: true; genericRoomReading: true };
    }>
  > {
    return this.prisma.roomReading.create({
      data: {
        ...data,

        genericRoomReading: {
          create: {
            humidity: 0,
            temperature: 0,
            value: '',
            images: [],
          },
        },
      },
      include: {
        wallReadings: true,
        genericRoomReading: true,
      },
    });
  }

  async getRoomReadings(roomId: string): Promise<
    Prisma.RoomReadingGetPayload<{
      include: { wallReadings: true; genericRoomReading: true };
    }>[]
  > {
    return this.prisma.roomReading.findMany({
      where: { roomId },
      include: {
        wallReadings: true,
        genericRoomReading: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async getRoomReading(id: string): Promise<Prisma.RoomReadingGetPayload<{
    include: { wallReadings: true; genericRoomReading: true };
  }> | null> {
    return this.prisma.roomReading.findUnique({
      where: { id },
      include: {
        wallReadings: true,
        genericRoomReading: true,
      },
    });
  }

  // Wall methods
  async createWall(data: {
    roomId: string;
    name: string;
    type: WallType;
  }): Promise<Prisma.WallGetPayload<{}>> {
    // Verify room exists
    const room = await this.prisma.room.findUnique({
      where: { id: data.roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.wall.create({
      data,
    });
  }

  async getWalls(roomId: string): Promise<Prisma.WallGetPayload<{}>[]> {
    return this.prisma.wall.findMany({
      where: { roomId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getWall(id: string): Promise<Prisma.WallGetPayload<{}> | null> {
    return this.prisma.wall.findUnique({
      where: { id },
    });
  }

  async updateWall(
    id: string,
    data: { name?: string; type?: WallType },
  ): Promise<Prisma.WallGetPayload<{}>> {
    return this.prisma.wall.update({
      where: { id },
      data,
    });
  }

  async deleteWall(id: string): Promise<Prisma.WallGetPayload<{}>> {
    return this.prisma.wall.delete({
      where: { id },
    });
  }

  // Wall Reading methods
  async createWallReading(data: {
    wallId: string;
    reading: number;
    images: string[];
    roomReadingId?: string;
  }): Promise<Prisma.WallReadingGetPayload<{}>> {
    // Verify wall exists
    const wall = await this.prisma.wall.findUnique({
      where: { id: data.wallId },
    });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    return this.prisma.wallReading.create({
      data,
    });
  }

  async getWallReadings(
    wallId: string,
  ): Promise<Prisma.WallReadingGetPayload<{}>[]> {
    return this.prisma.wallReading.findMany({
      where: { wallId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getWallReading(
    id: string,
  ): Promise<Prisma.WallReadingGetPayload<{}> | null> {
    return this.prisma.wallReading.findUnique({
      where: { id },
    });
  }

  async updateWallReading(
    id: string,
    data: { reading?: number; images?: string[] },
  ): Promise<Prisma.WallReadingGetPayload<{}>> {
    return this.prisma.wallReading.update({
      where: { id },
      data,
    });
  }

  async deleteWallReading(
    id: string,
  ): Promise<Prisma.WallReadingGetPayload<{}>> {
    return this.prisma.wallReading.delete({
      where: { id },
    });
  }

  // Generic Room Reading methods
  async createGenericRoomReading(data: {
    roomReadingId: string;

    value: string;
    humidity: number;
    temperature: number;
    images: string[];
  }): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.prisma.genericRoomReading.create({
      data,
    });
  }

  async getGenericRoomReadings(
    roomReadingId: string,
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>[]> {
    return this.prisma.genericRoomReading.findMany({
      where: { roomReadingId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateGenericRoomReading(
    id: string,
    data: {
      value?: string;
      humidity?: number;
      temperature?: number;
      images?: string[];
    },
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.prisma.genericRoomReading.update({
      where: { id },
      data,
    });
  }

  async updateRoomReading(
    id: string,
    data: {
      value?: string;
      humidity?: number;
      temperature?: number;
      equipmentUsed?: string[];
      date?: Date;
      wallReadings?: {
        wallId: string;
        reading: number;
        images: string[];
      }[];
    },
  ): Promise<Prisma.RoomReadingGetPayload<{}>> {
    return this.prisma.roomReading.update({
      where: { id },
      data: {
        ...data,
        wallReadings: {
          upsert: data.wallReadings?.map((wallReading) => ({
            where: {
              wallId_roomReadingId: {
                wallId: wallReading.wallId,
                roomReadingId: id,
              },
            },
            update: {
              reading: wallReading.reading,
              images: wallReading.images,
            },
            create: {
              wall: {
                connect: {
                  id: wallReading.wallId,
                },
              },
              reading: wallReading.reading,
              images: wallReading.images,
            },
          })),
        },
      },
    });
  }

  // Delete methods
  async deleteRoomReading(
    id: string,
  ): Promise<Prisma.RoomReadingGetPayload<{}>> {
    return this.prisma.roomReading.delete({
      where: { id },
    });
  }

  async deleteGenericRoomReading(
    id: string,
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.prisma.genericRoomReading.delete({
      where: { id },
    });
  }
}
