import { RoomData } from "@servicegeek/db/queries/project/getProjectDetections";
import { create } from "zustand";

// export const defaultInferencesState = []

// const inferencesState = atom<RoomData[]>({
//   key: 'InferencesState',
//   default: defaultInferencesState,
// })

// export default inferencesState

interface State {
  inferences: RoomData[];
}

interface Actions {
  setInferences: (inferences: RoomData[]) => void;
  addInference: (inference: RoomData) => void;
}

export const inferencesStore = create<State & Actions>((set) => ({
  inferences: [],
  setInferences: (inferences: RoomData[]) => set({ inferences }),
  addInference: (inference: RoomData) =>
    set((state) => ({ inferences: [...state.inferences, inference] })),
}));
