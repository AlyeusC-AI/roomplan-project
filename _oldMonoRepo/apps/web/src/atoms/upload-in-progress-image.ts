import { create } from "zustand";

type State = { images: ImageUploadInProgressData[] };
interface Actions {
  addImages: (images: ImageUploadInProgressData[]) => void;
  clearImages: () => void;
  removeImage: (imageName: string) => void;
}

export const uploadInProgressImagesStore = create<State & Actions>((set) => ({
  images: [],
  addImages: (images: ImageUploadInProgressData[]) =>
    set((state) => ({ images: state.images.concat(images) })),
  clearImages: () => set(() => ({ images: [] })),
  removeImage: (imageName: string) =>
    set((state) => ({
      images: state.images.filter((i) => i.name !== imageName),
    })),
}));
