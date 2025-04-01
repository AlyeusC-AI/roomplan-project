import React from 'react';
import { SafeAreaView } from 'react-native';
import SelectClient from '@/components/clients/SelectClient';

export default function SelectClientPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SelectClient />
    </SafeAreaView>
  );
} 