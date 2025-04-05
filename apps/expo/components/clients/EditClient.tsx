import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { projectsStore } from '@/lib/state/projects';
import { showToast } from '@/utils/toast';
import Button from '@/components/ui/Button';

export default function EditClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { projects, updateProject, addProject } = projectsStore();
  
  const clientId = params.id as string;
  const isNew = !clientId || clientId === 'new';
  
  // Find the client if we're editing an existing one
  const existingClient = isNew ? null : projects.find(c => c.publicId === clientId);
  
  const [name, setName] = useState(existingClient?.name || '');
  const [email, setEmail] = useState(existingClient?.email || '');
  const [phone1, setPhone1] = useState(existingClient?.phone1 || '');
  const [phone2, setPhone2] = useState(existingClient?.phone2 || '');
  
  // Billing address
  const [address1, setAddress1] = useState(existingClient?.billingAddress?.address1 || '');
  const [address2, setAddress2] = useState(existingClient?.billingAddress?.address2 || '');
  const [city, setCity] = useState(existingClient?.billingAddress?.city || '');
  const [state, setState] = useState(existingClient?.billingAddress?.state || '');
  const [zipCode, setZipCode] = useState(existingClient?.billingAddress?.zipCode || '');
  
  // Service address
  const [hasDifferentServiceAddress, setHasDifferentServiceAddress] = useState(
    existingClient?.serviceAddress ? true : false
  );
  const [serviceAddress1, setServiceAddress1] = useState(existingClient?.serviceAddress?.address1 || '');
  const [serviceAddress2, setServiceAddress2] = useState(existingClient?.serviceAddress?.address2 || '');
  const [serviceCity, setServiceCity] = useState(existingClient?.serviceAddress?.city || '');
  const [serviceState, setServiceState] = useState(existingClient?.serviceAddress?.state || '');
  const [serviceZipCode, setServiceZipCode] = useState(existingClient?.serviceAddress?.zipCode || '');
  
  // Notes
  const [notes, setNotes] = useState(existingClient?.notes || '');
  
  const handleBack = () => {
    router.back();
  };
  
  const handleSelectFromContacts = () => {
    // Would navigate to contacts selection
    router.push('/contacts');
  };
  
  const saveClient = () => {
    if (!name.trim()) {
      showToast('error', 'Missing Information', 'Client name is required');
      return;
    }
    
    const clientData = {
      publicId: existingClient?.publicId || `client-${Date.now()}`,
      name,
      email,
      phone1,
      phone2,
      billingAddress: {
        address1,
        address2,
        city,
        state,
        zipCode,
      },
      serviceAddress: hasDifferentServiceAddress ? {
        address1: serviceAddress1,
        address2: serviceAddress2,
        city: serviceCity,
        state: serviceState,
        zipCode: serviceZipCode,
      } : undefined,
      notes,
    };
    
    if (isNew) {
      addProject(clientData);
      showToast('success', 'Success', 'Client added successfully');
    } else {
      updateProject(clientId, clientData);
      showToast('success', 'Success', 'Client updated successfully');
    }
    
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft color="#4CAF50" size={24} />
          <Text style={styles.backButtonText}>New Estimate</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Client</Text>
        
        <TouchableOpacity onPress={saveClient} style={styles.headerButton}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container}>
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.nameInput}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          
          <TouchableOpacity style={styles.contactsButton} onPress={handleSelectFromContacts}>
            <Text style={styles.contactsButtonText}>My Clients</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BASIC INFO</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone #1</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Mobile Number"
              value={phone1}
              onChangeText={setPhone1}
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone #2</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Home Number"
              value={phone2}
              onChangeText={setPhone2}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.billingHeader}>
            <Text style={styles.sectionLabel}>BILLING ADDRESS</Text>
            <Text style={styles.sectionDescription}>Address where the bill will be sent.</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Address #1"
              value={address1}
              onChangeText={setAddress1}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Address #2"
              value={address2}
              onChangeText={setAddress2}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="City"
              value={city}
              onChangeText={setCity}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="State/Province"
              value={state}
              onChangeText={setState}
            />
          </View>
          
          <View style={styles.fieldContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Zip/Postal Code"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              Billing address is different than service address.
            </Text>
            <Switch
              value={hasDifferentServiceAddress}
              onValueChange={setHasDifferentServiceAddress}
              trackColor={{ false: '#d4d4d4', true: '#e4e4e4' }}
              thumbColor={hasDifferentServiceAddress ? '#ffffff' : '#ffffff'}
              ios_backgroundColor="#d4d4d4"
            />
          </View>
        </View>
        
        {hasDifferentServiceAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SERVICE ADDRESS</Text>
            
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Address #1"
                value={serviceAddress1}
                onChangeText={setServiceAddress1}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Address #2"
                value={serviceAddress2}
                onChangeText={setServiceAddress2}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="City"
                value={serviceCity}
                onChangeText={setServiceCity}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="State/Province"
                value={serviceState}
                onChangeText={setServiceState}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Zip/Postal Code"
                value={serviceZipCode}
                onChangeText={setServiceZipCode}
                keyboardType="number-pad"
              />
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRIVATE NOTES</Text>
          
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes visible only to you"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
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
  headerButton: {
    minWidth: 60,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  nameContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    height: 40,
  },
  contactsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contactsButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  billingHeader: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fieldContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  fieldLabel: {
    marginLeft: 16,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  fieldInput: {
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#888',
  },
  addressInput: {
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#888',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 20,
  },
  toggleText: {
    flex: 1,
    fontSize: 16,
    paddingRight: 8,
  },
  notesContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  notesInput: {
    fontSize: 16,
    minHeight: 80,
  },
}); 