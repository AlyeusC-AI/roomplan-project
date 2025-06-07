import { apiClient } from "./client";
import type {
  CreateWallDto,
  UpdateWallDto,
  CreateWallReadingDto,
  UpdateWallReadingDto,
  CreateRoomReadingDto,
  CreateGenericRoomReadingDto,
  UpdateGenericRoomReadingDto,
  UpdateRoomReadingDto,
  Wall,
  RoomReading,
} from "../types/reading";
// Service
export const readingsService = {
  // Wall methods
  createWall: async (
    data: CreateWallDto
  ): Promise<{
    data: Wall;
  }> => {
    return apiClient.post("/readings/walls", data);
  },

  getWalls: async (roomId: string) => {
    return apiClient.get(`/readings/walls/room/${roomId}`);
  },

  getWall: async (id: string) => {
    return apiClient.get(`/readings/walls/${id}`);
  },

  updateWall: async (id: string, data: UpdateWallDto) => {
    return apiClient.patch(`/readings/walls/${id}`, data);
  },

  deleteWall: async (id: string) => {
    return apiClient.delete(`/readings/walls/${id}`);
  },

  // Wall Reading methods
  createWallReading: async (data: CreateWallReadingDto) => {
    return apiClient.post("/readings/wall-readings", data);
  },

  getWallReadings: async (wallId: string) => {
    return apiClient.get(`/readings/wall-readings/wall/${wallId}`);
  },

  getWallReading: async (id: string) => {
    return apiClient.get(`/readings/wall-readings/${id}`);
  },

  updateWallReading: async (id: string, data: UpdateWallReadingDto) => {
    return apiClient.patch(`/readings/wall-readings/${id}`, data);
  },

  deleteWallReading: async (id: string) => {
    return apiClient.delete(`/readings/wall-readings/${id}`);
  },

  // Room Reading methods
  createRoomReading: async (data: CreateRoomReadingDto) => {
    return apiClient.post("/readings/room", data);
  },

  getRoomReadings: async (roomId: string) => {
    return apiClient.get<RoomReading[]>(`/readings/room/${roomId}`);
  },

  getRoomReading: async (id: string) => {
    return apiClient.get(`/readings/room/reading/${id}`);
  },

  deleteRoomReading: async (id: string) => {
    return apiClient.delete(`/readings/room/${id}`);
  },

  // Generic Room Reading methods
  createGenericRoomReading: async (data: CreateGenericRoomReadingDto) => {
    return apiClient.post("/readings/generic", data);
  },

  getGenericRoomReadings: async (roomReadingId: string) => {
    return apiClient.get(`/readings/generic/${roomReadingId}`);
  },

  updateGenericRoomReading: async (
    id: string,
    data: UpdateGenericRoomReadingDto
  ) => {
    return apiClient.patch(`/readings/generic/${id}`, data);
  },

  deleteGenericRoomReading: async (id: string) => {
    return apiClient.delete(`/readings/generic/${id}`);
  },

  updateRoomReading: async (id: string, data: UpdateRoomReadingDto) => {
    return apiClient.patch(`/readings/room/${id}`, data);
  },
};

export const calculateGPP = (temperature: number, humidity: number) => {
  if (!temperature || !humidity) return null;
  return (
    (humidity / 100) *
    7000 *
    (1 / 7000 + (2 / 7000) * (temperature - 32))
  ).toFixed(2);
};
