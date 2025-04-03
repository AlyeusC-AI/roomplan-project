import { create } from "zustand";

interface CameraResult {
  fieldId: string;
  url: string;
  name: string;
  type: string;
  fileId: string;
  filePath: string;
  size: number;
}

interface CameraStore {
  images: CameraResult[];
  addImage: (image: CameraResult) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  fieldId: string | null;
  setFieldId: (fieldId: string | null) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  images: [],
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  removeImage: (index) =>
    set((state) => ({
      images: state.images.filter((_, i) => i !== index),
    })),
  clearImages: () => set({ images: [] }),
  fieldId: null,
  setFieldId: (fieldId) => set({ fieldId }),
}));
