import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  SectionList,
  ActionSheetIOS,
  Switch,
  TextInput,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { v4 as uuidv4 } from "uuid";
import { X, Plus, Trash2, Calendar, ChevronRight } from "lucide-react-native";
import { showToast } from "@/utils/toast";
import { formatDate, calculateDueDate } from "@/utils/date";
import { formatCurrency } from "@/utils/formatters";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  CreateInvoiceItemDto,
  useGetProjects,
  useGetSavedInvoiceItems,
  useCreateInvoice,
  Project,
  InvoiceItem,
} from "@service-geek/api-client";

const CreateNewInvoice = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [daysToPay, setDaysToPay] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(
    calculateDueDate(new Date(), 30)
  );
  const [lineItems, setLineItems] = useState<
    (CreateInvoiceItemDto & {
      id: string;
    })[]
  >([{ id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 }]);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [taxRate, setTaxRate] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<
    number | null
  >(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const { data: projectsData } = useGetProjects();
  const { data: savedLineItems, isLoading: isLoadingSavedLineItems } =
    useGetSavedInvoiceItems();
  const projects = projectsData?.data || [];
  const { mutate: createInvoiceMutation } = useCreateInvoice();
  const router = useRouter();

  useEffect(() => {
    // Calculate due date based on days to pay
    if (invoiceDate && daysToPay) {
      const due = calculateDueDate(invoiceDate, parseInt(daysToPay || "0"));
      setDueDate(due);
    }
  }, [invoiceDate, daysToPay]);

  // Replace this useEffect with a memoized calculation
  const lineItemsWithCalculatedAmounts = lineItems.map((item) => ({
    ...item,
    amount: item.rate * item.quantity,
  }));

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const addSavedLineItem = (item: any) => {
    setLineItems([
      ...lineItems,
      {
        id: uuidv4(),
        description: item.description,
        quantity: 1,
        rate: item.rate,
        amount: item.rate,
      },
    ]);
    setShowSavedItems(false);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItemField = (
    id: string,
    field: "description" | "quantity" | "rate",
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item };

          if (field === "description") {
            updatedItem.description = value as string;
          } else if (field === "quantity") {
            const quantity = parseFloat(value as string) || 0;
            updatedItem.quantity = quantity;
            updatedItem.amount = quantity * item.rate;
          } else if (field === "rate") {
            const rate = parseFloat(value as string) || 0;
            updatedItem.rate = rate;
            updatedItem.amount = rate * item.quantity;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return lineItemsWithCalculatedAmounts.reduce(
      (sum, item) => sum + item.amount,
      0
    );
  };

  const calculateMarkup = () => {
    return showMarkup ? calculateSubtotal() * (markupPercentage / 100) : 0;
  };

  const calculateDiscount = () => {
    return showDiscount ? discountAmount : 0;
  };

  const calculateTax = () => {
    const taxableAmount =
      calculateSubtotal() + calculateMarkup() - calculateDiscount();
    return applyTax ? taxableAmount * (taxRate / 100) : 0;
  };

  const calculateTotal = () => {
    return (
      calculateSubtotal() +
      calculateMarkup() -
      calculateDiscount() +
      calculateTax()
    );
  };

  const calculateDeposit = () => {
    return showDeposit ? calculateTotal() * (depositPercentage / 100) : 0;
  };

  const handleProjectSelect = (index: number) => {
    const selectedProject = projects[index];
    if (selectedProject) {
      // Auto-fill project information
      setProjectId(selectedProject.id);
      setProjectName(selectedProject.name);

      // Auto-fill client information if available
      if (selectedProject.clientName) {
        setClientName(selectedProject.clientName);
      }

      if (selectedProject.clientEmail) {
        setClientEmail(selectedProject.clientEmail);
      }

      // Attempt to auto-fill line items if this is a new invoice with empty descriptions
      if (lineItems.length === 1 && !lineItems[0].description) {
        // Add a default item with the project name
        setLineItems([
          {
            id: lineItems[0].id,
            description: `${selectedProject.name} - Professional Services`,
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ]);
      }

      showToast(
        "success",
        "Success",
        "Project details auto-filled successfully"
      );

      setShowProjectPicker(false);
      setSelectedProjectIndex(index);
    }
  };

  const createNewInvoice = async () => {
    if (
      !clientName ||
      !projectName ||
      lineItems.some((item) => !item.description)
    ) {
      showToast("error", "Error", "Please fill in all required fields.");
      return;
    }

    setIsCreating(true);
    try {
      // Prepare the invoice data for API
      const invoiceData = {
        invoice: {
          number: invoiceNumber,
          clientName,
          clientEmail,
          projectPublicId: projectId,
          invoiceDate: invoiceDate.toISOString(),
          dueDate: dueDate.toISOString(),
          subtotal: calculateSubtotal(),
          markup: showMarkup ? markupPercentage : undefined,
          discount: showDiscount ? discountAmount : undefined,
          tax: applyTax ? taxRate : undefined,
          total: calculateTotal(),
          deposit: showDeposit ? depositPercentage : undefined,
          status: "draft" as const,
        },
        invoiceItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      };

      // Call the API service
      const result = await createInvoiceMutation({
        number: invoiceNumber,
        clientName,
        clientEmail,
        projectId,
        poNumber: "",
        terms: "",
        tax: applyTax ? taxRate : undefined,
        deposit: showDeposit ? depositPercentage : undefined,
        markup: showMarkup ? markupPercentage : undefined,
        discount: showDiscount ? discountAmount : undefined,
        notes: "",
        paymentSchedules: [],
        invoiceDate: invoiceDate.toISOString(),
        dueDate: dueDate?.toISOString() || new Date().toISOString(),
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        status: "DRAFT",
        items: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      });

      showToast("success", "Success", "Invoice created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      showToast(
        "error",
        "Error",
        error instanceof Error ? error.message : "Failed to create invoice"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Group saved line items by category
  const groupedItems = useCallback(() => {
    // Extract all unique categories
    const categories = Array.from(
      new Set(savedLineItems?.map((item) => item.category || "Uncategorized"))
    );

    // Create sections for each category
    return categories.map((category) => ({
      title: category,
      data: savedLineItems?.filter(
        (item) => (item.category || "Uncategorized") === category
      ),
    }));
  }, [savedLineItems]);

  // Present category selection action sheet (iOS)
  const showCategoryActionSheet = () => {
    if (Platform.OS === "ios") {
      const categories = [
        "All Categories",
        ...Array.from(
          new Set(
            savedLineItems?.map((item) => item.category || "Uncategorized")
          )
        ),
      ];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...categories, "Cancel"],
          cancelButtonIndex: categories.length,
          title: "Select Category",
        },
        (index) => {
          if (index < categories.length) {
            setSelectedCategory(index === 0 ? null : categories[index]);
          }
        }
      );
    } else {
      // For Android, the filtering happens within the modal interface
      setSelectedCategory(null);
    }
  };

  // Add a function to add all items from a category
  const addAllItemsFromCategory = (category: string) => {
    const itemsToAdd = savedLineItems?.filter(
      (item) => (item.category || "Uncategorized") === category
    );

    if (itemsToAdd?.length === 0) return;

    const newItems = itemsToAdd?.map((item) => ({
      id: uuidv4(),
      description: item.description,
      quantity: 1,
      rate: item.rate,
      amount: item.rate,
    }));

    setLineItems([...lineItems, ...(newItems || [])]);
    setShowSavedItems(false);

    showToast(
      "success",
      "Success",
      `Added ${itemsToAdd?.length || 0} items from ${category}`
    );
  };

  // Add project search function
  // useEffect(() => {
  //   if (projectSearchTerm.trim() === "") {
  //     setFilteredProjects(projects);
  //     return;
  //   }

  //   const searchTermLower = projectSearchTerm.toLowerCase();
  //   const filtered = projects.filter(
  //     (project) =>
  //       // Search by project name
  //       project.name?.toLowerCase().includes(searchTermLower) ||
  //       // Search by project address
  //       project.location?.toLowerCase().includes(searchTermLower) ||
  //       // Search by client phone
  //       project.clientPhoneNumber?.includes(searchTermLower)
  //   );

  //   setFilteredProjects(filtered);
  // }, [projectSearchTerm, projects]);

  if (isCreating) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ActivityIndicator size="large" color="#0284c7" />
            <Text style={styles.modalText}>Creating invoice...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const renderProjectPicker = () => (
    <Modal
      visible={showProjectPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowProjectPicker(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowProjectPicker(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Project</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Add project search input */}
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
                  project.name
                    ?.toLowerCase()
                    .includes(projectSearchTerm.toLowerCase()) ||
                  project.location
                    ?.toLowerCase()
                    .includes(projectSearchTerm.toLowerCase()) ||
                  project.clientPhoneNumber?.includes(projectSearchTerm) ||
                  project.clientEmail?.includes(projectSearchTerm)
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.projectItem}
                  onPress={() => {
                    handleProjectSelect(
                      projects.findIndex((p) => p.id === item.id)
                    );
                    setShowProjectPicker(false);
                  }}
                >
                  <View style={styles.projectItemContent}>
                    <Text style={styles.projectName}>{item.name}</Text>
                    {item.location && (
                      <Text style={styles.projectAddress}>{item.location}</Text>
                    )}
                    {item.clientPhoneNumber && (
                      <Text style={styles.projectPhone}>
                        {item.clientPhoneNumber}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
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
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>New Invoice</Text>

              <TouchableOpacity
                onPress={createNewInvoice}
                style={styles.headerButton}
              >
                <Text style={styles.doneButton}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.container}>
              {/* Basic Info Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Basic Information</Text>

                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => setShowInvoiceDatePicker(true)}
                >
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Date</Text>
                    <View style={styles.dateValueContainer}>
                      <Text style={styles.dateValue}>
                        {format(invoiceDate, "MMM d, yyyy")}
                      </Text>
                      <Calendar color="#0284c7" size={20} />
                    </View>
                  </View>
                </TouchableOpacity>

                {showInvoiceDatePicker && (
                  <DateTimePicker
                    value={invoiceDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowInvoiceDatePicker(false);
                      if (date) setInvoiceDate(date);
                    }}
                  />
                )}

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Days to Pay</Text>
                  <TextInput
                    style={styles.textInput}
                    value={daysToPay}
                    onChangeText={setDaysToPay}
                    keyboardType="number-pad"
                    placeholder="30"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Due Date</Text>
                  <Text style={styles.dateValue}>
                    {format(dueDate, "MMM d, yyyy")}
                  </Text>
                </View>
              </View>

              {/* Project Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Project</Text>
                <TouchableOpacity
                  style={styles.clientSelector}
                  onPress={() => setShowProjectPicker(true)}
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

              {/* Client Section */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Client Information</Text>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Client Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      projectId && clientName
                        ? styles.autofilledTextInput
                        : null,
                    ]}
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="Required"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Client Email</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      projectId && clientEmail
                        ? styles.autofilledTextInput
                        : null,
                    ]}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    placeholder="Optional"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Line Items Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>Line Items</Text>
                  <View style={styles.itemActionButtons}>
                    <TouchableOpacity onPress={() => setShowSavedItems(true)}>
                      <Text style={styles.savedItemsButton}>Saved Items</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {lineItemsWithCalculatedAmounts.map((item, index) => (
                  <View key={item.id} style={styles.lineItemContainer}>
                    <View style={styles.lineItemHeader}>
                      <Text style={styles.lineItemNumber}>
                        Item {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeLineItem(item.id)}
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
                        onChangeText={(text) =>
                          updateLineItemField(item.id, "description", text)
                        }
                        placeholder="Item description"
                      />
                    </View>

                    <View style={styles.lineItemInputRow}>
                      <View style={styles.halfInput}>
                        <Text style={styles.lineItemLabel}>Rate</Text>
                        <TextInput
                          style={styles.lineItemInput}
                          value={item.rate.toString()}
                          onChangeText={(text) =>
                            updateLineItemField(item.id, "rate", text)
                          }
                          keyboardType="numeric"
                          placeholder="0.00"
                        />
                      </View>

                      <View style={styles.halfInput}>
                        <Text style={styles.lineItemLabel}>Quantity</Text>
                        <TextInput
                          style={styles.lineItemInput}
                          value={item.quantity.toString()}
                          onChangeText={(text) =>
                            updateLineItemField(item.id, "quantity", text)
                          }
                          keyboardType="numeric"
                          placeholder="1"
                        />
                      </View>
                    </View>

                    <View style={styles.lineItemAmount}>
                      <Text style={styles.lineItemLabel}>Amount</Text>
                      <Text style={styles.lineItemAmountText}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={addLineItem}
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
                    <Text style={styles.summaryValue}>
                      {formatCurrency(calculateSubtotal())}
                    </Text>
                  </View>

                  {showMarkup && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        Markup ({markupPercentage}%)
                      </Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(calculateMarkup())}
                      </Text>
                      <ChevronRight color="#888" size={20} />
                    </View>
                  )}

                  {showDiscount && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Discount</Text>
                      <Text style={styles.summaryValue}>
                        -{formatCurrency(calculateDiscount())}
                      </Text>
                      <ChevronRight color="#888" size={20} />
                    </View>
                  )}

                  {!showMarkup && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Add Markup</Text>
                      <TouchableOpacity onPress={() => setShowMarkup(true)}>
                        <Text style={styles.addText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!showDiscount && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Add Discount</Text>
                      <TouchableOpacity onPress={() => setShowDiscount(true)}>
                        <Text style={styles.addText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Request a Deposit</Text>
                    <TouchableOpacity onPress={() => setShowDeposit(true)}>
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  </View>

                  {applyTax && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(calculateTax())}
                      </Text>
                      <ChevronRight color="#888" size={20} />
                    </View>
                  )}

                  {!applyTax && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Add Tax</Text>
                      <TouchableOpacity onPress={() => setApplyTax(true)}>
                        <Text style={styles.addText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total (USD)</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(calculateTotal())}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>

      {/* Project picker and saved items modals */}
      {renderProjectPicker()}

      {/* Saved Items Modal */}
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

              {isLoadingSavedLineItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0284c7" />
                  <Text style={styles.loadingText}>Loading saved items...</Text>
                </View>
              ) : (
                <>
                  {savedLineItems?.length === 0 ? (
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
                      {Platform.OS === "ios" && (
                        <TouchableOpacity
                          style={styles.filterButton}
                          onPress={showCategoryActionSheet}
                        >
                          <Text style={styles.filterButtonText}>
                            {selectedCategory || "All Categories"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {Platform.OS === "android" && (
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

                            {Array.from(
                              new Set(
                                savedLineItems?.map(
                                  (item) => item.category || "Uncategorized"
                                )
                              )
                            ).map((category) => (
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
                            addAllItemsFromCategory(selectedCategory)
                          }
                        >
                          <Text style={styles.addAllButtonText}>
                            Add All from {selectedCategory}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <SectionList
                        sections={
                          selectedCategory
                            ? groupedItems().filter(
                                (section) => section.title === selectedCategory
                              )
                            : groupedItems()
                        }
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.savedItemCard}
                            onPress={() => addSavedLineItem(item)}
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
                        renderSectionHeader={({ section: { title } }) => (
                          <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>
                              {title}
                            </Text>
                          </View>
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
    </Modal>
  );
};

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
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 15,
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
  projectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedProjectItem: {
    backgroundColor: "#e0f2fe",
  },
  projectItemText: {
    fontSize: 16,
    color: "#0f172a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 16,
    fontSize: 16,
    color: "#334155",
    textAlign: "center",
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
  autofilledTextInput: {
    color: "#10b981",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
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
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
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
  filterButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButtonText: {
    fontSize: 16,
    color: "#0284c7",
    fontWeight: "500",
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
    marginHorizontal: 15,
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
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
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
  projectItemContent: {
    flex: 1,
  },
  projectAddress: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  projectPhone: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
  },
  closeButton: {
    minWidth: 60,
  },
});

export default CreateNewInvoice;
