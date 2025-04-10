export interface Document {
  id: number;
  name: string;
  url: string;
  json: string;
}

export interface Annotation {
  type: 'signature' | 'image' | 'text' | 'clientSignature';
  x: number;
  y: number;
  data: string;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  pageNumber: number;
  isPlaceholder?: boolean;
  name?: string;
}

export interface Signature {
  id: number;
  name: string;
  sign: string;
  orgId: number;
}

export interface DeleteConfirmState {
  type: 'document' | 'signature' | 'annotation';
  id: number;
  name?: string;
} 