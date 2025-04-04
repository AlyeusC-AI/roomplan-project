import React from 'react';
import { SafeAreaView } from 'react-native';
import NewEstimate from '@/components/estimates/NewEstimate';

export default function NewEstimatePage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NewEstimate />
    </SafeAreaView>
  );
} 