import React from 'react';
import { SafeAreaView } from 'react-native';
import CreateNewInvoice from '@/components/invoices/CreateNewInvoice';

export default function NewInvoicePage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CreateNewInvoice visible={true} onClose={() => {}} />
    </SafeAreaView>
  );
} 