import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReportSettingsState {
  showDimensionsAndDetails: boolean;
  toggleDimensionsAndDetails: () => void;
}

export const reportSettingsStore = create<ReportSettingsState>()(
  persist(
    (set) => ({
      showDimensionsAndDetails: true,
      toggleDimensionsAndDetails: () => set((state) => ({ showDimensionsAndDetails: !state.showDimensionsAndDetails })),
    }),
    {
      name: 'report-settings',
    }
  )
); 