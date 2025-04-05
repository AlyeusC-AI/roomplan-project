import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2, Edit2 } from 'lucide-react-native';
import { invoicesStore, SavedLineItem } from '@/lib/state/invoices';
import {
  getSavedLineItems,
  createSavedLineItem,
  updateSavedLineItem,
  deleteSavedLineItem,
} from '@/lib/api/savedLineItems';
import { showToast } from '@/utils/toast';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';

export default function SavedLineItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedLineItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const { savedLineItems, setSavedLineItems, addSavedLineItem, updateSavedLineItem: updateStoreItem, removeSavedLineItem } = invoicesStore();
  
  const router = useRouter();

  useEffect(() => {
    loadSavedLineItems();
  }, []);

  const loadSavedLineItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getSavedLineItems();
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setSavedLineItems(data);
      }
    } catch (error) {
      showToast(
        'error',
        'Error',
        error instanceof Error ? error.message : 'Failed to load saved line items'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return showToast('error', 'Error', 'Description is required');
    }
    
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum)) {
      return showToast('error', 'Error', 'Rate must be a valid number');
    }
    
    try {
      setIsLoading(true);
      
      if (editingItem) {
        // Update existing item
        const { data, error } = await updateSavedLineItem(
          editingItem.publicId,
          {
            description,
            rate: rateNum,
            category: category || undefined,
          }
        );
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          updateStoreItem(data);
          showToast('success', 'Success', 'Line item updated');
        }
      } else {
        // Create new item
        const { data, error } = await createSavedLineItem(
          description,
          rateNum,
          category || undefined
        );
        
        if (error) {
          throw new Error(error);
        }
        
        if (data) {
          addSavedLineItem(data);
          showToast('success', 'Success', 'Line item saved');
        }
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      showToast(
        'error',
        'Error',
        error instanceof Error ? error.message : 'Failed to save line item'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: SavedLineItem) => {
    setEditingItem(item);
    setDescription(item.description);
    setRate(item.rate.toString());
    setCategory(item.category || '');
    setShowForm(true);
  };

  const handleDelete = async (item: SavedLineItem) => {
    Alert.alert(
      'Delete Line Item',
      'Are you sure you want to delete this line item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              const { error } = await deleteSavedLineItem(item.publicId);
              
              if (error) {
                throw new Error(error);
              }
              
              removeSavedLineItem(item.publicId);
              showToast('success', 'Success', 'Line item deleted');
            } catch (error) {
              showToast(
                'error',
                'Error',
                error instanceof Error ? error.message : 'Failed to delete line item'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setDescription('');
    setRate('');
    setCategory('');
    setEditingItem(null);
    setShowForm(false);
  };

  const categories = Array.from(
    new Set(savedLineItems.map(item => item.category).filter(Boolean))
  );

  const filteredItems = selectedCategory 
    ? savedLineItems.filter(item => item.category === selectedCategory)
    : savedLineItems;

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const itemIds = filteredItems.map(item => item.publicId);
      setSelectedItems(itemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const allSelected = filteredItems.length > 0 && 
    filteredItems.every(item => selectedItems.includes(item.publicId));

  const handleBulkAddToInvoice = () => {
    const selectedItemsData = savedLineItems.filter(item => 
      selectedItems.includes(item.publicId)
    );
    
    showToast(
      'success',
      'Ready to Add',
      `${selectedItemsData.length} items ready to add to invoice`
    );
    
    // Reset selection
    setSelectedItems([]);
    setShowBulkActions(false);
    
    // Optionally navigate to invoice creation
    // router.push('/invoices/create');
  };

  useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const renderItem = ({ item }: { item: SavedLineItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedItems.includes(item.publicId) && styles.checkboxSelected
          ]}
          onPress={() => toggleItemSelection(item.publicId)}
        >
          {selectedItems.includes(item.publicId) && (
            <View style={styles.checkmark} />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.description}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemRate}>${item.rate.toFixed(2)}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.iconButton, styles.editButton]} 
          onPress={() => handleEdit(item)}
        >
          <Edit2 size={16} color="#0284c7" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.iconButton, styles.deleteButton]} 
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && savedLineItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Line Items</Text>
        <Button 
          onPress={() => setShowForm(true)}
          icon={<Plus size={16} color="#ffffff" />}
        >
          Add New
        </Button>
      </View>

      {categories.length > 0 && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Category:</Text>
          <View style={styles.categoryFilters}>
            <TouchableOpacity
              style={[
                styles.categoryFilter,
                selectedCategory === null && styles.selectedFilter,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === null && styles.selectedFilterText,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryFilter,
                  selectedCategory === cat && styles.selectedFilter,
                ]}
                onPress={() => setSelectedCategory(cat as string)}
              >
                <Text
                  style={[
                    styles.categoryFilterText,
                    selectedCategory === cat && styles.selectedFilterText,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {savedLineItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You don't have any saved line items yet.
          </Text>
          <Button onPress={() => setShowForm(true)}>
            Add Your First Line Item
          </Button>
        </View>
      ) : (
        <>
          {showBulkActions && (
            <View style={styles.bulkActions}>
              <Button 
                onPress={handleBulkAddToInvoice}
                variant="secondary"
              >
                Add {selectedItems.length} Items to Invoice
              </Button>
            </View>
          )}

          <View style={styles.selectAllContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                allSelected && styles.checkboxSelected
              ]}
              onPress={() => handleSelectAll(!allSelected)}
            >
              {allSelected && (
                <View style={styles.checkmark} />
              )}
            </TouchableOpacity>
            <Text style={styles.selectAllText}>Select All</Text>
          </View>

          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.publicId}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Line Item' : 'Add New Line Item'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editingItem
                  ? 'Update this line item for reuse in your invoices.'
                  : 'Create a new line item for reuse in your invoices.'}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Web Development - Hourly"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Rate</Text>
              <Input
                value={rate}
                onChangeText={setRate}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category (Optional)</Text>
              <Input
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., Development, Design, Support"
              />
            </View>

            <View style={styles.modalFooter}>
              <Button 
                variant="outline" 
                onPress={resetForm}
                style={styles.footerButton}
              >
                Cancel
              </Button>
              <Button 
                onPress={handleSubmit} 
                disabled={isLoading}
                style={styles.footerButton}
              >
                {editingItem ? 'Update' : 'Save'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRate: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#e6f7ff',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  footerButton: {
    minWidth: 100,
    marginLeft: 10,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: '#0284c7',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectedFilterText: {
    color: '#fff',
  },
  checkboxContainer: {
    marginRight: 10,
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#0284c7',
    backgroundColor: '#0284c7',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  selectAllText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  bulkActions: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
}); 