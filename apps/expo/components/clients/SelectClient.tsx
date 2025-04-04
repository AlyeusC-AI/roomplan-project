import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import ClientList from './ClientList';
import { projectsStore } from '@/lib/state/projects';

export default function SelectClient() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { projects } = projectsStore();
  
  // The returnTo parameter tells us where to return after selection
  const returnTo = params.returnTo as string || '/';
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleClientSelected = (clientId: string) => {
    // Send the selected client back to the calling screen
    if (returnTo.includes('?')) {
      router.push(`${returnTo}&selectedClientId=${clientId}`);
    } else {
      router.push(`${returnTo}?selectedClientId=${clientId}`);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft color="#4CAF50" size={24} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Select Client</Text>
        
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.container}>
        <ClientList
          onClientPress={(client) => handleClientSelected(client.publicId)}
          hideBackButton={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  placeholder: {
    width: 60,
  },
  container: {
    flex: 1,
  },
}); 