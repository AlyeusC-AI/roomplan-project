export type CertificateType = "cos" | "auth";

export interface BaseCertificateFormData {
  customerName: string;
  cellPhone: string;
  address: string;
  insuranceCompany: string;
  claimNumber: string;
  policyNumber: string;
  date: string;
  representativeName: string;
  customerSignature: string;
  representativeSignature: string;
  type: CertificateType;
}

export interface WorkOrderFormData extends BaseCertificateFormData {
  email: string;
  city: string;
  state: string;
  zip: string;
  phoneNumber: string;
  lossType: string;
  dateOfLoss: string;
}

export type CertificateFormData = BaseCertificateFormData | WorkOrderFormData;

export interface CertificateProps {
  formData: CertificateFormData;
  onFormDataChange?: (data: Partial<CertificateFormData>) => void;
  isCustomer?: boolean;
  isRep?: boolean;
  id?: string;
  type?: CertificateType;
  errors?: Record<string, string>;
}
