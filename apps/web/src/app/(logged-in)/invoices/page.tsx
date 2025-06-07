import { Metadata } from "next";
import InvoiceList from "@components/Invoices/InvoiceList";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Invoices",
  description: "Manage your invoices and billing",
  icons: ["/favicon.ico"],
};

export default async function Component() {
  return (
    <Suspense>
      <InvoiceList />
    </Suspense>
  );
}
