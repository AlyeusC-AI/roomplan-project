import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import SavedLineItems from '@/components/invoices/SavedLineItems';

export default function SavedLineItemsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Saved Line Items',
          headerShown: true,
        }}
      />
      <SavedLineItems />
    </>
  );
} 