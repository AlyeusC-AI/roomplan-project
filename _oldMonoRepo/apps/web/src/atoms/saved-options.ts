import {
  carrierOptions,
  floorOptions,
  wallOptions,
} from "@components/DesignSystem/CreationSelect/carrierOptions";
import { create } from "zustand";

export const defaultSavedOptionState = {
  carrier: carrierOptions,
  wallMaterial: wallOptions,
  floorMaterial: floorOptions,
};

export interface Option {
  readonly label: string;
  readonly value: string;
  readonly publicId?: string;
}

export type State = {
  carrier: Option[];
  wallMaterial: Option[];
  floorMaterial: Option[];
};

interface Actions {
  createOption: (
    option: Option,
    type: "carrier" | "wallMaterial" | "floorMaterial"
  ) => void;
  deleteOption: (
    option: Option,
    type: "carrier" | "wallMaterial" | "floorMaterial"
  ) => void;
  updateOption: (
    option: Option,
    type: "carrier" | "wallMaterial" | "floorMaterial"
  ) => void;
  setSavedOptions: (options: State) => void;
}

export const savedOptionsStore = create<State & Actions>((set) => ({
  carrier: [],
  wallMaterial: [],
  floorMaterial: [],
  createOption: (option, type) =>
    set((state) => ({ [type]: [...state[type], option] })),
  deleteOption: (option, type) =>
    set((state) => ({
      [type]: state[type].filter((o) => o.value !== option.value),
    })),
  updateOption: (option, type) =>
    set((state) => {
      const index = state[type].findIndex((o) => o.value === option.value);
      state[type][index] = option;
      return state;
    }),
  setSavedOptions: (options) => set(options),
}));

// const savedOptionsState = atom<SavedOptionsState>({
//   key: 'SavedOptionsState',
//   default: defaultSavedOptionState,
// })

// export default savedOptionsState
