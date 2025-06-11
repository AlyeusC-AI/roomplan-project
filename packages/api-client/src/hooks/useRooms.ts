import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { roomsService } from "../services/rooms";
import type {
  CreateRoomDto,
  UpdateRoomDto,
  Room,
  Image,
  Comment,
  ImageFilters,
  ImageSortOptions,
  PaginationOptions,
  AddImageDto,
  AddCommentDto,
  ImageType,
} from "../types/room";

// Room CRUD hooks
export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoomDto) => roomsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoomDto }) =>
      roomsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export function useGetRooms(projectId: string) {
  return useQuery({
    queryKey: ["rooms", projectId],
    queryFn: () => roomsService.findAll(projectId),
    enabled: !!projectId,
  });
}

export function useGetRoom(id: string) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

// Image related hooks
export function useAddImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: AddImageDto }) =>
      roomsService.addImage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useRemoveImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => roomsService.removeImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      imageId,
      data,
    }: {
      imageId: string;
      data: {
        url?: string;
        showInReport?: boolean;
        order?: number;
        name?: string;
        description?: string;
        type?: ImageType;
      };
    }) => roomsService.updateImage(imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useSearchImages(
  projectId: string,
  filters: ImageFilters,
  sort: ImageSortOptions,
  pagination: PaginationOptions
) {
  return useQuery({
    queryKey: ["images", projectId, filters, sort, pagination],
    queryFn: () =>
      roomsService.searchImages(projectId, filters, sort, pagination),
    enabled: !!projectId,
  });
}

export function useImageStats(projectId: string) {
  return useQuery({
    queryKey: ["imageStats", projectId],
    queryFn: () => roomsService.getImageStats(projectId),
    enabled: !!projectId,
  });
}

export function useBulkUpdateImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      filters,
      updates,
    }: {
      projectId: string;
      filters: Omit<ImageFilters, "projectId">;
      updates: { showInReport?: boolean; order?: number; roomId?: string };
    }) => roomsService.bulkUpdateImages(projectId, filters, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useBulkRemoveImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      filters,
    }: {
      projectId: string;
      filters: Omit<ImageFilters, "projectId">;
    }) => roomsService.bulkRemoveImages(projectId, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

export function useUpdateImagesOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; order: number }[]) =>
      roomsService.updateImagesOrder(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

// Comment related hooks
export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, data }: { imageId: string; data: AddCommentDto }) =>
      roomsService.addComment(imageId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["comments", data.imageId] });
      return data;
    },
  });
}

export function useRemoveComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => roomsService.removeComment(commentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["comments", data.imageId] });
      return data;
    },
  });
}

export function useGetComments(imageId: string) {
  return useQuery({
    queryKey: ["comments", imageId],
    queryFn: () => roomsService.getComments(imageId),
    enabled: !!imageId,
  });
}

// Area Affected hooks
export function useUpdateAreaAffected() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      type,
      data,
    }: {
      roomId: string;
      type: "floor" | "walls" | "ceiling";
      data: {
        material?: string;
        totalAreaRemoved?: string;
        totalAreaMicrobialApplied?: string;
        cabinetryRemoved?: string;
        isVisible?: boolean;
        extraFields?: any;
      };
    }) => roomsService.updateAreaAffected(roomId, type, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["rooms", data.id, "area-affected"],
      });
    },
  });
}

export function useDeleteAreaAffected() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      type,
    }: {
      roomId: string;
      type: "floor" | "walls" | "ceiling";
    }) => roomsService.deleteAreaAffected(roomId, type),
    onSuccess: (data) => {
      // queryClient.invalidateQueries({ queryKey: ["rooms", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["rooms", data.id, "area-affected"],
      });
    },
  });
}

export function useGetAreaAffected(roomId: string) {
  return useQuery({
    queryKey: ["rooms", roomId, "area-affected"],
    queryFn: () => roomsService.getAreaAffected(roomId),
    enabled: !!roomId,
  });
}
