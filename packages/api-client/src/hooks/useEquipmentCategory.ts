import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  equipmentCategoryService,
  EquipmentCategory,
} from "../services/equipmentCategory";
import { useActiveOrganization } from "./useOrganization";

export function useGetEquipmentCategories() {
  const org = useActiveOrganization();
  return useQuery({
    queryKey: ["equipment-categories", org?.id],
    queryFn: () => equipmentCategoryService.findAll(org?.id ?? ""),
    enabled: !!org?.id,
    select: (res) => res.data as EquipmentCategory[],
  });
}

export function useCreateEquipmentCategory() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();
  return useMutation({
    mutationFn: (name: string) =>
      equipmentCategoryService.create({ name, organizationId: org?.id ?? "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-categories"] });
    },
  });
}

export function useUpdateEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      equipmentCategoryService.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-categories"] });
    },
  });
}

export function useDeleteEquipmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentCategoryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-categories"] });
    },
  });
}
