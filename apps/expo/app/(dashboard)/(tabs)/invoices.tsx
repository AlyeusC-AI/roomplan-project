import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";

import InvoiceList from "@/components/invoices/InvoiceList";
import CreateNewInvoice from "@/components/invoices/CreateNewInvoice";

export default function InvoiceScreen() {
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);

  const handleNewInvoice = () => {
    setIsCreatingNewInvoice(true);
  };

  const handleCloseModal = () => {
    setIsCreatingNewInvoice(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <InvoiceList onNewInvoice={handleNewInvoice} />

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
