import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2, Calendar } from "lucide-react-native";
import { Invoice, InvoiceItem, invoicesStore } from "@/lib/state/invoices";
import { projectsStore } from "@/lib/state/projects";
import { createInvoice } from "@/lib/api/invoices";
import { showToast } from "@/utils/toast";
import { formatDate, calculateDueDate } from "@/utils/date";
import { Input } from "@/components/ui/input";
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateNewInvoice = ({
  visible,
  onClose
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
  const [poNumber, setPoNumber] = useState("");
  const [daysToPay, setDaysToPay] = useState("30");
  const [isCreating, setIsCreating] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(calculateDueDate(new Date(), 30));
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [showMarkup, setShowMarkup] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [taxRate, setTaxRate] = useState(0);
  const [applyTax, setApplyTax] = useState(false);
  const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const router = useRouter();
  const { addInvoice } = invoicesStore((state) => state);
  const { projects } = projectsStore((state) => state);

  useEffect(() => {
    // Calculate due date based on days to pay
    if (invoiceDate && daysToPay) {
      const due = calculateDueDate(invoiceDate, parseInt(daysToPay || "0"));
      setDueDate(due);
    }
  }, [invoiceDate, daysToPay]);

  useEffect(() => {
    // Update line item amounts when rate or quantity changes
    const updated = lineItems.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));
    setLineItems(updated);
  }, [lineItems]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: uuidv4(), description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItemField = (
    id: string,
    field: 'description' | 'quantity' | 'rate',
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item };
          
          if (field === 'description') {
            updatedItem.description = value as string;
          } else if (field === 'quantity') {
            const quantity = parseFloat(value as string) || 0;
            updatedItem.quantity = quantity;
            updatedItem.amount = quantity * item.rate;
          } else if (field === 'rate') {
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
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
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
      setProjectId(selectedProject.publicId);
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

      showToast({
        message: "Project details auto-filled successfully",
        type: "success"
      });

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
      showToast({
        message: "Please fill in all required fields.",
        type: "error"
      });
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
          poNumber,
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
      const result = await createInvoice(invoiceData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Add to local store
        addInvoice(result.data);
        showToast({
          message: "Invoice created successfully!",
          type: "success"
        });
        onClose();
      }
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Could not create invoice",
        type: "error"
      });
      console.error(error);
    }
    setIsCreating(false);
  };

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
      transparent
      animationType="slide"
      onRequestClose={() => setShowProjectPicker(false)}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { width: '90%', maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ width: '100%' }}>
            {projects.map((project, index) => (
              <TouchableOpacity
                key={project.publicId}
                style={[
                  styles.projectItem,
                  index === selectedProjectIndex && styles.selectedProjectItem
                ]}
                onPress={() => handleProjectSelect(index)}
              >
                <Text style={styles.projectItemText}>{project.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create New Invoice</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Invoice #</Text>
                <Input
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Invoice Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowInvoiceDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(invoiceDate)}
                  </Text>
                  <Calendar size={20} color="#64748b" />
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
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Project</Text>
                <TouchableOpacity 
                  style={styles.projectButton}
                  onPress={() => setShowProjectPicker(true)}
                >
                  <Text style={styles.projectButtonText}>
                    {projectName || "Select a project"}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Selecting a project will auto-fill client information
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Client Name</Text>
                <Input
                  value={clientName}
                  onChangeText={setClientName}
                  style={[
                    styles.input,
                    projectId && clientName ? styles.autofilledInput : null
                  ]}
                />
                {projectId && clientName && (
                  <Text style={styles.autofilledText}>Auto-filled from project</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Client Email</Text>
                <Input
                  value={clientEmail}
                  onChangeText={setClientEmail}
                  style={[
                    styles.input,
                    projectId && clientEmail ? styles.autofilledInput : null
                  ]}
                  keyboardType="email-address"
                />
                {projectId && clientEmail && (
                  <Text style={styles.autofilledText}>Auto-filled from project</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>PO Number</Text>
                <Input
                  value={poNumber}
                  onChangeText={setPoNumber}
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Days to Pay</Text>
                <Input
                  value={daysToPay}
                  onChangeText={setDaysToPay}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDueDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {formatDate(dueDate)}
                  </Text>
                  <Calendar size={20} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Auto-calculated based on days to pay
                </Text>
                {showDueDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDueDatePicker(false);
                      if (date) setDueDate(date);
                    }}
                  />
                )}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              
              {lineItems.map((item, index) => (
                <View key={item.id} style={styles.lineItem}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Description</Text>
                    <Input
                      value={item.description}
                      onChangeText={(value) => 
                        updateLineItemField(item.id, 'description', value)
                      }
                      style={styles.input}
                    />
                  </View>
                  
                  <View style={styles.lineItemRow}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Rate</Text>
                      <Input
                        value={item.rate.toString()}
                        onChangeText={(value) => 
                          updateLineItemField(item.id, 'rate', value)
                        }
                        style={styles.input}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    
                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>Quantity</Text>
                      <Input
                        value={item.quantity.toString()}
                        onChangeText={(value) => 
                          updateLineItemField(item.id, 'quantity', value)
                        }
                        style={styles.input}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.lineItemAmount}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                  </View>
                  
                  {lineItems.length > 1 && (
                    <TouchableOpacity 
                      style={styles.removeItemButton}
                      onPress={() => removeLineItem(item.id)}
                    >
                      <Trash2 size={20} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={addLineItem}
              >
                <Plus size={20} color="#0284c7" />
                <Text style={styles.addItemButtonText}>Add Line Item</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${calculateSubtotal().toFixed(2)}</Text>
              </View>
              
              {showMarkup && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryInputRow}>
                    <Text style={styles.summaryLabel}>Markup</Text>
                    <Input
                      value={markupPercentage.toString()}
                      onChangeText={(value) => setMarkupPercentage(parseFloat(value) || 0)}
                      style={styles.summaryInput}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.percentSymbol}>%</Text>
                  </View>
                  <Text style={styles.summaryValue}>${calculateMarkup().toFixed(2)}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowMarkup(!showMarkup)}
              >
                <Text style={styles.toggleButtonText}>
                  {showMarkup ? "Remove Markup" : "Add Markup"}
                </Text>
              </TouchableOpacity>
              
              {showDiscount && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryInputRow}>
                    <Text style={styles.summaryLabel}>Discount</Text>
                    <Input
                      value={discountAmount.toString()}
                      onChangeText={(value) => setDiscountAmount(parseFloat(value) || 0)}
                      style={styles.summaryInput}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <Text style={styles.summaryValue}>-${calculateDiscount().toFixed(2)}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowDiscount(!showDiscount)}
              >
                <Text style={styles.toggleButtonText}>
                  {showDiscount ? "Remove Discount" : "Add Discount"}
                </Text>
              </TouchableOpacity>
              
              {showDeposit && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryInputRow}>
                    <Text style={styles.summaryLabel}>Deposit</Text>
                    <Input
                      value={depositPercentage.toString()}
                      onChangeText={(value) => setDepositPercentage(parseFloat(value) || 0)}
                      style={styles.summaryInput}
                      keyboardType="decimal-pad"
                    />
                    <Text style={styles.percentSymbol}>%</Text>
                  </View>
                  <Text style={styles.summaryValue}>${calculateDeposit().toFixed(2)}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowDeposit(!showDeposit)}
              >
                <Text style={styles.toggleButtonText}>
                  {showDeposit ? "Remove Deposit" : "Request a Deposit"}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.taxRow}>
                <View style={styles.taxInputRow}>
                  <Text style={styles.summaryLabel}>Tax Rate</Text>
                  <Input
                    value={taxRate.toString()}
                    onChangeText={(value) => setTaxRate(parseFloat(value) || 0)}
                    style={[styles.summaryInput, !applyTax && styles.disabledInput]}
                    keyboardType="decimal-pad"
                    editable={applyTax}
                  />
                  <Text style={styles.percentSymbol}>%</Text>
                </View>
                <TouchableOpacity
                  style={styles.taxToggle}
                  onPress={() => setApplyTax(!applyTax)}
                >
                  <View style={[
                    styles.taxToggleTrack, 
                    applyTax && styles.taxToggleTrackActive
                  ]}>
                    <View style={[
                      styles.taxToggleThumb,
                      applyTax && styles.taxToggleThumbActive
                    ]} />
                  </View>
                  <Text style={styles.taxToggleLabel}>Apply</Text>
                </TouchableOpacity>
              </View>
              
              {applyTax && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
                  <Text style={styles.summaryValue}>${calculateTax().toFixed(2)}</Text>
                </View>
              )}
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total (USD)</Text>
                <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.createButton]} 
              onPress={createNewInvoice}
            >
              <Text style={styles.createButtonText}>Create Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {renderProjectPicker()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  autofilledInput: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  autofilledText: {
    fontSize: 12,
    color: "#10b981",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#0f172a",
  },
  projectButton: {
    justifyContent: "center",
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  projectButtonText: {
    fontSize: 14,
    color: "#0f172a",
  },
  lineItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  lineItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineItemAmount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  removeItemButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  addItemButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#0284c7",
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#334155",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  summaryInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryInput: {
    width: 80,
    height: 32,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
    fontSize: 14,
  },
  percentSymbol: {
    marginLeft: 4,
    fontSize: 14,
    color: "#64748b",
  },
  toggleButton: {
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#0284c7",
    fontWeight: "500",
  },
  taxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taxInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taxToggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  taxToggleTrack: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    padding: 2,
  },
  taxToggleTrackActive: {
    backgroundColor: "#0284c7",
  },
  taxToggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  taxToggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  taxToggleLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#334155",
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: "#f1f5f9",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  createButton: {
    marginLeft: 8,
    backgroundColor: "#0284c7",
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  projectItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedProjectItem: {
    backgroundColor: '#e0f2fe',
  },
  projectItemText: {
    fontSize: 16,
    color: '#0f172a',
  },
});

export default CreateNewInvoice; 