import { create } from "zustand";
import { persist } from "zustand/middleware";
import { updateEstimateStatus } from "@/services/api/estimates";
import { toast } from "sonner";

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
  loadingEstimates: boolean;
  setEstimates: (estimates: Estimate[], total: number) => void;
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (publicId: string, updates: Partial<Estimate>) => void;
  deleteEstimate: (publicId: string) => void;
  changeEstimateStatus: (
    id: string,
    status: Estimate["status"]
  ) => Promise<void>;
  // Reuse saved line items from invoices store
  savedLineItems: SavedLineItem[];
  setSavedLineItems: (items: SavedLineItem[]) => void;
  addSavedLineItem: (item: SavedLineItem) => void;
  updateSavedLineItem: (item: SavedLineItem) => void;
  removeSavedLineItem: (id: string) => void;
  setLoadingEstimates: (loading: boolean) => void;
}

export const estimatesStore = create<EstimatesState>()(
  persist(
    (set) => ({
      estimates: [],
      totalEstimates: 0,
      loadingEstimates: false,
      savedLineItems: [],

      setEstimates: (estimates, total) =>
        set({ estimates, totalEstimates: total }),

      addEstimate: (estimate) =>
        set((state) => ({
          estimates: [estimate, ...state.estimates],
          totalEstimates: state.totalEstimates + 1,
        })),

      updateEstimate: (publicId, updates) =>
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.publicId === publicId
              ? { ...estimate, ...updates }
              : estimate
          ),
        })),

      deleteEstimate: (publicId) =>
        set((state) => ({
          estimates: state.estimates.filter(
            (estimate) => estimate.publicId !== publicId
          ),
        })),

      changeEstimateStatus: async (id, status) => {
        try {
          const { data, error } = await updateEstimateStatus(id, status);

          if (error) {
            toast.error(error);
            return;
          }

          if (data) {
            set((state) => ({
              estimates: state.estimates.map((estimate) =>
                estimate.publicId === id ? { ...estimate, status } : estimate
              ),
            }));
            toast.success(`Estimate status updated to ${status}`);
          }
        } catch (error) {
          console.error("Error updating estimate status:", error);
          toast.error("Failed to update estimate status");
        }
      },

      setSavedLineItems: (items) => set({ savedLineItems: items }),

      addSavedLineItem: (item) =>
        set((state) => ({
          savedLineItems: [...state.savedLineItems, item],
        })),

      updateSavedLineItem: (item) =>
        set((state) => ({
          savedLineItems: state.savedLineItems.map((lineItem) =>
            lineItem.publicId === item.publicId ? item : lineItem
          ),
        })),

      removeSavedLineItem: (id) =>
        set((state) => ({
          savedLineItems: state.savedLineItems.filter(
            (item) => item.publicId !== id
          ),
        })),

      setLoadingEstimates: (loading) => set({ loadingEstimates: loading }),
    }),
    {
      name: "estimates-storage",
    }
  )
);
