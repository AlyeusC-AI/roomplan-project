import { useNetworkStatus } from "../providers/QueryProvider";
import { useOfflineReadingsStore } from "../state/offline-readings";
import { toast } from "sonner-native";
import {
  useCreateRoomReading,
  useUpdateRoomReading,
  useDeleteRoomReading,
  CreateRoomReadingDto,
  UpdateRoomReadingDto,
} from "@service-geek/api-client";

export function useOfflineCreateRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineReadingsStore();
  const createRoomReading = useCreateRoomReading();

  const mutate = async (data: CreateRoomReadingDto) => {
    if (isOffline) {
      // Add to offline queue when offline
      addToQueue({
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
      addToQueue({
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
  const { addEditToQueue, updateExistingEdit, getExistingEditForReading } =
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
      const existingEdit = getExistingEditForReading(id);

      if (existingEdit) {
        // Update the existing edit with new data (batch the changes)
        updateExistingEdit(id, {
          date: data.date,
          humidity: data.humidity,
          temperature: data.temperature,
        });
        toast.success("Reading update merged with existing offline edit");
      } else {
        // Create a new edit operation
        addEditToQueue({
          readingId: id,
          roomId: roomId || "",
          projectId: projectId || "",
          operation: "update",
          data: {
            date: data.date,
            humidity: data.humidity,
            temperature: data.temperature,
          },
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
      const existingEdit = getExistingEditForReading(id);

      if (existingEdit) {
        updateExistingEdit(id, {
          date: data.date,
          humidity: data.humidity,
          temperature: data.temperature,
        });
      } else {
        addEditToQueue({
          readingId: id,
          roomId: roomId || "",
          projectId: projectId || "",
          operation: "update",
          data: {
            date: data.date,
            humidity: data.humidity,
            temperature: data.temperature,
          },
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
  const { addEditToQueue } = useOfflineReadingsStore();
  const deleteRoomReading = useDeleteRoomReading();

  const mutate = async (id: string) => {
    if (isOffline) {
      // Add delete to offline queue when offline
      addEditToQueue({
        readingId: id,
        roomId: roomId || "",
        projectId: projectId || "",
        operation: "delete",
      });
      toast.success("Reading deletion queued for offline");
      return;
    }

    try {
      return await deleteRoomReading.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete reading:", error);
      // If deletion fails, add to offline queue as fallback
      addEditToQueue({
        readingId: id,
        roomId: roomId || "",
        projectId: projectId || "",
        operation: "delete",
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

// Hook to get offline readings for display
export function useOfflineReadings(roomId?: string) {
  const { getReadingsByRoom, getEditsByReading } = useOfflineReadingsStore();

  const offlineReadings = roomId ? getReadingsByRoom(roomId) : [];
  const offlineEdits = roomId ? getEditsByReading(roomId) : [];

  return {
    offlineReadings,
    offlineEdits,
    hasOfflineData: offlineReadings.length > 0 || offlineEdits.length > 0,
  };
}
