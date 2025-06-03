import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  X,
  Calendar,
  FileText,
  Trash2,
} from "lucide-react-native";
import { showToast } from "@/utils/toast";
import { formatCurrency } from "@/utils/formatters";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  CreateInvoiceItemDto,
  EstimateItem,
  InvoiceItem,
  Project,
  useGetProjects,
  useGetSavedInvoiceItems,
} from "@service-geek/api-client";

interface NewEstimateProps {
  visible: boolean;
  onClose: () => void;
}

// Add action types data
const ACTION_TYPES = [
  { id: "1", name: "Add Vents" },
  { id: "2", name: "Add Shoemolding" },
  { id: "3", name: "Additional Landing" },
  { id: "4", name: "Repair Drywall" },
  { id: "5", name: "Install Flooring" },
  { id: "6", name: "Replace Baseboards" },
  { id: "7", name: "Paint Walls" },
  { id: "8", name: "Replace Ceiling" },
  { id: "9", name: "Remove Water Damage" },
  { id: "10", name: "Mold Remediation" },
  { id: "11", name: "Install Carpet" },
  { id: "12", name: "Replace Fixtures" },
  { id: "13", name: "Plumbing Repairs" },
  { id: "14", name: "Electrical Work" },
  { id: "15", name: "HVAC Service" },
];

export default function NewEstimate({ visible, onClose }: NewEstimateProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [daysValid, setDaysValid] = useState("30");
  const [estimateDate, setEstimateDate] = useState(new Date());
  const [showEstimateDatePicker, setShowEstimateDatePicker] = useState(false);
  const [notes, setNotes] = useState("");

  // Add state for client and adjuster details
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [adjusterName, setAdjusterName] = useState("");
  const [adjusterPhone, setAdjusterPhone] = useState("");
  const [adjusterEmail, setAdjusterEmail] = useState("");

  // Add state for confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projectSearchTerm, setProjectSearchTerm] = useState("");

  const [items, setItems] = useState<CreateInvoiceItemDto[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const [markup, setMarkup] = useState({ show: false, value: 0 });
  const [discount, setDiscount] = useState({ show: false, value: 0 });
  const [deposit, setDeposit] = useState({ show: false, value: 50 });
  const [tax, setTax] = useState({ show: false, value: 0 });

  // Saved line items state
  const [showSavedItems, setShowSavedItems] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const total =
    subtotal +
    (markup.show ? subtotal * (markup.value / 100) : 0) -
    (discount.show ? discount.value : 0) +
    (tax.show ? subtotal * (tax.value / 100) : 0);

  // Add state for new line item flow
  const [showActionSelection, setShowActionSelection] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [actionSearchTerm, setActionSearchTerm] = useState("");
  const [filteredActions, setFilteredActions] = useState(ACTION_TYPES);
  const [selectedAction, setSelectedAction] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newItemDetails, setNewItemDetails] = useState({
    description: "",
    quantity: "1",
    rate: "0",
  });
  // Add state for editing existing line items
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CreateInvoiceItemDto | null>(
    null
  );
  const { data: savedLineItems = [], isLoading: isLoadingSavedItems } =
    useGetSavedInvoiceItems();
  const { data: projectsData } = useGetProjects();
  const projects = projectsData?.data || [];

  const handleAddItem = () => {
    // Reset all values
    setActionSearchTerm("");
    setFilteredActions(ACTION_TYPES);
    setSelectedAction(null);
    setNewItemDetails({
      description: "",
      quantity: "1",
      rate: "0",
    });

    // Show action selection modal
    setShowActionSelection(true);
  };

  const handleSelectAction = (action: { id: string; name: string }) => {
    setSelectedAction(action);
    setNewItemDetails({
      ...newItemDetails,
      description: action.name,
    });
    setShowActionSelection(false);
    setShowItemDetails(true);
  };

  const handleSaveNewItem = () => {
    // Create new item with entered details
    const newItem = {
      description: newItemDetails.description,
      quantity: parseFloat(newItemDetails.quantity) || 1,
      rate: parseFloat(newItemDetails.rate) || 0,
      amount:
        (parseFloat(newItemDetails.quantity) || 1) *
        (parseFloat(newItemDetails.rate) || 0),
    };

    // Add to items array
    setItems([...items, newItem]);

    // Close the modal
    setShowItemDetails(false);

    // Show success toast
    showToast("success", "Success", "Line item added to estimate");
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      showToast("info", "Cannot Remove", "You need at least one line item");
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    // Validate required fields
    if (!projectName) {
      showToast("error", "Missing Project", "Please select a project");
      return;
    }

    if (items.some((item) => !item.description)) {
      showToast("error", "Incomplete Items", "Please complete all line items");
      return;
    }

    // Save logic would go here
    showToast("success", "Success", "Estimate created successfully");
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

  const updateLineItem = (
    index: number,
    field: keyof EstimateItem,
    value: any
  ) => {
    setItems(
      items.map((item) =>
        items.indexOf(item) === index
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

  // Handle opening saved line items modal
  const handleOpenSavedItems = () => {
    setShowSavedItems(true);
  };

  // Add saved line item to estimate
  const handleAddSavedLineItem = (item: CreateInvoiceItemDto) => {
    // Instead of immediately adding the item, pre-populate the edit screen
    setNewItemDetails({
      description: item.description,
      quantity: "1",
      rate: item.rate.toString(),
    });

    // Close the saved items modal
    setShowSavedItems(false);

    // Show the item details confirmation modal
    setShowItemDetails(true);
  };

  // Add all items from a category
  const handleAddAllFromCategory = (category: string) => {
    const itemsToAdd = savedLineItems.filter(
      (item: CreateInvoiceItemDto) =>
        (item.category || "Uncategorized") === category
    );

    if (itemsToAdd.length === 0) return;

    const newItems = itemsToAdd.map((item: CreateInvoiceItemDto) => ({
      description: item.description || "",
      quantity: 1,
      rate: item.rate || 0,
      amount: item.rate || 0,
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
      new Set(
        savedLineItems.map(
          (item: CreateInvoiceItemDto) => item.category || "Uncategorized"
        )
      )
    );
    return cats;
  }, [savedLineItems]);

  // Filter saved line items by selected category
  const filteredSavedItems = React.useMemo(() => {
    if (!selectedCategory) return savedLineItems;
    return savedLineItems.filter(
      (item) => (item.category || "Uncategorized") === selectedCategory
    );
  }, [savedLineItems, selectedCategory]);

  // Add state variables for showing project selection modals
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // Add project search function

  // Handle project selection with confirmation step
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setProjectName(project.name || "");
    setProjectId(project.id || "");

    // Pre-fill client and adjuster info from project
    setClientName(project.clientName || "");
    setClientPhone(project.clientPhoneNumber || "");
    setClientEmail(project.clientEmail || "");
    setAdjusterName(project.adjusterName || "");
    setAdjusterPhone(project.adjusterPhoneNumber || "");
    setAdjusterEmail(project.adjusterEmail || "");

    // Close project picker
    setShowProjectPicker(false);
  };

  // Add action search filter effect
  useEffect(() => {
    if (actionSearchTerm.trim() === "") {
      setFilteredActions(ACTION_TYPES);
      return;
    }

    const searchTermLower = actionSearchTerm.toLowerCase();
    const filtered = ACTION_TYPES.filter((action) =>
      action.name.toLowerCase().includes(searchTermLower)
    );

    setFilteredActions(filtered);
  }, [actionSearchTerm]);

  // Add function to handle line item click for editing
  const handleEditItem = (item: CreateInvoiceItemDto) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  // Add function to save edited item
  const handleSaveEditedItem = () => {
    if (!editingItem) return;

    // Update the item in the items array
    setItems(
      items.map((item, i) => (i === items.indexOf(item) ? editingItem : item))
    );

    // Close the modal
    setShowEditItemModal(false);

    // Show success toast
    showToast("success", "Success", "Line item updated");
  };

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
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.headerButton}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>New Estimate</Text>

              <TouchableOpacity
                onPress={handleSave}
                style={styles.headerButton}
              >
                <Text style={styles.doneButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
              {/* Basic Info Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Basic Information</Text>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity
                    style={styles.dateSelector}
                    onPress={() => setShowEstimateDatePicker(true)}
                  >
                    <View style={styles.inputRow}>
                      <View style={styles.dateValueContainer}>
                        <Text style={styles.dateValue}>
                          {format(estimateDate, "MMM d, yyyy")}
                        </Text>
                        <Calendar color="#0284c7" size={20} />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

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

                {selectedProject && (
                  <View style={styles.projectDetailsContainer}>
                    {/* Project Info */}
                    <View style={styles.projectInfoSection}>
                      <Text style={styles.projectInfoLabel}>
                        Project Details
                      </Text>
                      {selectedProject.location && (
                        <Text style={styles.projectInfoText}>
                          {selectedProject.location}
                        </Text>
                      )}
                    </View>

                    {/* Client Info */}
                    <View style={styles.projectInfoSection}>
                      <Text style={styles.projectInfoLabel}>
                        Client Information
                      </Text>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={clientName}
                          onChangeText={setClientName}
                          placeholder="Client Name"
                        />
                      </View>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput
                          style={styles.textInput}
                          value={clientPhone}
                          onChangeText={setClientPhone}
                          placeholder="Client Phone"
                          keyboardType="phone-pad"
                        />
                      </View>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                          style={styles.textInput}
                          value={clientEmail}
                          onChangeText={setClientEmail}
                          placeholder="Client Email"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Adjuster Info */}
                    <View style={styles.projectInfoSection}>
                      <Text style={styles.projectInfoLabel}>
                        Adjuster Information
                      </Text>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                          style={styles.textInput}
                          value={adjusterName}
                          onChangeText={setAdjusterName}
                          placeholder="Adjuster Name"
                        />
                      </View>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput
                          style={styles.textInput}
                          value={adjusterPhone}
                          onChangeText={setAdjusterPhone}
                          placeholder="Adjuster Phone"
                          keyboardType="phone-pad"
                        />
                      </View>
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                          style={styles.textInput}
                          value={adjusterEmail}
                          onChangeText={setAdjusterEmail}
                          placeholder="Adjuster Email"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Line Items Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Line Items</Text>
                  <View style={styles.itemActionButtons}>
                    <TouchableOpacity onPress={handleOpenSavedItems}>
                      <Text style={styles.savedItemsButton}>Saved Items</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {items.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.lineItemCompact}
                    onPress={() => handleEditItem(item)}
                  >
                    <View style={styles.lineItemContent}>
                      <Text style={styles.lineItemDescription}>
                        {item.description || "No description"}
                      </Text>
                    </View>
                    <View style={styles.lineItemAmount}>
                      <Text style={styles.lineItemAmountText}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddItem}
                >
                  <View style={styles.addIconContainer}>
                    <Plus size={20} color="#fff" />
                  </View>
                  <Text style={styles.addButtonText}>Add Line Item</Text>
                </TouchableOpacity>

                {/* Summary Section */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(subtotal)}
                    </Text>
                  </View>

                  {markup.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Markup ({markup.value}%)
                      </Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency((subtotal * markup.value) / 100)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setMarkup({ ...markup, show: false })}
                      >
                        <X
                          size={18}
                          color="#64748b"
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {!markup.show && (
                    <TouchableOpacity
                      style={styles.summaryRow}
                      onPress={() => setMarkup({ ...markup, show: true })}
                    >
                      <Text style={styles.summaryLabel}>Add Markup</Text>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  )}

                  {markup.show && (
                    <View style={styles.valueAdjusterContainer}>
                      <Text style={styles.valueAdjusterLabel}>
                        Markup Percentage
                      </Text>
                      <View style={styles.valueAdjuster}>
                        <TextInput
                          style={styles.valueAdjusterInput}
                          value={markup.value.toString()}
                          onChangeText={(text) =>
                            setMarkup({
                              ...markup,
                              value: parseFloat(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <Text style={styles.valueAdjusterUnit}>%</Text>
                      </View>
                    </View>
                  )}

                  {discount.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <Text style={styles.summaryValue}>
                        -{formatCurrency(discount.value)}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setDiscount({ ...discount, show: false })
                        }
                      >
                        <X
                          size={18}
                          color="#64748b"
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {!discount.show && (
                    <TouchableOpacity
                      style={styles.summaryRow}
                      onPress={() => setDiscount({ ...discount, show: true })}
                    >
                      <Text style={styles.summaryLabel}>Add Discount</Text>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  )}

                  {discount.show && (
                    <View style={styles.valueAdjusterContainer}>
                      <Text style={styles.valueAdjusterLabel}>
                        Discount Amount
                      </Text>
                      <View style={styles.valueAdjuster}>
                        <Text style={styles.valueAdjusterUnit}>$</Text>
                        <TextInput
                          style={styles.valueAdjusterInput}
                          value={discount.value.toString()}
                          onChangeText={(text) =>
                            setDiscount({
                              ...discount,
                              value: parseFloat(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                          placeholder="0.00"
                        />
                      </View>
                    </View>
                  )}

                  {tax.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Tax ({tax.value}%)
                      </Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency((subtotal * tax.value) / 100)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setTax({ ...tax, show: false })}
                      >
                        <X
                          size={18}
                          color="#64748b"
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {!tax.show && (
                    <TouchableOpacity
                      style={styles.summaryRow}
                      onPress={() => setTax({ ...tax, show: true })}
                    >
                      <Text style={styles.summaryLabel}>Add Tax</Text>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  )}

                  {tax.show && (
                    <View style={styles.valueAdjusterContainer}>
                      <Text style={styles.valueAdjusterLabel}>Tax Rate</Text>
                      <View style={styles.valueAdjuster}>
                        <TextInput
                          style={styles.valueAdjusterInput}
                          value={tax.value.toString()}
                          onChangeText={(text) =>
                            setTax({ ...tax, value: parseFloat(text) || 0 })
                          }
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <Text style={styles.valueAdjusterUnit}>%</Text>
                      </View>
                    </View>
                  )}

                  {deposit.show && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Deposit ({deposit.value}%)
                      </Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency((total * deposit.value) / 100)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setDeposit({ ...deposit, show: false })}
                      >
                        <X
                          size={18}
                          color="#64748b"
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {!deposit.show && (
                    <TouchableOpacity
                      style={styles.summaryRow}
                      onPress={() => setDeposit({ ...deposit, show: true })}
                    >
                      <Text style={styles.summaryLabel}>Request a Deposit</Text>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  )}

                  {deposit.show && (
                    <View style={styles.valueAdjusterContainer}>
                      <Text style={styles.valueAdjusterLabel}>
                        Deposit Percentage
                      </Text>
                      <View style={styles.valueAdjuster}>
                        <TextInput
                          style={styles.valueAdjusterInput}
                          value={deposit.value.toString()}
                          onChangeText={(text) =>
                            setDeposit({
                              ...deposit,
                              value: parseFloat(text) || 0,
                            })
                          }
                          keyboardType="numeric"
                          placeholder="50"
                        />
                        <Text style={styles.valueAdjusterUnit}>%</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.summaryRow}
                    onPress={() => {
                      // Logic for adding payment schedule would go here
                      showToast(
                        "info",
                        "Coming Soon",
                        "Payment schedule feature is coming soon"
                      );
                    }}
                  >
                    <Text style={styles.summaryLabel}>Payment Schedule</Text>
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total (USD)</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(total)}
                    </Text>
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
                  {savedLineItems.length === 0 ? (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>
                        You don't have any saved line items yet.
                      </Text>
                      <TouchableOpacity
                        style={styles.emptyStateButton}
                        onPress={() => {
                          setShowSavedItems(false);
                          router.push("/invoices/saved-items");
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
                                selectedCategory === null &&
                                  styles.selectedCategoryChip,
                              ]}
                              onPress={() => setSelectedCategory(null)}
                            >
                              <Text
                                style={[
                                  styles.categoryChipText,
                                  selectedCategory === null &&
                                    styles.selectedCategoryChipText,
                                ]}
                              >
                                All
                              </Text>
                            </TouchableOpacity>

                            {categories.map((category) => (
                              <TouchableOpacity
                                key={category}
                                style={[
                                  styles.categoryChip,
                                  selectedCategory === category &&
                                    styles.selectedCategoryChip,
                                ]}
                                onPress={() => setSelectedCategory(category)}
                              >
                                <Text
                                  style={[
                                    styles.categoryChipText,
                                    selectedCategory === category &&
                                      styles.selectedCategoryChipText,
                                  ]}
                                >
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
                          onPress={() =>
                            handleAddAllFromCategory(selectedCategory)
                          }
                        >
                          <Text style={styles.addAllButtonText}>
                            Add All from {selectedCategory}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <FlatList
                        data={filteredSavedItems}
                        keyExtractor={(item) => item.id}
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

              {/* Add search input for projects */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={projectSearchTerm}
                  onChangeText={setProjectSearchTerm}
                  placeholder="Search by name, address, or client phone"
                  clearButtonMode="while-editing"
                />
              </View>

              <FlatList
                data={projects.filter(
                  (project) =>
                    // Search by project name
                    project.name
                      ?.toLowerCase()
                      .includes(projectSearchTerm.toLowerCase()) ||
                    // Search by project address
                    project.location
                      ?.toLowerCase()
                      .includes(projectSearchTerm.toLowerCase()) ||
                    // Search by client phone
                    project.clientPhoneNumber?.includes(
                      projectSearchTerm.toLowerCase()
                    )
                )}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.clientItem}
                    onPress={() => handleProjectSelect(item)}
                  >
                    <View style={styles.clientItemContent}>
                      <Text style={styles.clientName}>{item.name}</Text>
                      {item.location && (
                        <Text style={styles.clientAddress}>
                          {item.location}
                        </Text>
                      )}
                      {item.clientPhoneNumber && (
                        <Text style={styles.clientPhone}>
                          {item.clientPhoneNumber}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      {projectSearchTerm.length > 0
                        ? `No projects found matching "${projectSearchTerm}"`
                        : "No projects found."}
                    </Text>
                  </View>
                )}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        visible={showItemDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowItemDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.savedItemsModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.savedItemsHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowItemDetails(false);
                    setShowActionSelection(true);
                  }}
                  style={styles.headerButton}
                >
                  <ChevronLeft size={24} color="#64748b" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Add Item Details</Text>

                <TouchableOpacity
                  onPress={handleSaveNewItem}
                  style={styles.headerButton}
                >
                  <Text style={styles.doneButton}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemDetailsContainer}>
                <View style={styles.itemDetailsSection}>
                  <Text style={styles.itemDetailsSectionTitle}>
                    Action Type
                  </Text>
                  <View style={styles.selectedActionContainer}>
                    <Text style={styles.selectedActionText}>
                      {selectedAction?.name || "No action selected"}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDetailsSection}>
                  <Text style={styles.itemDetailsSectionTitle}>Details</Text>

                  <View style={styles.detailsInputRow}>
                    <Text style={styles.detailsInputLabel}>Description</Text>
                    <TextInput
                      style={styles.detailsInput}
                      value={newItemDetails.description}
                      onChangeText={(text) =>
                        setNewItemDetails({
                          ...newItemDetails,
                          description: text,
                        })
                      }
                      placeholder="Item description"
                    />
                  </View>

                  <View style={styles.detailsInputRow}>
                    <Text style={styles.detailsInputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.detailsInput}
                      value={newItemDetails.quantity}
                      onChangeText={(text) =>
                        setNewItemDetails({ ...newItemDetails, quantity: text })
                      }
                      keyboardType="numeric"
                      placeholder="1"
                    />
                  </View>

                  <View style={styles.detailsInputRow}>
                    <Text style={styles.detailsInputLabel}>Rate</Text>
                    <TextInput
                      style={styles.detailsInput}
                      value={newItemDetails.rate}
                      onChangeText={(text) =>
                        setNewItemDetails({ ...newItemDetails, rate: text })
                      }
                      keyboardType="numeric"
                      placeholder="0.00"
                    />
                  </View>

                  <View style={styles.detailsInputRow}>
                    <Text style={styles.detailsInputLabel}>Total</Text>
                    <Text style={styles.detailsTotal}>
                      {formatCurrency(
                        (parseFloat(newItemDetails.quantity) || 0) *
                          (parseFloat(newItemDetails.rate) || 0)
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        visible={showEditItemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditItemModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.savedItemsModal}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.savedItemsHeader}>
                <TouchableOpacity
                  onPress={() => setShowEditItemModal(false)}
                  style={styles.headerButton}
                >
                  <X size={24} color="#64748b" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Edit Line Item</Text>

                <TouchableOpacity
                  onPress={handleSaveEditedItem}
                  style={styles.headerButton}
                >
                  <Text style={styles.doneButton}>Save</Text>
                </TouchableOpacity>
              </View>

              {editingItem && (
                <View style={styles.itemDetailsContainer}>
                  <View style={styles.itemDetailsSection}>
                    <Text style={styles.itemDetailsSectionTitle}>
                      Item Details
                    </Text>

                    <View style={styles.detailsInputRow}>
                      <Text style={styles.detailsInputLabel}>Description</Text>
                      <TextInput
                        style={styles.detailsInput}
                        value={editingItem.description}
                        onChangeText={(text) =>
                          setEditingItem({
                            ...editingItem,
                            description: text,
                          })
                        }
                        placeholder="Item description"
                      />
                    </View>

                    <View style={styles.detailsInputRow}>
                      <Text style={styles.detailsInputLabel}>Quantity</Text>
                      <TextInput
                        style={styles.detailsInput}
                        value={editingItem.quantity.toString()}
                        onChangeText={(text) => {
                          const quantity = parseFloat(text) || 0;
                          setEditingItem({
                            ...editingItem,
                            quantity,
                            amount: quantity * editingItem.rate,
                          });
                        }}
                        keyboardType="numeric"
                        placeholder="1"
                      />
                    </View>

                    <View style={styles.detailsInputRow}>
                      <Text style={styles.detailsInputLabel}>Rate</Text>
                      <TextInput
                        style={styles.detailsInput}
                        value={editingItem.rate.toString()}
                        onChangeText={(text) => {
                          const rate = parseFloat(text) || 0;
                          setEditingItem({
                            ...editingItem,
                            rate,
                            amount: editingItem.quantity * rate,
                          });
                        }}
                        keyboardType="numeric"
                        placeholder="0.00"
                      />
                    </View>

                    <View style={styles.detailsInputRow}>
                      <Text style={styles.detailsInputLabel}>Total</Text>
                      <Text style={styles.detailsTotal}>
                        {formatCurrency(editingItem.amount)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteItemButton}
                      onPress={() => {
                        handleRemoveItem(editingItem.id);
                        setShowEditItemModal(false);
                      }}
                    >
                      <Trash2 size={20} color="#ef4444" />
                      <Text style={styles.deleteItemText}>Delete Item</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  cancelButton: {
    fontSize: 16,
    color: "#888",
  },
  doneButton: {
    fontSize: 16,
    color: "#0284c7",
    fontWeight: "600",
    textAlign: "right",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 15,
  },
  organizeText: {
    fontSize: 16,
    color: "#0284c7",
  },
  clientSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addClientText: {
    flex: 1,
    fontSize: 16,
    color: "#0284c7",
  },
  toggleContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 16,
    color: "#000",
  },
  eliteTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 10,
  },
  eliteText: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
  },
  toggle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 15,
  },
  addItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addItemText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  summaryContainer: {
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 15,
    marginTop: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#000",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  addText: {
    fontSize: 16,
    color: "#0284c7",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  inputLabel: {
    fontSize: 16,
    color: "#000",
  },
  textInput: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    minWidth: 120,
  },
  dateSelector: {
    width: "100%",
  },
  dateValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  lineItemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  lineItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  lineItemNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  removeButton: {
    padding: 5,
  },
  lineItemRow: {
    marginBottom: 10,
  },
  lineItemLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  lineItemInput: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
  },
  lineItemInputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  halfInput: {
    width: "48%",
  },
  lineItemAmount: {
    alignItems: "flex-end",
  },
  lineItemAmountText: {
    fontSize: 16,
    fontWeight: "500",
  },
  notesContainer: {
    padding: 15,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  itemActionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedItemsButton: {
    fontSize: 16,
    color: "#0284c7",
    marginRight: 15,
  },
  savedItemsModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  savedItemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#64748b",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoriesScrollView: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: "#0284c7",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#64748b",
  },
  selectedCategoryChipText: {
    color: "#fff",
    fontWeight: "500",
  },
  addAllButton: {
    margin: 15,
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addAllButtonText: {
    color: "#0284c7",
    fontWeight: "500",
  },
  savedItemsList: {
    padding: 15,
  },
  savedItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },
  savedItemDetails: {
    flex: 1,
  },
  savedItemDescription: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
  },
  savedItemCategory: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  savedItemCategoryText: {
    fontSize: 12,
    color: "#64748b",
  },
  savedItemRate: {
    flexDirection: "row",
    alignItems: "center",
  },
  savedItemRateText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  clientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "500",
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  searchInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  clientItemContent: {
    flex: 1,
  },
  clientAddress: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  // Confirmation modal styles
  confirmationContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  confirmationSection: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 15,
  },
  confirmationSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  confirmationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  confirmationLabel: {
    width: 80,
    fontSize: 15,
    color: "#64748b",
  },
  confirmationValue: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  confirmationTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    padding: 0,
  },
  // Action selection styles
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  actionName: {
    fontSize: 16,
    color: "#0f172a",
  },

  // Item details styles
  itemDetailsContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  itemDetailsSection: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 15,
  },
  itemDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  selectedActionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  selectedActionText: {
    fontSize: 16,
    color: "#0f172a",
  },
  detailsInputRow: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  detailsInputLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  detailsInput: {
    fontSize: 16,
    color: "#0f172a",
  },
  detailsTotal: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  lineItemCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  lineItemContent: {
    flex: 1,
  },
  lineItemDescription: {
    fontSize: 16,
    color: "#0f172a",
  },
  lineItemDetails: {
    fontSize: 14,
    color: "#64748b",
  },
  addButton: {
    margin: 15,
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addButtonText: {
    color: "#0f172a",
    fontWeight: "500",
  },
  deleteItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 15,
  },
  deleteItemText: {
    color: "#ef4444",
    fontWeight: "500",
    marginLeft: 8,
  },
  valueAdjusterContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  valueAdjusterLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  valueAdjuster: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueAdjusterInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  valueAdjusterUnit: {
    fontSize: 16,
    color: "#64748b",
    marginHorizontal: 8,
  },
  projectDetailsContainer: {
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginTop: 10,
  },
  projectInfoSection: {
    marginBottom: 20,
  },
  projectInfoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 10,
  },
  projectInfoText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
});
