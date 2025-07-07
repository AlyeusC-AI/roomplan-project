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
        projectId: "", // This will need to be passed from the component
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

export function useOfflineUpdateRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addEditToQueue } = useOfflineReadingsStore();
  const updateRoomReading = useUpdateRoomReading();

  const mutate = async ({
    id,
    data,
  }: {
    id: string;
    data: UpdateRoomReadingDto;
  }) => {
    if (isOffline) {
      // Add edit to offline queue when offline
      addEditToQueue({
        readingId: id,
        roomId: "", // This will be filled by the processor
        projectId: projectId || "",
        operation: "update",
        data: {
          date: data.date,
          humidity: data.humidity,
          temperature: data.temperature,
        },
      });
      toast.success("Reading update queued for offline");
      return;
    }

    try {
      return await updateRoomReading.mutateAsync({ id, data });
    } catch (error) {
      console.error("Failed to update reading:", error);
      // If update fails, add to offline queue as fallback
      addEditToQueue({
        readingId: id,
        roomId: "", // This will need to be passed from the component
        projectId: "", // This will need to be passed from the component
        operation: "update",
        data: {
          date: data.date,
          humidity: data.humidity,
          temperature: data.temperature,
        },
      });
      toast.error("Reading update failed, queued for offline");
      throw error;
    }
  };

  return {
    ...updateRoomReading,
    mutate,
  };
}

export function useOfflineDeleteRoomReading(projectId?: string) {
  const { isOffline } = useNetworkStatus();
  const { addEditToQueue } = useOfflineReadingsStore();
  const deleteRoomReading = useDeleteRoomReading();

  const mutate = async (id: string) => {
    if (isOffline) {
      // Add delete to offline queue when offline
      addEditToQueue({
        readingId: id,
        roomId: "", // This will be filled by the processor
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
        roomId: "", // This will need to be passed from the component
        projectId: "", // This will need to be passed from the component
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
