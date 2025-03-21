import { DamageType } from "@/types/damage";

export type FormFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "NUMBER"
  | "DATE"
  | "RADIO"
  | "CHECKBOX"
  | "SELECT"
  | "FILE"
  | "IMAGE"
  | "RATING"
  | "SIGNATURE"
  | "TIME";

export interface FormOption {
  name: string;
  value: string;
  order?: number;
}

export interface FormField {
  id?: number;
  name: string;
  type: FormFieldType;
  isRequired: boolean;
  sectionId: number;
  options?: FormOption[];
  order: number;
}

export interface FormSection {
  id?: number;
  name: string;
  fields: FormField[];
  order: number;
}

export interface Form {
  id?: number;
  name: string;
  desc?: string;
  sections?: FormSection[];
  damageTypes?: DamageType[];
} 