import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateInvoiceStatus } from "@/lib/api/invoices";
import { showToast } from "@/utils/toast";

export interface Invoice {
  id: string;
  publicId: string;
  number: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  projectId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  createdAt: string;
  dueDate: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface State {
  invoices: Invoice[];
  totalInvoices: number;
}

interface Actions {
  addInvoice: (invoice: Invoice) => void;
  addInvoices: (invoices: Invoice[]) => void;
  removeInvoice: (id: string) => void;
  setInvoices: (invoices: Invoice[], total: number) => void;
  updateInvoice: (invoice: Partial<Invoice>) => void;
  handleUpdateStatus: (invoiceId: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => Promise<void>;
}

export const invoicesStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      invoices: [],
      totalInvoices: 0,
      addInvoice: (invoice) =>
        set((state) => ({ invoices: [...state.invoices, invoice] })),
      addInvoices: (invoices) =>
        set((state) => ({ invoices: [...state.invoices, ...invoices] })),
      removeInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((i) => i.publicId !== id),
        })),
      setInvoices: (invoices, total) =>
        set(() => ({ invoices, totalInvoices: total })),
      updateInvoice: (invoice) =>
        set((state) => ({
          invoices: state.invoices.map((i) =>
            i.publicId === invoice.publicId ? { ...i, ...invoice } : i
          ),
        })),
      handleUpdateStatus: async (invoiceId, newStatus) => {
        try {
          const result = await updateInvoiceStatus(invoiceId, newStatus);
          
          if (result.error) {
            showToast({
              message: result.error,
              type: 'error'
            });
            return;
          }
          
          if (result.data) {
            // Update the invoice in our local store
            get().updateInvoice({
              publicId: invoiceId,
              status: newStatus
            });
            
            showToast({
              message: `Invoice status updated to ${newStatus}`,
              type: 'success'
            });
          }
        } catch (error) {
          console.error("Error updating invoice status:", error);
          showToast({
            message: "Failed to update invoice status",
            type: 'error'
          });
        }
      }
    }),
    {
      name: "invoices",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 