import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { tagsService } from "../services/tags";
import type {
  CreateTagDto,
  UpdateTagDto,
  Tag,
  TagFilters,
  SetTagsDto,
  BulkUpsertTagsDto,
  TagStats,
  ProjectWithTags,
  ImageWithTags,
} from "../types/tags";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateTag() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: Omit<CreateTagDto, "organizationId">) =>
      tagsService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagDto }) =>
      tagsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useGetTags(filters?: Omit<TagFilters, "organizationId">) {
  const org = useActiveOrganization();
  const options: UseQueryOptions<Tag[], Error> = {
    queryKey: ["tags", org?.id, filters],
    queryFn: async () => {
      const response = await tagsService.findAll(org?.id ?? "", filters);
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetTagById(id: string) {
  return useQuery({
    queryKey: ["tags", id],
    queryFn: () => tagsService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

// Project tag operations
export function useSetProjectTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      projectId,
      tagNames,
    }: {
      projectId: string;
      tagNames: string[];
    }) =>
      tagsService.setProjectTags(projectId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
  });
}

export function useAddProjectTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      projectId,
      tagNames,
    }: {
      projectId: string;
      tagNames: string[];
    }) =>
      tagsService.addProjectTags(projectId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
  });
}

export function useRemoveProjectTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      projectId,
      tagNames,
    }: {
      projectId: string;
      tagNames: string[];
    }) =>
      tagsService.removeProjectTags(projectId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
  });
}

// Image tag operations
export function useSetImageTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      imageId,
      tagNames,
    }: {
      imageId: string;
      tagNames: string[];
    }) =>
      tagsService.setImageTags(imageId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["images", variables.imageId],
      });
    },
  });
}

export function useAddImageTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      imageId,
      tagNames,
    }: {
      imageId: string;
      tagNames: string[];
    }) =>
      tagsService.addImageTags(imageId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["images", variables.imageId],
      });
    },
  });
}

export function useRemoveImageTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: ({
      imageId,
      tagNames,
    }: {
      imageId: string;
      tagNames: string[];
    }) =>
      tagsService.removeImageTags(imageId, {
        tagNames,
        organizationId: org?.id ?? "",
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({
        queryKey: ["images", variables.imageId],
      });
    },
  });
}

// Bulk operations
export function useBulkUpsertTags() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (
      tags: Omit<BulkUpsertTagsDto["tags"][0], "organizationId">[]
    ) =>
      tagsService.bulkUpsertTags({
        tags: tags.map((tag) => ({
          ...tag,
          organizationId: org?.id ?? "",
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

// Statistics
export function useGetTagStats() {
  const org = useActiveOrganization();
  return useQuery({
    queryKey: ["tags", "stats", org?.id],
    queryFn: () => tagsService.getTagStats(org?.id ?? ""),
    enabled: !!org?.id && !!useAuthStore.getState().token,
  });
}
