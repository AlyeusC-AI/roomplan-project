import type { WallType } from "@prisma/client";

// Wall Types
export interface Wall {
  id: string;
  roomId: string;
  name: string;
  type: WallType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWallDto {
  roomId: string;
  name: string;
  type: WallType;
}

export interface UpdateWallDto {
  name?: string;
  type?: WallType;
}

// Wall Reading Types
export interface WallReading {
  id: string;
  wallId: string;
  reading: number;
  images: string[];
  roomReadingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWallReadingDto {
  wallId: string;
  reading: number;
  images: string[];
  roomReadingId?: string;
}

export interface UpdateWallReadingDto {
  reading?: number;
  images?: string[];
}

// Room Reading Types
export interface RoomReading {
  id: string;
  roomId: string;
  date: Date;
  humidity: number;
  temperature: number;

  equipmentUsed: string[];
  createdAt: Date;
  updatedAt: Date;
  wallReadings?: WallReading[];
  genericRoomReading?: GenericRoomReading[];
}

export interface CreateRoomReadingDto {
  roomId: string;
  date: Date;
  humidity: number;
  temperature: number;

  equipmentUsed: string[];
}

// Generic Room Reading Types
export interface GenericRoomReading {
  id: string;
  roomReadingId: string;

  value: string;
  humidity: number;
  temperature: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGenericRoomReadingDto {
  roomReadingId: string;

  value: string;
  humidity: number;
  temperature: number;
  images: string[];
}

export interface UpdateGenericRoomReadingDto {
  value?: string;
  humidity?: number;
  temperature?: number;
  images?: string[];
}

export interface UpdateRoomReadingDto {
  date?: Date;
  humidity?: number;
  temperature?: number;

  equipmentUsed?: string[];
  wallReadings?: {
    wallId: string;
    reading: number;
    images: string[];
  }[];
}
