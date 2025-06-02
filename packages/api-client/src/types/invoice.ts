export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount?: number;
  markup?: number;
  tax?: number;
  total: number;
  deposit?: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  notes?: string;
  terms?: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    email?: string;
  };
  items: InvoiceItem[];
  paymentSchedules: PaymentSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  name?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
  category?: string;
  invoiceId?: string;
  estimateId?: string;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSchedule {
  id: string;
  dueDate: string;
  amount: number;
  description?: string;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceDto {
  number: string;
  clientName: string;
  clientEmail: string;
  projectId?: string;
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount?: number;
  markup?: number;
  tax?: number;
  total: number;
  deposit?: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  notes?: string;
  terms?: string;
  organizationId: string;
  items: CreateInvoiceItemDto[];
  paymentSchedules?: CreatePaymentScheduleDto[];
}

export interface CreateInvoiceItemDto {
  description: string;
  name?: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
  category?: string;
}

export interface CreatePaymentScheduleDto {
  dueDate: string;
  amount: number;
  description?: string;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {}

export interface InvoiceResponse {
  error?: string;
  data?: Invoice;
}

export interface InvoicesResponse {
  error?: string;
  data?: Invoice[];
}

export interface SaveInvoiceItemDto {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
  category?: string;
  organizationId: string;
}

export interface SavedLineItemsExportResponse {
  filePath: string;
}

export interface SavedLineItemsImportResponse {
  imported: number;
  total: number;
}

export interface SavedLineItemsByCategoryResponse {
  data: InvoiceItem[];
}
