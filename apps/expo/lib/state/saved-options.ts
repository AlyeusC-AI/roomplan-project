import { create } from 'zustand';
import { wallOptions, floorOptions } from '@/lib/constants/materialOptions';
import type { MaterialOption } from '@/lib/constants/materialOptions';

export const defaultSavedOptionState = {
  wallMaterial: wallOptions,
  floorMaterial: floorOptions,
};

export type SavedOptionType = 'wallMaterial' | 'floorMaterial';

export type State = {
  wallMaterial: MaterialOption[];
  floorMaterial: MaterialOption[];
};

interface Actions {
  createOption: (option: MaterialOption, type: SavedOptionType) => void;
  deleteOption: (option: MaterialOption, type: SavedOptionType) => void;
  updateOption: (option: MaterialOption, type: SavedOptionType) => void;
  setSavedOptions: (options: State) => void;
}

export const savedOptionsStore = create<State & Actions>((set) => ({
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