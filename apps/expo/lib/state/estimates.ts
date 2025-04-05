import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateEstimateStatus } from "@/lib/api/estimates";
import { showToast } from "@/utils/toast";
import { Database } from "@/types/database";
declare global {
  type Estimate = Database["public"]["Tables"]["Estimates"]["Row"] & {
    EstimateItems: EstimateItem[];
  };
  type EstimateItem = Database["public"]["Tables"]["EstimateItems"]["Row"];
}

// Also reexport SavedLineItem from invoices to reuse for estimates
export interface SavedLineItem {
  publicId: string;
  description: string;
  rate: number;
  category?: string;
}

interface EstimatesState {
  estimates: Estimate[];
  totalEstimates: number;
  setEstimates: (estimates: Estimate[], total: number) => void;
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (updated: Estimate) => void;
  removeEstimate: (id: string) => void;
  changeEstimateStatus: (id: string, status: Estimate["status"]) => Promise<void>;
  // Reuse saved line items from invoices store
  savedLineItems: SavedLineItem[];
  setSavedLineItems: (items: SavedLineItem[]) => void;
  addSavedLineItem: (item: SavedLineItem) => void;
  updateSavedLineItem: (item: SavedLineItem) => void;
  removeSavedLineItem: (id: string) => void;
}

export const estimatesStore = create<EstimatesState>()(
  persist(
    (set, get) => ({
      estimates: [],
      totalEstimates: 0,
      savedLineItems: [],
      
      setEstimates: (estimates, total) => set({ estimates, totalEstimates: total }),
      
      addEstimate: (estimate) => 
        set((state) => ({
          estimates: [estimate, ...state.estimates],
          totalEstimates: state.totalEstimates + 1
        })),
      
      updateEstimate: (updated) =>
        set((state) => ({
          estimates: state.estimates.map((estimate) => 
            estimate.publicId === updated.publicId ? updated : estimate
          )
        })),
      
      removeEstimate: (id) =>
        set((state) => ({
          estimates: state.estimates.filter((estimate) => estimate.publicId !== id),
          totalEstimates: state.totalEstimates - 1
        })),
      
      changeEstimateStatus: async (id, status) => {
        try {
          const result = await updateEstimateStatus(id, status);
          
          if (result.error) {
            showToast("error", "Error", result.error);
            return;
          }
          
          if (result.data) {
            set((state) => ({
              estimates: state.estimates.map((estimate) =>
                estimate.publicId === id ? { ...estimate, status } : estimate
              )
            }));
            showToast("success", "Success", `Estimate status updated to ${status}`);
          }
        } catch (error) {
          console.error('Error updating estimate status:', error);
          showToast("error", "Error", 'Failed to update estimate status');
        }
      },
      
      setSavedLineItems: (items) => set({ savedLineItems: items }),
      
      addSavedLineItem: (item) =>
        set((state) => ({
          savedLineItems: [...state.savedLineItems, item]
        })),
      
      updateSavedLineItem: (item) =>
        set((state) => ({
          savedLineItems: state.savedLineItems.map((lineItem) =>
            lineItem.publicId === item.publicId ? item : lineItem
          )
        })),
      
      removeSavedLineItem: (id) =>
        set((state) => ({
          savedLineItems: state.savedLineItems.filter((item) => item.publicId !== id)
        }))
    }),
    {
      name: 'estimates-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
); 