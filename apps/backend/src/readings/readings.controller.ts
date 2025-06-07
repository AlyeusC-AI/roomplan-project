import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { Prisma, WallType } from '@prisma/client';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  // Wall endpoints
  @Post('walls')
  async createWall(
    @Body()
    data: {
      roomId: string;
      name: string;
      type: WallType;
    },
  ): Promise<Prisma.WallGetPayload<{}>> {
    return this.readingsService.createWall(data);
  }

  @Get('walls/room/:roomId')
  async getWalls(
    @Param('roomId') roomId: string,
  ): Promise<Prisma.WallGetPayload<{}>[]> {
    return this.readingsService.getWalls(roomId);
  }

  @Get('walls/:id')
  async getWall(
    @Param('id') id: string,
  ): Promise<Prisma.WallGetPayload<{}> | null> {
    return this.readingsService.getWall(id);
  }

  @Patch('walls/:id')
  async updateWall(
    @Param('id') id: string,
    @Body() data: { name?: string; type?: WallType },
  ): Promise<Prisma.WallGetPayload<{}>> {
    return this.readingsService.updateWall(id, data);
  }

  @Delete('walls/:id')
  async deleteWall(
    @Param('id') id: string,
  ): Promise<Prisma.WallGetPayload<{}>> {
    return this.readingsService.deleteWall(id);
  }

  // Wall Reading endpoints
  @Post('wall-readings')
  async createWallReading(
    @Body()
    data: {
      wallId: string;
      reading: number;
      images: string[];
      roomReadingId?: string;
    },
  ): Promise<Prisma.WallReadingGetPayload<{}>> {
    return this.readingsService.createWallReading(data);
  }

  @Get('wall-readings/wall/:wallId')
  async getWallReadings(
    @Param('wallId') wallId: string,
  ): Promise<Prisma.WallReadingGetPayload<{}>[]> {
    return this.readingsService.getWallReadings(wallId);
  }

  @Get('wall-readings/:id')
  async getWallReading(
    @Param('id') id: string,
  ): Promise<Prisma.WallReadingGetPayload<{}> | null> {
    return this.readingsService.getWallReading(id);
  }

  @Patch('wall-readings/:id')
  async updateWallReading(
    @Param('id') id: string,
    @Body() data: { reading?: number; images?: string[] },
  ): Promise<Prisma.WallReadingGetPayload<{}>> {
    return this.readingsService.updateWallReading(id, data);
  }

  @Delete('wall-readings/:id')
  async deleteWallReading(
    @Param('id') id: string,
  ): Promise<Prisma.WallReadingGetPayload<{}>> {
    return this.readingsService.deleteWallReading(id);
  }

  // Room Reading endpoints
  @Post('room')
  async createRoomReading(
    @Body()
    data: {
      roomId: string;
      date: Date;
      humidity: number;
      temperature: number;
      equipmentUsed: string[];
    },
  ): Promise<
    Prisma.RoomReadingGetPayload<{
      include: { wallReadings: true; genericRoomReading: true };
    }>
  > {
    return this.readingsService.createRoomReading(data);
  }

  @Get('room/:roomId')
  async getRoomReadings(@Param('roomId') roomId: string): Promise<
    Prisma.RoomReadingGetPayload<{
      include: { wallReadings: true; genericRoomReading: true };
    }>[]
  > {
    return this.readingsService.getRoomReadings(roomId);
  }

  @Get('room/reading/:id')
  async getRoomReading(
    @Param('id') id: string,
  ): Promise<Prisma.RoomReadingGetPayload<{
    include: { wallReadings: true; genericRoomReading: true };
  }> | null> {
    return this.readingsService.getRoomReading(id);
  }

  @Patch('room/:id')
  async updateRoomReading(
    @Param('id') id: string,
    @Body()
    data: {
      date?: Date;
      humidity?: number;
      temperature?: number;

      equipmentUsed?: string[];
    },
  ): Promise<Prisma.RoomReadingGetPayload<{}>> {
    return this.readingsService.updateRoomReading(id, data);
  }

  @Delete('room/:id')
  async deleteRoomReading(
    @Param('id') id: string,
  ): Promise<Prisma.RoomReadingGetPayload<{}>> {
    return this.readingsService.deleteRoomReading(id);
  }

  // Generic Room Reading endpoints
  @Post('generic')
  async createGenericRoomReading(
    @Body()
    data: {
      roomReadingId: string;
      value: string;
      humidity: number;
      temperature: number;
      images: string[];
    },
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.readingsService.createGenericRoomReading(data);
  }

  @Get('generic/:roomReadingId')
  async getGenericRoomReadings(
    @Param('roomReadingId') roomReadingId: string,
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>[]> {
    return this.readingsService.getGenericRoomReadings(roomReadingId);
  }

  @Patch('generic/:id')
  async updateGenericRoomReading(
    @Param('id') id: string,
    @Body()
    data: {
      value?: string;
      humidity?: number;
      temperature?: number;
      images?: string[];
    },
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.readingsService.updateGenericRoomReading(id, data);
  }

  @Delete('generic/:id')
  async deleteGenericRoomReading(
    @Param('id') id: string,
  ): Promise<Prisma.GenericRoomReadingGetPayload<{}>> {
    return this.readingsService.deleteGenericRoomReading(id);
  }
}
