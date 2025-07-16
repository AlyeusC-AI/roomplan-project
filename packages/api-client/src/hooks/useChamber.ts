import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chamberService } from "../services/chamber";
import type {
  CreateChamberDto,
  UpdateChamberDto,
  Chamber,
} from "../types/chamber";

// Chamber CRUD hooks
export function useCreateChamber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChamberDto) => chamberService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
    },
  });
}

export function useUpdateChamber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChamberDto }) =>
      chamberService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
    },
  });
}

export function useGetChambers(projectId: string) {
  return useQuery({
    queryKey: ["chambers", projectId],
    queryFn: () => chamberService.findAll(projectId),
    enabled: !!projectId,
  });
}

export function useGetChamber(id: string) {
  return useQuery({
    queryKey: ["chambers", id],
    queryFn: () => chamberService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteChamber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chamberService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chambers"] });
    },
  });
}
