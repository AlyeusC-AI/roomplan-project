import { Image } from "@service-geek/api-client";
import { create } from "zustand";

type State = { images: Image[] };
interface Actions {
  addImages: (images: Image[]) => void;
  clearImages: () => void;
  removeImage: (imageId: string) => void;
}

export const uploadInProgressImagesStore = create<State & Actions>((set) => ({
  images: [],
  addImages: (images: Image[]) =>
    set((state) => ({ images: state.images.concat(images) })),
  clearImages: () => set(() => ({ images: [] })),
  removeImage: (imageId: string) =>
    set((state) => ({
      images: state.images.filter((i) => i.id !== imageId),
    })),
}));
