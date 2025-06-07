import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { readingsService } from "../services/readings";
import type {
  CreateWallDto,
  UpdateWallDto,
  CreateWallReadingDto,
  UpdateWallReadingDto,
  CreateRoomReadingDto,
  CreateGenericRoomReadingDto,
  UpdateGenericRoomReadingDto,
  UpdateRoomReadingDto,
} from "../types/reading";

// Wall hooks
export function useCreateWall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWallDto) => {
      const wall = await readingsService.createWall(data);
      console.log("🚀 ~ mutationFn: ~ wall:", wall);
      return {
        ...wall,
        type: data.type,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walls"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useGetWalls(roomId: string) {
  return useQuery({
    queryKey: ["walls", roomId],
    queryFn: () => readingsService.getWalls(roomId),
    enabled: !!roomId,
  });
}

export function useGetWall(id: string) {
  return useQuery({
    queryKey: ["walls", id],
    queryFn: () => readingsService.getWall(id),
    enabled: !!id,
  });
}

export function useUpdateWall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWallDto }) =>
      readingsService.updateWall(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walls"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useDeleteWall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingsService.deleteWall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walls"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

// Wall Reading hooks
export function useCreateWallReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWallReadingDto) =>
      readingsService.createWallReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wall-readings"] });
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useGetWallReadings(wallId: string) {
  return useQuery({
    queryKey: ["wall-readings", wallId],
    queryFn: () => readingsService.getWallReadings(wallId),
    enabled: !!wallId,
  });
}

export function useGetWallReading(id: string) {
  return useQuery({
    queryKey: ["wall-readings", id],
    queryFn: () => readingsService.getWallReading(id),
    enabled: !!id,
  });
}

export function useUpdateWallReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWallReadingDto }) =>
      readingsService.updateWallReading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wall-readings"] });
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useDeleteWallReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingsService.deleteWallReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wall-readings"] });
    },
  });
}

// Room Reading hooks
export function useCreateRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomReadingDto) =>
      readingsService.createRoomReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useGetRoomReadings(roomId: string) {
  return useQuery({
    queryKey: ["room-readings", roomId],
    queryFn: () => readingsService.getRoomReadings(roomId),
    enabled: !!roomId,
  });
}

export function useGetRoomReading(id: string) {
  return useQuery({
    queryKey: ["room-readings", id],
    queryFn: () => readingsService.getRoomReading(id),
    enabled: !!id,
  });
}

export function useDeleteRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingsService.deleteRoomReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

// Generic Room Reading hooks
export function useCreateGenericRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGenericRoomReadingDto) =>
      readingsService.createGenericRoomReading(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generic-room-readings"] });
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useGetGenericRoomReadings(roomReadingId: string) {
  return useQuery({
    queryKey: ["generic-room-readings", roomReadingId],
    queryFn: () => readingsService.getGenericRoomReadings(roomReadingId),
    enabled: !!roomReadingId,
  });
}

export function useUpdateGenericRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGenericRoomReadingDto;
    }) => readingsService.updateGenericRoomReading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generic-room-readings"] });
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useDeleteGenericRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => readingsService.deleteGenericRoomReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generic-room-readings"] });
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}

export function useUpdateRoomReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomReadingDto }) =>
      readingsService.updateRoomReading(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-readings"] });
    },
  });
}
