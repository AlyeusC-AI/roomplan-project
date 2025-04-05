import React from 'react';
import { SafeAreaView } from 'react-native';
import EditClient from '@/components/clients/EditClient';

export default function ClientDetails() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <EditClient />
    </SafeAreaView>
  );
} 