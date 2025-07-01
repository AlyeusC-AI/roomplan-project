import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
  Alert,
  Modal,
  FlatList,
  SectionList,
  ActionSheetIOS,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/formatters";
import { showToast } from "@/utils/toast";
import {
  X,
  Mail,
  Download,
  Clock,
  DollarSign,
  Share2,
  Plus,
} from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";
import {
  CreateInvoiceItemDto,
  Invoice,
  InvoiceItem,
  useEmailInvoice,
  useGetInvoiceById,
  useGetSavedInvoiceItems,
  useSaveInvoiceItem,
  useUpdateInvoice,
} from "@service-geek/api-client";

export default function InvoiceDetailsScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSavedItemsSheet, setShowSavedItemsSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const router = useRouter();
  const { mutate: saveInvoiceItem } = useSaveInvoiceItem();
  const { mutate: updateInvoice } = useUpdateInvoice();

  const {
    data: invoiceData,
    isLoading: isLoadingInvoice,
    error,
  } = useGetInvoiceById(publicId);
  const invoice = invoiceData?.data;
  const { data: savedLineItems = [], isLoading: isLoadingSavedLineItems } =
    useGetSavedInvoiceItems();

  const { mutate: emailInvoice } = useEmailInvoice();
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return { bg: "#e2e8f0", text: "#64748b" };
      case "sent":
        return { bg: "#dbeafe", text: "#2563eb" };
      case "paid":
        return { bg: "#dcfce7", text: "#16a34a" };
      case "partial":
        return { bg: "#fef9c3", text: "#ca8a04" };
      case "overdue":
        return { bg: "#fee2e2", text: "#dc2626" };
      case "cancelled":
        return { bg: "#f3f4f6", text: "#4b5563" };
      default:
        return { bg: "#e2e8f0", text: "#64748b" };
    }
  };

  // Function to generate HTML for PDF
  const generateInvoiceHTML = () => {
    if (!invoice) return "";

    const lineItemsHTML =
      invoice.items && invoice.items.length > 0
        ? invoice.items
            .map(
              (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.rate / 100)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.amount / 100)}</td>
        </tr>
      `
            )
            .join("")
        : '<tr><td colspan="4" style="padding: 8px; text-align: center; font-style: italic; color: #64748b;">No line items found</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${invoice.number}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px;
              color: #1e293b;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .company-details {
              width: 50%;
            }
            .invoice-details {
              width: 50%;
              text-align: right;
            }
            .invoice-status {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
              margin-top: 10px;
              background-color: ${getStatusColor(invoice.status).bg};
              color: ${getStatusColor(invoice.status).text};
            }
            .client-details {
              margin-bottom: 40px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f8fafc;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              color: #0f172a;
              border-bottom: 2px solid #e2e8f0;
            }
            .amount-table {
              width: 40%;
              margin-left: auto;
              margin-top: 30px;
            }
            .amount-row td {
              padding: 8px;
              border-bottom: 1px solid #e2e8f0;
            }
            .total-row td {
              padding: 12px 8px;
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              border-top: 2px solid #e2e8f0;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="company-details">
              <h1 style="color: #0284c7; margin: 0;">ServiceGeek</h1>
              <p>Professional Service Management</p>
            </div>
            <div class="invoice-details">
              <h2 style="margin: 0;">Invoice #${invoice.number}</h2>
              <div class="invoice-status">${invoice.status}</div>
              <p>Date: ${formatDate(invoice.createdAt)}</p>
              <p>Due Date: ${formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div class="client-details">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clientName}</strong></p>
            ${invoice.clientEmail ? `<p>${invoice.clientEmail}</p>` : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Quantity</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHTML}
            </tbody>
          </table>

          <table class="amount-table">
            <tbody>
              <tr class="total-row">
                <td>Total</td>
                <td style="text-align: right;">${formatCurrency(invoice.total)}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
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

  // Handle adding a saved line item to the invoice
  const handleAddSavedLineItem = async (item: CreateInvoiceItemDto) => {
    if (!invoice || !publicId) return;

    setIsAddingItem(true);
    try {
      const result = await updateInvoice({
        id: invoice.id,
        data: {
          total: invoice.total + item.rate,
          items: [
            ...(invoice.items || []),
            {
              description: item.description,
              quantity: 1,
              rate: item.rate,
              amount: item.rate,
            },
          ],
        },
      });
      showToast("success", "Success", "Item added to invoice");
      setShowSavedItemsSheet(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      showToast("error", "Error", `Failed to add item: ${errorMessage}`);
    } finally {
      setIsAddingItem(false);
    }
  };

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

  // Render saved items sheet
  const renderSavedItemsSheet = () => {
    const sections = groupedItems();
    const filteredSections = selectedCategory
      ? sections.filter((section) => section.title === selectedCategory)
      : sections;

    return (
      <Modal
        visible={showSavedItemsSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSavedItemsSheet(false)}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetContent}>
            <SafeAreaView style={styles.sheetSafeArea}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Saved Items</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSavedItemsSheet(false)}
                >
                  <X size={24} color="#0f172a" />
                </TouchableOpacity>
              </View>

              {Platform.OS === "android" && (
                <View style={styles.categoryFilter}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryFilterContent}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryChip,
                        selectedCategory === null &&
                          styles.categoryChipSelected,
                      ]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategory === null &&
                            styles.categoryChipTextSelected,
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
                            styles.categoryChipSelected,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            selectedCategory === category &&
                              styles.categoryChipTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {isLoadingSavedLineItems ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0284c7" />
                  <Text style={styles.loadingText}>Loading saved items...</Text>
                </View>
              ) : savedLineItems?.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No saved items found</Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    onPress={() => {
                      setShowSavedItemsSheet(false);
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

                  <SectionList
                    sections={filteredSections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.savedItemRow}
                        onPress={() => handleAddSavedLineItem(item)}
                        disabled={isAddingItem}
                      >
                        <View style={styles.savedItemContent}>
                          <Text style={styles.savedItemDescription}>
                            {item.description}
                          </Text>
                          <Text style={styles.savedItemRate}>
                            {formatCurrency(item.rate)}
                          </Text>
                        </View>
                        <View style={styles.savedItemAction}>
                          {isAddingItem ? (
                            <ActivityIndicator size="small" color="#0284c7" />
                          ) : (
                            <Plus size={20} color="#0284c7" />
                          )}
                        </View>
                      </TouchableOpacity>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{title}</Text>
                      </View>
                    )}
                    ItemSeparatorComponent={() => (
                      <View style={styles.itemSeparator} />
                    )}
                    contentContainerStyle={styles.listContent}
                  />
                </>
              )}
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    );
  };

  // Send invoice via email
  const handleSendInvoice = async () => {
    if (!invoice || !publicId) return;

    setIsSending(true);
    try {
      const result = await emailInvoice({
        id: invoice.id,
        message: "Please find the invoice attached",
      });

      showToast("success", "Success", "Invoice sent successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      showToast("error", "Error", `Failed to send invoice: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  // Download invoice as PDF
  const handleDownloadInvoice = async () => {
    if (!invoice) return;

    setIsDownloading(true);
    try {
      // Request storage permissions on Android
      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission needed",
            "Please grant permission to save the invoice"
          );
          setIsDownloading(false);
          return;
        }
      }

      // Generate PDF from HTML
      const html = generateInvoiceHTML();
      const { uri } = await Print.printToFileAsync({ html });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (fileInfo.exists) {
        // Save to device
        if (Platform.OS === "android") {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync("Invoices", asset, false);
          showToast("success", "Success", "Invoice saved to your device");
        } else {
          // For iOS, use share
          await Sharing.shareAsync(uri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
            dialogTitle: `Invoice #${invoice.number}`,
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      showToast(
        "error",
        "Error",
        `Failed to download invoice: ${errorMessage}`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Share invoice
  const handleShareInvoice = async () => {
    if (!invoice) return;

    try {
      // Generate shareable content
      const message = `Invoice #${invoice.number} for ${invoice.clientName}\nAmount: ${formatCurrency(invoice.total)}\nDue Date: ${formatDate(invoice.dueDate)}`;

      // Use native share dialog
      await Share.share({
        message,
        title: `Invoice #${invoice.number}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      showToast("error", "Error", `Failed to share invoice: ${errorMessage}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Stack.Screen
        options={{
          headerShown: true,
          title: invoice ? `Invoice #${invoice.number}` : "Invoice Details",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <X size={24} color="#0f172a" />
            </TouchableOpacity>
          ),
        }}
      />

      {isLoadingInvoice ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284c7" />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error: {error?.message || "An unknown error occurred"}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : invoice ? (
        <>
          <ScrollView style={styles.content}>
            <View style={styles.header}>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNumber}>
                  Invoice #{invoice.number}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(invoice.status).bg },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(invoice.status).text },
                    ]}
                  >
                    {invoice.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.clientName}>{invoice.clientName}</Text>
              <Text style={styles.dateText}>
                Created: {formatDate(invoice.createdAt)}
              </Text>
              <Text style={styles.dateText}>
                Due: {formatDate(invoice.dueDate)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <Text style={styles.amount}>{formatCurrency(invoice.total)}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Line Items</Text>
                {/* <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => setShowSavedItemsSheet(true)}
                >
                  <Plus size={16} color="#0284c7" />
                  <Text style={styles.addItemButtonText}>Add Item</Text>
                </TouchableOpacity> */}
              </View>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => (
                  <View key={index} style={styles.lineItem}>
                    <Text style={styles.lineItemDescription}>
                      {item.description}
                    </Text>
                    <View style={styles.lineItemDetails}>
                      <Text style={styles.lineItemQuantity}>
                        {item.quantity} × {formatCurrency(item.rate)}
                      </Text>
                      <Text style={styles.lineItemAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No line items found</Text>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendInvoice}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#0284c7" />
                ) : (
                  <Mail size={20} color="#0284c7" />
                )}
                <Text style={styles.actionText}>Send</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownloadInvoice}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#0284c7" />
                ) : (
                  <Download size={20} color="#0284c7" />
                )}
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShareInvoice}
              >
                <Share2 size={20} color="#0284c7" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {renderSavedItemsSheet()}
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invoice not found</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 16,
  },
  invoiceInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },
  lineItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  lineItemDescription: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 4,
  },
  lineItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineItemQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  lineItemAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    alignItems: "center",
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: "#0284c7",
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  addItemButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0284c7",
    marginLeft: 4,
  },

  // Sheet styles
  sheetContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  sheetContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    maxHeight: 600,
  },

  sheetSafeArea: {
    flex: 1,
  },

  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },

  closeButton: {
    padding: 4,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  filterButtonText: {
    fontSize: 16,
    color: "#0284c7",
    fontWeight: "500",
  },

  categoryFilter: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  categoryFilterContent: {
    paddingHorizontal: 16,
  },

  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    marginRight: 8,
  },

  categoryChipSelected: {
    backgroundColor: "#0284c7",
  },

  categoryChipText: {
    fontSize: 14,
    color: "#64748b",
  },

  categoryChipTextSelected: {
    color: "white",
    fontWeight: "500",
  },

  savedItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  savedItemContent: {
    flex: 1,
  },

  savedItemDescription: {
    fontSize: 16,
    color: "#0f172a",
    marginBottom: 4,
  },

  savedItemRate: {
    fontSize: 14,
    color: "#64748b",
  },

  savedItemAction: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },

  sectionHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },

  itemSeparator: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginLeft: 16,
  },

  listContent: {
    paddingBottom: 40,
  },

  // Add missing styles
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyStateButton: {
    backgroundColor: "#0284c7",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
