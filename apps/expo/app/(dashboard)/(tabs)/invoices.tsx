import React, { useRef, useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { userStore } from "@/lib/state/user";
import { Redirect } from "expo-router";
import InvoiceList, { InvoiceListRef } from "@/components/invoices/InvoiceList";
import CreateNewInvoice from "@/components/invoices/CreateNewInvoice";

export default function InvoiceScreen() {
  const { session } = userStore((state) => state);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);
  const invoiceListRef = useRef<InvoiceListRef>(null);

  // Redirect to login if not authenticated
  if (!session) {
    console.log("InvoiceScreen: No session, redirecting to login");
    return <Redirect href="/login" />;
  }

  const handleNewInvoice = () => {
    setIsCreatingNewInvoice(true);
  };

  const handleCloseModal = async () => {
    setIsCreatingNewInvoice(false);
    // Refresh invoice list after creating a new invoice
    if (invoiceListRef.current) {
      console.log("InvoiceScreen: Refreshing invoice list");
      await invoiceListRef.current.fetchInvoiceData();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <InvoiceList
        ref={invoiceListRef}
        onNewInvoice={handleNewInvoice}
      />
      
      {isCreatingNewInvoice && (
        <CreateNewInvoice
          visible={isCreatingNewInvoice}
          onClose={handleCloseModal}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
}); 