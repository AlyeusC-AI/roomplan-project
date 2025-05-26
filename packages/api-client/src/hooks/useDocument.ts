import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { documentService } from "../services/document";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  Document,
} from "../types/document";
import { useAuthStore } from "../services/storage";

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.projectId],
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useGetDocuments(projectId: string) {
  const options: UseQueryOptions<Document[], Error> = {
    queryKey: ["documents", projectId],
    queryFn: async () => {
      const response = await documentService.findAll(projectId);
      return response.data;
    },
    enabled: !!projectId && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetDocumentById(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useSendDocumentEmail() {
  return useMutation({
    mutationFn: (id: string) => documentService.sendEmail(id),
  });
}
