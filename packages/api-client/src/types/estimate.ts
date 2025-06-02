export interface Estimate {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  projectId?: string;
  poNumber?: string;
  project?: {
    id: string;
    name: string;
  };
  estimateDate: string;
  expiryDate: string;
  terms?: string;
  subtotal: number;
  markup?: number;
  discount?: number;
  tax?: number;
  total: number;
  deposit?: number;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  notes?: string;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    email?: string;
  };
  items: EstimateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
  estimateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstimateDto {
  number: string;
  clientName: string;
  clientEmail: string;
  projectId?: string;
  estimateDate: string;
  poNumber?: string;
  expiryDate: string;
  terms?: string;
  subtotal: number;
  markup?: number;
  discount?: number;
  tax?: number;
  total: number;
  deposit?: number;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  notes?: string;
  //   organizationId: string;
  items: CreateEstimateItemDto[];
}

export interface CreateEstimateItemDto {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  notes?: string;
}

export interface UpdateEstimateDto extends Partial<CreateEstimateDto> {}

export interface EstimateResponse {
  error?: string;
  data?: Estimate;
}

export interface EstimatesResponse {
  error?: string;
  data?: Estimate[];
}

export interface ConversionResponse {
  error?: string;
  data?: {
    estimate: Estimate;
    invoiceId: string;
  };
}
