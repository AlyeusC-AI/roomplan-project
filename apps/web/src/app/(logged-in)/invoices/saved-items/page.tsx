import SavedLineItems from "@/components/Invoices/SavedLineItems";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Line Items - Service Geek",
  description: "Manage your saved invoice line items",
};

export default function SavedLineItemsPage() {
  return <SavedLineItems />;
} 