import { create } from "zustand";

type State = { summary: Record<string, number> };
interface Actions {
  clearUploadSummary: () => void;
  incrementUploadSummary: (roomName: string) => void;
}

export const uploadSummaryStore = create<State & Actions>((set) => ({
  summary: {},
  incrementUploadSummary: (roomName: string) =>
    set((state) => {
      const draft = state.summary;

      if (state.summary[roomName]) {
        draft[roomName] = draft[roomName] + 1;
      } else {
        draft[roomName] = 1;
      }

      return draft;
    }),
  clearUploadSummary: () => set(() => ({ summary: {} })),
}));
