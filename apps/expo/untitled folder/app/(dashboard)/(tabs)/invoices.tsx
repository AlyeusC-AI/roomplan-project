import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { userStore } from "@/lib/state/user";
import { Redirect } from "expo-router";
import InvoiceList, { InvoiceListRef } from "@/components/invoices/InvoiceList";
import CreateNewInvoice from "@/components/invoices/CreateNewInvoice";

export default function InvoiceScreen() {
  const { session } = userStore((state) => state);
  const [isCreatingNewInvoice, setIsCreatingNewInvoice] = useState(false);
  const invoiceListRef = useRef<InvoiceListRef>(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Invoices' });
  }, [navigation]);

  const handleNewInvoice = () => {
    setIsCreatingNewInvoice(true);
  };

  const handleCloseModal = () => {
    setIsCreatingNewInvoice(false);
    // Refresh the invoice list when the modal is closed
    invoiceListRef.current?.fetchInvoiceData();
  };

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <InvoiceList 
        ref={invoiceListRef}
        handleNewInvoice={handleNewInvoice} 
      />
      
      <CreateNewInvoice
        visible={isCreatingNewInvoice}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
}); 