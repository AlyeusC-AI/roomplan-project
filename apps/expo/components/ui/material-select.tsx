import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, TextInput, FlatList, StyleSheet } from 'react-native';
import { Text } from './text';
import { ChevronDown, Plus, Search } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import type { MaterialOption } from '@/lib/constants/materialOptions';

interface MaterialSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: MaterialOption[];
  title: string;
  onAddNewOption?: (label: string) => void;
}

export function MaterialSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select material", 
  options,
  title,
  onAddNewOption
}: MaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  
  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNewOption = () => {
    if (newOptionLabel.trim() && onAddNewOption) {
      onAddNewOption(newOptionLabel.trim());
      setNewOptionLabel('');
      setShowAddNew(false);
      setIsOpen(false);
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          "flex-row items-center justify-between",
          "px-3 py-2 rounded-md",
          "bg-background border border-input"
        )}
      >
        <Text className={cn(
          "text-sm",
          value ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-primary">Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search materials..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    value === item.value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />

            {onAddNewOption && (
              <View style={styles.addNewSection}>
                {showAddNew ? (
                  <View style={styles.addNewForm}>
                    <TextInput
                      style={styles.addNewInput}
                      placeholder="Enter material name"
                      value={newOptionLabel}
                      onChangeText={setNewOptionLabel}
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                    <View style={styles.addNewButtons}>
                      <TouchableOpacity 
                        onPress={() => setShowAddNew(false)}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={handleAddNewOption}
                        style={[
                          styles.addButton,
                          !newOptionLabel.trim() && styles.addButtonDisabled
                        ]}
                        disabled={!newOptionLabel.trim()}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addNewButton}
                    onPress={() => setShowAddNew(true)}
                  >
                    <Plus size={20} color="#1e88e5" />
                    <Text style={styles.addNewButtonText}>Add New Material</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#334155',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  selectedOption: {
    backgroundColor: '#f0f9ff',
  },
  optionText: {
    fontSize: 16,
    color: '#334155',
  },
  selectedOptionText: {
    color: '#1e88e5',
    fontWeight: '600',
  },
  addNewSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f9ff',
  },
  addNewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e88e5',
    fontWeight: '500',
  },
  addNewForm: {
    gap: 12,
  },
  addNewInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 16,
    color: '#334155',
  },
  addNewButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#1e88e5',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
}); 