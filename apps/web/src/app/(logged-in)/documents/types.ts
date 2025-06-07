export interface Document {
  id: number;
  publicId: string;
  name: string;
  url: string;
  json: string;
}

export interface Annotation {
  type: "signature" | "image" | "text" | "clientInput";
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
  inputType?: "signature" | "text";
}

export interface Signature {
  id: number;
  name: string;
  sign: string;
  orgId: number;
}

export interface DeleteConfirmState {
  type: "document" | "annotation";
  id: number;
  name?: string;
}
