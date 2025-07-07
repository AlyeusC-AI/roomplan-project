import { useCallback } from "react";
import {
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@service-geek/api-client";
import { useOfflineNotesStore } from "../state/offline-notes";
import { useNetworkStatus } from "../providers/QueryProvider";
import { toast } from "sonner-native";

export const useOfflineCreateNote = () => {
  const { mutate: createNote } = useCreateNote();
  const { addToQueue } = useOfflineNotesStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (data: { body: string; roomId: string; projectId: string }) => {
      if (isOffline) {
        // Add to offline queue when offline
        addToQueue({
          roomId: data.roomId,
          projectId: data.projectId,
          body: data.body,
        });
        toast.success("Note added to offline queue");
        return;
      }

      try {
        await createNote({
          body: data.body,
          roomId: data.roomId,
        });
      } catch (error) {
        console.error("Note creation failed:", error);
        // If creation fails, add to offline queue as fallback
        addToQueue({
          roomId: data.roomId,
          projectId: data.projectId,
          body: data.body,
        });
        toast.error("Note creation failed, added to offline queue");
      }
    },
    [createNote, addToQueue, isOffline]
  );

  return { mutate };
};

export const useOfflineUpdateNote = () => {
  const { mutate: updateNote } = useUpdateNote();
  const { addEditToQueue } = useOfflineNotesStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (
      noteId: string,
      data: { body?: string; images?: string[] },
      projectId: string,
      roomId: string
    ) => {
      if (isOffline) {
        // Add to offline queue when offline
        addEditToQueue({
          noteId,
          projectId,
          roomId,
          operation: "update",
          data,
        });
        toast.success("Note update added to offline queue");
        return;
      }

      try {
        await updateNote({
          id: noteId,
          data,
        });
      } catch (error) {
        console.error("Note update failed:", error);
        // If update fails, add to offline queue as fallback
        addEditToQueue({
          noteId,
          projectId,
          roomId,
          operation: "update",
          data,
        });
        toast.error("Note update failed, added to offline queue");
      }
    },
    [updateNote, addEditToQueue, isOffline]
  );

  return { mutate };
};

export const useOfflineDeleteNote = () => {
  const { mutate: deleteNote } = useDeleteNote();
  const { addEditToQueue } = useOfflineNotesStore();
  const { isOffline } = useNetworkStatus();

  const mutate = useCallback(
    async (noteId: string, projectId: string, roomId: string) => {
      if (isOffline) {
        // Add to offline queue when offline
        addEditToQueue({
          noteId,
          projectId,
          roomId,
          operation: "delete",
        });
        toast.success("Note deletion added to offline queue");
        return;
      }

      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error("Note deletion failed:", error);
        // If deletion fails, add to offline queue as fallback
        addEditToQueue({
          noteId,
          projectId,
          roomId,
          operation: "delete",
        });
        toast.error("Note deletion failed, added to offline queue");
      }
    },
    [deleteNote, addEditToQueue, isOffline]
  );

  return { mutate };
};
