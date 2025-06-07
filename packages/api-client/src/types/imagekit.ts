export interface ImageKitAuthToken {
  token: string;
  expire: number;
  signature: string;
}

export interface ImageKitUploadOptions {
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
  responseFields?: string[];
  isPrivateFile?: boolean;
}

export interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  height: number;
  width: number;
  size: number;
  name: string;
  filePath: string;
}

export interface ImageKitTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "jpg" | "png" | "webp" | "auto";
  crop?: "at_max" | "force" | "at_max_enlarge" | "at_least" | "maintain_ratio";
}
