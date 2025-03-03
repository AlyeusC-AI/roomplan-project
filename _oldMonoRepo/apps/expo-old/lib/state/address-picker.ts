import { create } from "zustand";

interface State {
  address: AddressType | null;
}

interface Actions {
  setAddress: (address: AddressType | null) => void;
}

// Define the store with persistence and partialize
export const addressPickerStore = create<State & Actions>((set) => ({
  address: null,
  setAddress: (address) => set((state) => ({ address: address })),
}));
