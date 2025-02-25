import { create } from "zustand";

interface ImageNote {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  imageId: string;
  body: string;
  mentions: any[];
  userId: string;
  User: any;
  isDeleted: boolean;
  severity: number;
}

interface Inference {
  id: string;
  label: string;
  confidence: number;
  bbox: number[];
}

interface ImageQuery_Image {
  id: string;
  publicId: string;
  key: string;
  url: string;
  roomId: string;
  selected: boolean;
  includeInReport: boolean;
  description: string;
  createdAt: string;
  detections: any[];
  ImageNote: ImageNote[];
  Inference: Inference[];
}

interface ImagesStore {
  images: ImageQuery_Image[];
  setImages: (images: ImageQuery_Image[]) => void;
}

export const imagesStore = create<ImagesStore>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
}));
