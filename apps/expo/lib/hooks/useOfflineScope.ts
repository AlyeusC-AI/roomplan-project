import { useCallback } from "react";
import { toast } from "sonner-native";
import {
  useUpdateRoom,
  useUpdateAreaAffected,
  useCreateEquipment,
  useDeleteEquipment,
  useUpdateEquipment,
} from "@service-geek/api-client";
import { useOfflineScopeStore } from "@/lib/state/offline-scope";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";

export const useOfflineUpdateRoom = () => {
  const { mutate: updateRoom } = useUpdateRoom();
  const { addRoomEdit } = useOfflineScopeStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (roomId: string, data: any, projectId: string) => {
      if (isOffline) {
        // Queue the edit when offline
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data,
        });
        toast.success("Room update queued for when online");
        return;
      }

      try {
        await updateRoom({ id: roomId, data });
        toast.success("Room updated successfully");
      } catch (error) {
        console.error("Room update failed:", error);
        // Fallback to offline queue if online update fails
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data,
        });
        toast.error("Update failed, queued for retry when online");
      }
    },
    [updateRoom, addRoomEdit, isOffline]
  );

  return { mutate };
};

export const useOfflineUpdateAreaAffected = () => {
  const { mutate: updateAreaAffected } = useUpdateAreaAffected();
  const { addAreaAffectedEdit } = useOfflineScopeStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (
      roomId: string,
      type: "floor" | "walls" | "ceiling",
      data: any,
      projectId: string
    ) => {
      if (isOffline) {
        // Queue the edit when offline
        addAreaAffectedEdit({
          roomId,
          projectId,
          type: "area_affected_update",
          data: { type, ...data },
        });
        toast.success("Area affected update queued for when online");
        return;
      }

      try {
        await updateAreaAffected({ roomId, type, data });
        toast.success("Area affected updated successfully");
      } catch (error) {
        console.error("Area affected update failed:", error);
        // Fallback to offline queue if online update fails
        addAreaAffectedEdit({
          roomId,
          projectId,
          type: "area_affected_update",
          data: { type, ...data },
        });
        toast.error("Update failed, queued for retry when online");
      }
    },
    [updateAreaAffected, addAreaAffectedEdit, isOffline]
  );

  return { mutate };
};

export const useOfflineCreateEquipment = () => {
  const { mutate: createEquipment } = useCreateEquipment();
  const { addRoomEdit } = useOfflineScopeStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (data: any, roomId: string, projectId: string) => {
      if (isOffline) {
        // Queue the equipment creation when offline
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update", // Equipment updates are part of room data
          data: { equipment: data },
        });
        toast.success("Equipment creation queued for when online");
        return;
      }

      try {
        await createEquipment(data);
        toast.success("Equipment created successfully");
      } catch (error) {
        console.error("Equipment creation failed:", error);
        // Fallback to offline queue if online creation fails
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data: { equipment: data },
        });
        toast.error("Creation failed, queued for retry when online");
      }
    },
    [createEquipment, addRoomEdit, isOffline]
  );

  return { mutate };
};

export const useOfflineDeleteEquipment = () => {
  const { mutate: deleteEquipment } = useDeleteEquipment();
  const { addRoomEdit } = useOfflineScopeStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (equipmentId: string, roomId: string, projectId: string) => {
      if (isOffline) {
        // Queue the equipment deletion when offline
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data: { deleteEquipment: equipmentId },
        });
        toast.success("Equipment deletion queued for when online");
        return;
      }

      try {
        await deleteEquipment(equipmentId);
        toast.success("Equipment deleted successfully");
      } catch (error) {
        console.error("Equipment deletion failed:", error);
        // Fallback to offline queue if online deletion fails
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data: { deleteEquipment: equipmentId },
        });
        toast.error("Deletion failed, queued for retry when online");
      }
    },
    [deleteEquipment, addRoomEdit, isOffline]
  );

  return { mutate };
};

export const useOfflineUpdateEquipment = () => {
  const { mutate: updateEquipment } = useUpdateEquipment();
  const { addRoomEdit } = useOfflineScopeStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (
      equipmentId: string,
      data: any,
      roomId: string,
      projectId: string
    ) => {
      if (isOffline) {
        // Queue the equipment update when offline
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data: { updateEquipment: { id: equipmentId, ...data } },
        });
        toast.success("Equipment update queued for when online");
        return;
      }

      try {
        await updateEquipment({ id: equipmentId, data });
        toast.success("Equipment updated successfully");
      } catch (error) {
        console.error("Equipment update failed:", error);
        // Fallback to offline queue if online update fails
        addRoomEdit({
          roomId,
          projectId,
          type: "room_update",
          data: { updateEquipment: { id: equipmentId, ...data } },
        });
        toast.error("Update failed, queued for retry when online");
      }
    },
    [updateEquipment, addRoomEdit, isOffline]
  );

  return { mutate };
};
