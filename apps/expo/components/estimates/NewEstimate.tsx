import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { Plus, ChevronRight, ChevronLeft, X, Calendar, FileText, Trash2 } from 'lucide-react-native';
import { projectsStore } from '@/lib/state/projects';
import { invoicesStore, SavedLineItem } from '@/lib/state/invoices';
import { showToast } from '@/utils/toast';
import { formatCurrency } from '@/utils/formatters';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { getSavedLineItems } from '@/lib/api/savedLineItems';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface NewEstimateProps {
  visible: boolean;
  onClose: () => void;
}

export default function NewEstimate({ visible, onClose }: NewEstimateProps) {
  const router = useRouter();
  const [estimateNumber, setEstimateNumber] = useState(`EST-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [projectName, setProjectName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [daysValid, setDaysValid] = useState('30');
  const [estimateDate, setEstimateDate] = useState(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [showEstimateDatePicker, setShowEstimateDatePicker] = useState(false);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<EstimateItem[]>([
    { id: uuidv4(), description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [groupItemsIntoSections, setGroupItemsIntoSections] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [markup, setMarkup] = useState({ show: false, value: 0 });
  const [discount, setDiscount] = useState({ show: false, value: 0 });
  const [deposit, setDeposit] = useState({ show: false, value: 50 });
  const [tax, setTax] = useState({ show: false, value: 0 });
  
  // Saved line items state
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [localSavedLineItems, setLocalSavedLineItems] = useState<SavedLineItem[]>([]);
  const [isLoadingSavedItems, setIsLoadingSavedItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { projects } = projectsStore((state) => state);
  const { savedLineItems } = invoicesStore((state) => state);
  
  // Calculate totals whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    setSubtotal(total);
  }, [items]);
  
  // Calculate expiry date based on days valid
  useEffect(() => {
    if (estimateDate && daysValid) {
      const expire = new Date(estimateDate);
      expire.setDate(expire.getDate() + parseInt(daysValid || "0"));
      setExpiryDate(expire);
    }
  }, [estimateDate, daysValid]);
  
  const total = subtotal + 
    (markup.show ? subtotal * (markup.value / 100) : 0) - 
    (discount.show ? discount.value : 0) +
    (tax.show ? subtotal * (tax.value / 100) : 0);
    
  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, rate: 0, amount: 0 }]);
  };
  
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      showToast('info', 'Cannot Remove', 'You need at least one line item');
    }
  };
  
  const handleCancel = () => {
    onClose();
  };
  
  const handleSave = () => {
    // Validate required fields
    if (!projectName) {
      showToast('error', 'Missing Project', 'Please select a project');
      return;
    }
    
    if (items.some(item => !item.description)) {
      showToast('error', 'Incomplete Items', 'Please complete all line items');
      return;
    }
    
    // Save logic would go here
    showToast('success', 'Success', 'Estimate created successfully');
    onClose();
  };
  
  const handleSelectProject = () => {
    setShowProjectPicker(true);
  };

  const handleEstimateDateChange = (event: any, selectedDate?: Date) => {
    setShowEstimateDatePicker(false);
    if (selectedDate) {
      setEstimateDate(selectedDate);
    }
  };

  const updateLineItem = (id: string, field: keyof EstimateItem, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              amount:
                field === "rate"
                  ? value * item.quantity
                  : field === "quantity"
                    ? item.rate * value
                    : item.amount,
            }
          : item
      )
    );
  };
  
  // Load saved line items
  const fetchSavedLineItems = async () => {
    setIsLoadingSavedItems(true);
    try {
      const { data, error } = await getSavedLineItems();
      
      if (error) {
        throw new Error(error);
      }
      
      if (data) {
        setLocalSavedLineItems(data);
      }
    } catch (error) {
      showToast(
        'error',
        'Error',
        error instanceof Error ? error.message : 'Failed to load saved line items'
      );
    } finally {
      setIsLoadingSavedItems(false);
    }
  };
  
  // Handle opening saved line items modal
  const handleOpenSavedItems = () => {
    fetchSavedLineItems();
    setShowSavedItems(true);
  };
  
  // Add saved line item to estimate
  const handleAddSavedLineItem = (item: SavedLineItem) => {
    const newItem = {
      id: uuidv4(),
      description: item.description,
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    };
    
    setItems([...items, newItem]);
    setShowSavedItems(false);
    
    showToast(
      "success",
      "Success",
      "Line item added to estimate"
    );
  };
  
  // Add all items from a category
  const handleAddAllFromCategory = (category: string) => {
    const itemsToAdd = localSavedLineItems.filter(
      item => (item.category || 'Uncategorized') === category
    );
    
    if (itemsToAdd.length === 0) return;
    
    const newItems = itemsToAdd.map(item => ({
      id: uuidv4(),
      description: item.description,
      quantity: 1,
      rate: item.rate,
      amount: item.rate
    }));
    
    setItems([...items, ...newItems]);
    setShowSavedItems(false);
    
    showToast(
      "success",
      "Success",
      `Added ${itemsToAdd.length} items from ${category}`
    );
  };
  
  // Get unique categories from saved line items
  const categories = React.useMemo(() => {
    const cats = Array.from(
      new Set(localSavedLineItems.map(item => item.category || 'Uncategorized'))
    );
    return cats;
  }, [localSavedLineItems]);
  
  // Filter saved line items by selected category
  const filteredSavedItems = React.useMemo(() => {
    if (!selectedCategory) return localSavedLineItems;
    return localSavedLineItems.filter(
      item => (item.category || 'Uncategorized') === selectedCategory
    );
  }, [localSavedLineItems, selectedCategory]);
  
  // Add state variables for showing project selection modals
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>New Estimate</Text>
              
              <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                <Text style={styles.doneButton}>Save</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.container}>
              {/* Basic Info Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Basic Information</Text>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Estimate #</Text>
                  <TextInput
                    style={styles.textInput}
                    value={estimateNumber}
                    onChangeText={setEstimateNumber}
                    placeholder="EST-000"
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.dateSelector} 
                  onPress={() => setShowEstimateDatePicker(true)}
                >
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <View style={styles.dateValueContainer}>
                      <Text style={styles.dateValue}>
                        {format(estimateDate, 'MMM d, yyyy')}
                      </Text>
                      <Calendar color="#0284c7" size={20} />
                    </View>
                  </View>
                </TouchableOpacity>
                
                {showEstimateDatePicker && (
                  <DateTimePicker
                    value={estimateDate}
                    mode="date"
                    display="default"
                    onChange={handleEstimateDateChange}
                  />
                )}
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Valid for (days)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={daysValid}
                    onChangeText={setDaysValid}
                    keyboardType="number-pad"
                    placeholder="30"
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <Text style={styles.dateValue}>
                    {expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'Not set'}
                  </Text>
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>PO Number</Text>
                  <TextInput
                    style={styles.textInput}
                    value={poNumber}
                    onChangeText={setPoNumber}
                    placeholder="Optional"
                  />
                </View>
              </View>
              
              {/* Project Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Project</Text>
                <TouchableOpacity 
                  style={styles.clientSelector} 
                  onPress={handleSelectProject}
                >
                  <View style={styles.addIcon}>
                    <Plus color="#fff" size={24} />
                  </View>
                  <Text style={styles.addClientText}>
                    {projectName ? projectName : "Add Project"}
                  </Text>
                  <ChevronRight color="#888" size={20} />
                </TouchableOpacity>
              </View>
              
              {/* Line Items Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Line Items</Text>
                  <View style={styles.itemActionButtons}>
                    <TouchableOpacity onPress={handleOpenSavedItems}>
                      <Text style={styles.savedItemsButton}>Saved Items</Text>
                    </TouchableOpacity>
                    <Text style={styles.organizeText}>Organize</Text>
                  </View>
                </View>
                
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleRow}>
                    <Text style={styles.toggleText}>Group Items into Sections</Text>
                    <View style={styles.eliteTag}>
                      <Text style={styles.eliteText}>ELITE</Text>
                    </View>
                    <Switch
                      value={groupItemsIntoSections}
                      onValueChange={setGroupItemsIntoSections}
                      trackColor={{ false: '#d4d4d4', true: '#e4e4e4' }}
                      thumbColor={groupItemsIntoSections ? '#ffffff' : '#ffffff'}
                      ios_backgroundColor="#d4d4d4"
                      style={styles.toggle}
                    />
                  </View>
                </View>
                
                {items.map((item, index) => (
                  <View key={item.id} style={styles.lineItemContainer}>
                    <View style={styles.lineItemHeader}>
                      <Text style={styles.lineItemNumber}>Item {index + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => handleRemoveItem(item.id)}
                        style={styles.removeButton}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.lineItemRow}>
                      <Text style={styles.lineItemLabel}>Description</Text>
                      <TextInput
                        style={styles.lineItemInput}
                        value={item.description}
                        onChangeText={(text) => updateLineItem(item.id, "description", text)}
                        placeholder="Item description"
                      />
                    </View>
                    
                    <View style={styles.lineItemInputRow}>
                      <View style={styles.halfInput}>
                        <Text style={styles.lineItemLabel}>Rate</Text>
                        <TextInput
                          style={styles.lineItemInput}
                          value={item.rate.toString()}
                          onChangeText={(text) => updateLineItem(item.id, "rate", parseFloat(text) || 0)}
                          keyboardType="numeric"
                          placeholder="0.00"
                        />
                      </View>
                      
                      <View style={styles.halfInput}>
                        <Text style={styles.lineItemLabel}>Quantity</Text>
                        <TextInput
                          style={styles.lineItemInput}
                          value={item.quantity.toString()}
                          onChangeText={(text) => updateLineItem(item.id, "quantity", parseFloat(text) || 0)}
                          keyboardType="numeric"
                          placeholder="1"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.lineItemAmount}>
                      <Text style={styles.lineItemLabel}>Amount</Text>
                      <Text style={styles.lineItemAmountText}>{formatCurrency(item.rate * item.quantity)}</Text>
                    </View>
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={styles.addItemButton} 
                  onPress={handleAddItem}
                >
                  <View style={styles.addItemIcon}>
                    <Plus color="#fff" size={24} />
                  </View>
                  <Text style={styles.addItemText}>Add Line Item</Text>
                  <ChevronRight color="#888" size={20} />
                </TouchableOpacity>
                
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                  </View>
                  
                  {markup.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Markup</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(subtotal * markup.value / 100)}</Text>
                      <ChevronRight color="#888" size={20} />
                    </View>
                  )}
                  
                  {discount.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(discount.value)}</Text>
                      <ChevronRight color="#888" size={20} />
                    </View>
                  )}
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Request a Deposit</Text>
                    <Text style={styles.addText}>Add</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Schedule</Text>
                    <Text style={styles.addText}>Add</Text>
                  </View>
                  
                  {tax.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tax</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(subtotal * tax.value / 100)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total (USD)</Text>
                    <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                  </View>
                </View>
              </View>
              
              {/* Notes Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Notes</Text>
                </View>
                <View style={styles.notesContainer}>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Add notes for your client..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
      
      {/* Saved Line Items Modal */}
      <Modal
        visible={showSavedItems}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSavedItems(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.savedItemsModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.savedItemsHeader}>
                <TouchableOpacity 
                  onPress={() => setShowSavedItems(false)}
                  style={styles.headerButton}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Saved Line Items</Text>
                
                <View style={styles.headerButton} />
              </View>
              
              {isLoadingSavedItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0284c7" />
                  <Text style={styles.loadingText}>Loading saved items...</Text>
                </View>
              ) : (
                <>
                  {localSavedLineItems.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>
                        You don't have any saved line items yet.
                      </Text>
                      <TouchableOpacity 
                        style={styles.emptyStateButton}
                        onPress={() => {
                          setShowSavedItems(false);
                          router.push('/invoices/saved-items');
                        }}
                      >
                        <Text style={styles.emptyStateButtonText}>
                          Add Saved Items
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {categories.length > 0 && (
                        <View style={styles.categoriesContainer}>
                          <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesScrollView}
                          >
                            <TouchableOpacity
                              style={[
                                styles.categoryChip,
                                selectedCategory === null && styles.selectedCategoryChip
                              ]}
                              onPress={() => setSelectedCategory(null)}
                            >
                              <Text style={[
                                styles.categoryChipText,
                                selectedCategory === null && styles.selectedCategoryChipText
                              ]}>
                                All
                              </Text>
                            </TouchableOpacity>
                            
                            {categories.map(category => (
                              <TouchableOpacity
                                key={category}
                                style={[
                                  styles.categoryChip,
                                  selectedCategory === category && styles.selectedCategoryChip
                                ]}
                                onPress={() => setSelectedCategory(category)}
                              >
                                <Text style={[
                                  styles.categoryChipText,
                                  selectedCategory === category && styles.selectedCategoryChipText
                                ]}>
                                  {category}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                      
                      {selectedCategory && (
                        <TouchableOpacity
                          style={styles.addAllButton}
                          onPress={() => handleAddAllFromCategory(selectedCategory)}
                        >
                          <Text style={styles.addAllButtonText}>
                            Add All from {selectedCategory}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      <FlatList
                        data={filteredSavedItems}
                        keyExtractor={(item) => item.publicId}
                        contentContainerStyle={styles.savedItemsList}
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.savedItemCard}
                            onPress={() => handleAddSavedLineItem(item)}
                          >
                            <View style={styles.savedItemDetails}>
                              <Text style={styles.savedItemDescription}>
                                {item.description}
                              </Text>
                              {item.category && (
                                <View style={styles.savedItemCategory}>
                                  <Text style={styles.savedItemCategoryText}>
                                    {item.category}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.savedItemRate}>
                              <Text style={styles.savedItemRateText}>
                                {formatCurrency(item.rate)}
                              </Text>
                              <Plus size={16} color="#0284c7" />
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* Project Picker Modal */}
      <Modal
        visible={showProjectPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.savedItemsModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.savedItemsHeader}>
                <TouchableOpacity 
                  onPress={() => setShowProjectPicker(false)}
                  style={styles.headerButton}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Select Project</Text>
                
                <View style={styles.headerButton} />
              </View>
              
              <FlatList
                data={projects}
                keyExtractor={(item) => item.publicId}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.clientItem}
                    onPress={() => {
                      setProjectName(item.name);
                      setProjectId(item.publicId);
                      setShowProjectPicker(false);
                    }}
                  >
                    <Text style={styles.clientName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      No projects found.
                    </Text>
                  </View>
                )}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#888',
  },
  doneButton: {
    fontSize: 16,
    color: '#0284c7',
    fontWeight: '600',
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 15,
  },
  organizeText: {
    fontSize: 16,
    color: '#0284c7',
  },
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addClientText: {
    flex: 1,
    fontSize: 16,
    color: '#0284c7',
  },
  toggleContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 16,
    color: '#000',
  },
  eliteTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  eliteText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  toggle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 15,
  },
  addItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addItemText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  summaryContainer: {
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#000',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  addText: {
    fontSize: 16,
    color: '#0284c7',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    minWidth: 120,
  },
  dateSelector: {
    width: '100%',
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  lineItemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lineItemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  removeButton: {
    padding: 5,
  },
  lineItemRow: {
    marginBottom: 10,
  },
  lineItemLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lineItemInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
  },
  lineItemInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  halfInput: {
    width: '48%',
  },
  lineItemAmount: {
    alignItems: 'flex-end',
  },
  lineItemAmountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesContainer: {
    padding: 15,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  itemActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedItemsButton: {
    fontSize: 16,
    color: '#0284c7',
    marginRight: 15,
  },
  savedItemsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  savedItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748b',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScrollView: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#0284c7',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: '500',
  },
  addAllButton: {
    margin: 15,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addAllButtonText: {
    color: '#0284c7',
    fontWeight: '500',
  },
  savedItemsList: {
    padding: 15,
  },
  savedItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  savedItemDetails: {
    flex: 1,
  },
  savedItemDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  savedItemCategory: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  savedItemCategoryText: {
    fontSize: 12,
    color: '#64748b',
  },
  savedItemRate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedItemRateText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  clientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
  },
});