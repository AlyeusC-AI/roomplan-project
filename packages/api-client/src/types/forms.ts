import { LossType } from "..";

export interface Form {
  id: string;
  name: string;
  description?: string;
  lossTypes: LossType[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  sections: FormSection[];
}

export interface FormSection {
  id: string;
  name: string;
  formId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  name: string;
  formId: string;
  type: FormFieldType;
  options: string[];
  order: number;
  isRequired: boolean;
  formSectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  formResponseFields: FormResponseField[];
}

export interface FormResponseField {
  id: string;
  formResponseId: string;
  fieldId: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
  field: FormField;
}

export enum FormFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  DATE = "DATE",
  RADIO = "RADIO",
  CHECKBOX = "CHECKBOX",
  SELECT = "SELECT",
  FILE = "FILE",
  IMAGE = "IMAGE",
  RATING = "RATING",
  SIGNATURE = "SIGNATURE",
  TIME = "TIME",
}

export interface CreateFormDto {
  name: string;
  description?: string;
  lossTypes?: LossType[];
  organizationId?: string;
  sections?: CreateFormSectionDto[];
  fields?: CreateFormFieldDto[];
}

export interface UpdateFormDto {
  name?: string;
  description?: string;
  lossTypes?: LossType[];
  sections?: CreateFormSectionDto[];
  fields?: CreateFormFieldDto[];
}

export interface CreateFormSectionDto {
  name: string;
  order: number;
  fields?: CreateFormFieldDto[];
}

export interface UpdateFormSectionDto {
  name?: string;
  order?: number;
}

export interface CreateFormFieldDto {
  name: string;
  type: FormFieldType;
  options?: string[];
  order: number;
  isRequired?: boolean;
  formSectionId?: string;
}

export interface UpdateFormFieldDto {
  name?: string;
  type?: FormFieldType;
  options?: string[];
  order?: number;
  isRequired?: boolean;
  formSectionId?: string;
}

export interface CreateFormResponseDto {
  formId: string;
  projectId: string;
  fields: {
    fieldId: string;
    value?: string;
  }[];
}
