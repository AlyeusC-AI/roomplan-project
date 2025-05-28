import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { formsService } from "../services/forms";
import type {
  CreateFormDto,
  UpdateFormDto,
  Form,
  FormResponse,
  CreateFormResponseDto,
  CreateFormSectionDto,
  UpdateFormSectionDto,
  CreateFormFieldDto,
  UpdateFormFieldDto,
} from "../types/forms";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateForm() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateFormDto) =>
      formsService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormDto }) =>
      formsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useGetForms() {
  const org = useActiveOrganization();
  const options: UseQueryOptions<Form[], Error> = {
    queryKey: ["forms", org?.id],
    queryFn: async () => {
      const response = await formsService.findAll(org?.id ?? "");
      return response;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetFormById(id: string) {
  return useQuery({
    queryKey: ["forms", id],
    queryFn: () => formsService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}

export function useGetFormsByProject(projectId: string) {
  return useQuery({
    queryKey: ["forms", "project", projectId],
    queryFn: () => formsService.findFormsByProject(projectId),
    enabled: !!projectId && !!useAuthStore.getState().token,
  });
}

// Form Section hooks
export function useCreateFormSection(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormSectionDto) =>
      formsService.createSection(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

export function useUpdateFormSection(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: UpdateFormSectionDto;
    }) => formsService.updateSection(formId, sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

export function useDeleteFormSection(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      formsService.deleteSection(formId, sectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

// Form Field hooks
export function useCreateFormField(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormFieldDto) =>
      formsService.createField(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

export function useUpdateFormField(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fieldId,
      data,
    }: {
      fieldId: string;
      data: UpdateFormFieldDto;
    }) => formsService.updateField(formId, fieldId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

export function useDeleteFormField(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) => formsService.deleteField(formId, fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms", formId] });
    },
  });
}

// Form Response hooks
export function useCreateFormResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormResponseDto) =>
      formsService.createResponse(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["form-responses", variables.projectId],
      });
    },
  });
}

export function useGetProjectFormResponses(projectId: string) {
  return useQuery({
    queryKey: ["form-responses", projectId],
    queryFn: () => formsService.getProjectResponses(projectId),
    enabled: !!projectId && !!useAuthStore.getState().token,
  });
}

export function useGetFormResponse(id: string) {
  return useQuery({
    queryKey: ["form-responses", id],
    queryFn: () => formsService.getResponse(id),
    enabled: !!id && !!useAuthStore.getState().token,
  });
}
