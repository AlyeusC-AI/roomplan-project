import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReportSettingsState {
  // Visibility controls for different sections
  showDimensionsAndDetails: boolean;
  showTitlePage: boolean;
  showWeatherReporting: boolean;
  showOverviewPhotos: boolean;
  showReadings: boolean;
  showNotes: boolean;
  showAffectedAreas: boolean;
  
  // Toggle functions
  toggleDimensionsAndDetails: () => void;
  toggleTitlePage: () => void;
  toggleWeatherReporting: () => void;
  toggleOverviewPhotos: () => void;
  toggleReadings: () => void;
  toggleNotes: () => void;
  toggleAffectedAreas: () => void;
}

export const reportSettingsStore = create<ReportSettingsState>()(
  persist(
    (set) => ({
      // Default visibility states
      showDimensionsAndDetails: true,
      showTitlePage: true,
      showWeatherReporting: true,
      showOverviewPhotos: true,
      showReadings: true,
      showNotes: true,
      showAffectedAreas: true,

      // Toggle functions
      toggleDimensionsAndDetails: () => set((state) => ({ showDimensionsAndDetails: !state.showDimensionsAndDetails })),
      toggleTitlePage: () => set((state) => ({ showTitlePage: !state.showTitlePage })),
      toggleWeatherReporting: () => set((state) => ({ showWeatherReporting: !state.showWeatherReporting })),
      toggleOverviewPhotos: () => set((state) => ({ showOverviewPhotos: !state.showOverviewPhotos })),
      toggleReadings: () => set((state) => ({ showReadings: !state.showReadings })),
      toggleNotes: () => set((state) => ({ showNotes: !state.showNotes })),
      toggleAffectedAreas: () => set((state) => ({ showAffectedAreas: !state.showAffectedAreas })),
    }),
    {
      name: 'report-settings',
    }
  )
); 