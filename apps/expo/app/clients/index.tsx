import React from 'react';
import { SafeAreaView } from 'react-native';
import ClientList from '@/components/clients/ClientList';

export default function Clients() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ClientList />
    </SafeAreaView>
  );
} 