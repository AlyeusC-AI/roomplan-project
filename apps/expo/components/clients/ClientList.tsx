import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  SectionList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Plus } from 'lucide-react-native';
import { projectsStore } from '@/lib/state/projects';

interface Client {
  publicId: string;
  name: string;
  email?: string;
  phone1?: string;
}

interface Section {
  title: string;
  data: Client[];
}

interface ClientListProps {
  hideBackButton?: boolean;
  onClientPress?: (client: Client) => void;
}

export default function ClientList({ hideBackButton = false, onClientPress }: ClientListProps) {
  const router = useRouter();
  const { projects } = projectsStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }
    
    const query = searchQuery.toLowerCase();
    return projects.filter(client => 
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);
  
  // Group clients by first letter
  const sections = useMemo(() => {
    const grouped: Record<string, Client[]> = {};
    
    filteredClients.forEach(client => {
      const firstLetter = client.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(client);
    });
    
    // Convert the grouped object to an array of sections
    return Object.keys(grouped)
      .sort()
      .map(key => ({
        title: key,
        data: grouped[key].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredClients]);
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleAddClient = () => {
    router.push('/clients/new');
  };
  
  const handleClientPress = (client: Client) => {
    if (onClientPress) {
      onClientPress(client);
    } else {
      router.push(`/clients/${client.publicId}`);
    }
  };
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
  
  const scrollToSection = (letter: string) => {
    // Implementation would depend on the refs setup
    // Typically requires setting refs for each section
  };
  
  return (
    <View style={styles.containerFull}>
      {!hideBackButton && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ChevronLeft color="#4CAF50" size={24} />
            <Text style={styles.backButtonText}>Edit Client</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Clients</Text>
          
          <View style={styles.headerRightContainer}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell color="#4CAF50" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleAddClient}>
              <Plus color="#4CAF50" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      <View style={styles.container}>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.publicId}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.clientItem}
              onPress={() => handleClientPress(item)}
            >
              <Text style={styles.clientName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled={false}
        />
        
        <View style={styles.alphabetList}>
          {alphabet.map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.letterButton}
              onPress={() => scrollToSection(letter)}
            >
              <Text style={styles.letterText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerFull: {
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
  headerRightContainer: {
    flexDirection: 'row',
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
  headerButton: {
    marginLeft: 16,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clientItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clientName: {
    fontSize: 16,
  },
  alphabetList: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  letterButton: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  letterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
}); 