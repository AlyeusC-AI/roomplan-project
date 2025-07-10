import { useNetworkStatus } from "../providers/QueryProvider";
import { useOfflineReadingsStore } from "../state/offline-readings";
import { useOfflineWallReadingsStore } from "../state/offline-wall-readings";
import { useOfflineGenericReadingsStore } from "../state/offline-generic-readings";
import { toast } from "sonner-native";
import {
  useCreateRoomReading,
  useUpdateRoomReading,
  useDeleteRoomReading,
  useCreateWallReading,
  useUpdateWallReading,
  useDeleteWall,
  useCreateGenericRoomReading,
  useUpdateGenericRoomReading,
  CreateRoomReadingDto,
  UpdateRoomReadingDto,
  CreateWallReadingDto,
  UpdateWallReadingDto,
  CreateGenericRoomReadingDto,
  UpdateGenericRoomReadingDto,
} from "@service-geek/api-client";

export function useOfflineCreateRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addNewReading } = useOfflineReadingsStore();
  const createRoomReading = useCreateRoomReading();

  const mutate = async (data: CreateRoomReadingDto) => {
    if (isOffline) {
      // Add to offline queue when offline
      addNewReading({
        roomId: data.roomId,
        projectId: projectId || "",
        date: data.date,
        humidity: data.humidity,
        temperature: data.temperature,
      });
      toast.success("Reading added to offline queue");
      return;
    }

    try {
      return await createRoomReading.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create reading:", error);
      // If creation fails, add to offline queue as fallback
      addNewReading({
        roomId: data.roomId,
        projectId: projectId || "",
        date: data.date,
        humidity: data.humidity,
        temperature: data.temperature,
      });
      toast.error("Reading creation failed, added to offline queue");
      throw error;
    }
  };

  return {
    ...createRoomReading,
    mutate,
  };
}

export function useOfflineUpdateRoomReading(
  projectId?: string,
  roomId?: string
) {
  const { isOffline } = useNetworkStatus();
  const { addEdit, getEditForReading, updateReading } =
    useOfflineReadingsStore();
  const updateRoomReading = useUpdateRoomReading();

  const mutate = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateRoomReadingDto;
  }) => {
    if (isOffline) {
      // Check if there's already an existing edit for this reading
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        // Update the existing edit with new data
        updateReading(existingEdit.id, {
          date: data.date || new Date(),
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
        });
        toast.success("Reading update merged with existing offline edit");
      } else {
        // Create a new edit operation
        addEdit({
          roomId: roomId || "",
          projectId: projectId || "",
          originalReadingId: id,
          date: data.date || new Date(),
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
        });
        toast.success("Reading update queued for offline");
      }
      return;
    }

    try {
      return await updateRoomReading.mutateAsync({ id, data });
    } catch (error) {
      console.error("Failed to update reading:", error);
      // If update fails, add to offline queue as fallback
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        updateReading(existingEdit.id, {
          date: data.date || new Date(),
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
        });
      } else {
        addEdit({
          roomId: roomId || "",
          projectId: projectId || "",
          originalReadingId: id,
          date: data.date || new Date(),
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
        });
      }
      toast.error("Reading update failed, queued for offline");
      throw error;
    }
  };

  return {
    ...updateRoomReading,
    mutate,
  };
}

export function useOfflineDeleteRoomReading(
  projectId?: string,
  roomId?: string
) {
  const { isOffline } = useNetworkStatus();
  const { addEdit } = useOfflineReadingsStore();
  const deleteRoomReading = useDeleteRoomReading();

  const mutate = async (id: string) => {
    if (isOffline) {
      // Add delete to offline queue when offline
      addEdit({
        roomId: roomId || "",
        projectId: projectId || "",
        originalReadingId: id,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
      toast.success("Reading deletion queued for offline");
      return;
    }

    try {
      return await deleteRoomReading.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete reading:", error);
      // If deletion fails, add to offline queue as fallback
      addEdit({
        roomId: roomId || "",
        projectId: projectId || "",
        originalReadingId: id,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
      toast.error("Reading deletion failed, queued for offline");
      throw error;
    }
  };

  return {
    ...deleteRoomReading,
    mutate,
  };
}

// Wall Reading Hooks
export function useOfflineCreateWallReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addNewWallReading } = useOfflineWallReadingsStore();
  const createWallReading = useCreateWallReading();

  const mutate = async (data: CreateWallReadingDto) => {
    if (isOffline) {
      addNewWallReading({
        wallId: data.wallId,
        roomReadingId: data.roomReadingId || "",
        projectId: projectId || "",
        reading: data.reading,
        images: data.images || [],
      });
      toast.success("Wall reading added to offline queue");
      return;
    }

    try {
      return await createWallReading.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create wall reading:", error);
      addNewWallReading({
        wallId: data.wallId,
        roomReadingId: data.roomReadingId || "",
        projectId: projectId || "",
        reading: data.reading,
        images: data.images || [],
      });
      toast.error("Wall reading creation failed, added to offline queue");
      throw error;
    }
  };

  return {
    ...createWallReading,
    mutate,
  };
}

export function useOfflineUpdateWallReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addEdit, getEditForReading, updateReading } =
    useOfflineWallReadingsStore();
  const updateWallReading = useUpdateWallReading();

  const mutate = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateWallReadingDto;
  }) => {
    if (isOffline) {
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        updateReading(existingEdit.id, {
          reading: data.reading || 0,
          images: data.images || [],
        });
        toast.success("Wall reading update merged with existing offline edit");
      } else {
        addEdit({
          wallId: "",
          roomReadingId: "",
          projectId: projectId || "",
          reading: data.reading || 0,
          images: data.images || [],
          originalReadingId: id,
        });
        toast.success("Wall reading update queued for offline");
      }
      return;
    }

    try {
      return await updateWallReading.mutateAsync({ id, data });
    } catch (error) {
      console.error("Failed to update wall reading:", error);
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        updateReading(existingEdit.id, {
          reading: data.reading || 0,
          images: data.images || [],
        });
      } else {
        addEdit({
          wallId: "",
          roomReadingId: "",
          projectId: projectId || "",
          reading: data.reading || 0,
          images: data.images || [],
          originalReadingId: id,
        });
      }
      toast.error("Wall reading update failed, queued for offline");
      throw error;
    }
  };

  return {
    ...updateWallReading,
    mutate,
  };
}

// Generic Room Reading Hooks
export function useOfflineCreateGenericRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addNewGenericReading } = useOfflineGenericReadingsStore();
  const createGenericRoomReading = useCreateGenericRoomReading();

  const mutate = async (data: CreateGenericRoomReadingDto) => {
    if (isOffline) {
      addNewGenericReading({
        roomReadingId: data.roomReadingId || "",
        projectId: projectId || "",
        value: data.value || "",
        humidity: data.humidity || 0,
        temperature: data.temperature || 0,
        images: data.images || [],
      });
      toast.success("Generic reading added to offline queue");
      return;
    }

    try {
      return await createGenericRoomReading.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create generic reading:", error);
      addNewGenericReading({
        roomReadingId: data.roomReadingId || "",
        projectId: projectId || "",
        value: data.value || "",
        humidity: data.humidity || 0,
        temperature: data.temperature || 0,
        images: data.images || [],
      });
      toast.error("Generic reading creation failed, added to offline queue");
      throw error;
    }
  };

  return {
    ...createGenericRoomReading,
    mutate,
  };
}

export function useOfflineUpdateGenericRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addEdit, getEditForReading, updateReading } =
    useOfflineGenericReadingsStore();
  const updateGenericRoomReading = useUpdateGenericRoomReading();

  const mutate = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateGenericRoomReadingDto;
  }) => {
    if (isOffline) {
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        updateReading(existingEdit.id, {
          value: data.value || "",
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
          images: data.images || [],
        });
        toast.success(
          "Generic reading update merged with existing offline edit"
        );
      } else {
        addEdit({
          roomReadingId: "",
          projectId: projectId || "",
          value: data.value || "",
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
          images: data.images || [],
          originalReadingId: id,
        });
        toast.success("Generic reading update queued for offline");
      }
      return;
    }

    try {
      return await updateGenericRoomReading.mutateAsync({ id, data });
    } catch (error) {
      console.error("Failed to update generic reading:", error);
      const existingEdit = getEditForReading(id);

      if (existingEdit) {
        updateReading(existingEdit.id, {
          value: data.value || "",
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
          images: data.images || [],
        });
      } else {
        addEdit({
          roomReadingId: "",
          projectId: projectId || "",
          value: data.value || "",
          humidity: data.humidity || 0,
          temperature: data.temperature || 0,
          images: data.images || [],
          originalReadingId: id,
        });
      }
      toast.error("Generic reading update failed, queued for offline");
      throw error;
    }
  };

  return {
    ...updateGenericRoomReading,
    mutate,
  };
}

// Hook to get offline readings for display
export function useOfflineReadings(roomId?: string) {
  const { getReadingsByRoom, getEditForReading } = useOfflineReadingsStore();

  const offlineReadings = roomId ? getReadingsByRoom(roomId) : [];
  const offlineEdits = roomId
    ? getReadingsByRoom(roomId).filter((r) => r.type === "edit")
    : [];

  return {
    offlineReadings,
    offlineEdits,
    hasOfflineData: offlineReadings.length > 0,
  };
}
