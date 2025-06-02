import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { invoiceService } from "../services/invoice";
import type {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  Invoice,
  SaveInvoiceItemDto,
  InvoiceItem,
} from "../types/invoice";
import { useAuthStore } from "../services/storage";
import { useActiveOrganization } from "./useOrganization";

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateInvoiceDto) =>
      invoiceService.create({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceDto }) =>
      invoiceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGetInvoices() {
  const org = useActiveOrganization();
  const options: UseQueryOptions<Invoice[], Error> = {
    queryKey: ["invoices", org?.id],
    queryFn: async () => {
      const response = await invoiceService.findAll(org?.id ?? "");
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetInvoiceById(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoiceService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGetInvoicesByProject(projectId: string) {
  return useQuery({
    queryKey: ["invoices", "project", projectId],
    queryFn: () => invoiceService.findByProject(projectId),
    enabled: !!projectId && !!useAuthStore.getState().token,
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
    }) => invoiceService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useEmailInvoice() {
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message?: string }) =>
      invoiceService.emailInvoice(id, message),
  });
}

export function useSaveInvoiceItem() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (data: Omit<SaveInvoiceItemDto, "organizationId">) =>
      invoiceService.saveInvoiceItem({
        ...data,
        organizationId: org?.id ?? "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useGetSavedInvoiceItems() {
  const org = useActiveOrganization();
  const options: UseQueryOptions<InvoiceItem[], Error> = {
    queryKey: ["invoices", "saved-items", org?.id],
    queryFn: async () => {
      const response = await invoiceService.getSavedInvoiceItems(org?.id ?? "");
      return response.data;
    },
    enabled: !!org?.id && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useGetSavedLineItemsByCategory(category: string) {
  const org = useActiveOrganization();
  const options: UseQueryOptions<InvoiceItem[], Error> = {
    queryKey: ["invoices", "saved-items", "category", category, org?.id],
    queryFn: async () => {
      const response = await invoiceService.getSavedLineItemsByCategory(
        org?.id ?? "",
        category
      );
      return response.data.data;
    },
    enabled: !!org?.id && !!category && !!useAuthStore.getState().token,
  };

  return useQuery(options);
}

export function useExportSavedLineItemsToCsv() {
  const org = useActiveOrganization();
  return useMutation({
    mutationFn: (category?: string) =>
      invoiceService.exportSavedLineItemsToCsv(org?.id ?? "", category),
  });
}

export function useImportSavedLineItemsFromCsv() {
  const queryClient = useQueryClient();
  const org = useActiveOrganization();

  return useMutation({
    mutationFn: (file: File) =>
      invoiceService.importSavedLineItemsFromCsv(org?.id ?? "", file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", "saved-items"] });
    },
  });
}
