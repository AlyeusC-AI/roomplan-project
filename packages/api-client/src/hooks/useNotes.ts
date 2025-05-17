import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesService } from "../services/notes";
import type { CreateNoteDto, UpdateNoteDto, Note } from "../types/note";

// Note CRUD hooks
export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteDto) => notesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      notesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useGetNotes(roomId: string) {
  return useQuery({
    queryKey: ["notes", roomId],
    queryFn: () => notesService.findAll(roomId),
    enabled: !!roomId,
  });
}

export function useGetNote(id: string) {
  return useQuery({
    queryKey: ["notes", id],
    queryFn: () => notesService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
