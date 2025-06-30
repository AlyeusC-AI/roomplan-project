import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Share,
  Modal,
  FlatList,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  X,
  ChevronDown,
  Send,
  Printer,
  FileText,
  MoreHorizontal,
} from "lucide-react-native";

import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/formatters";
import { showToast } from "@/utils/toast";
import {
  useConvertEstimateToInvoice,
  useGetEstimateById,
  useUpdateEstimateStatus,
  InvoiceItem,
  EstimateItem,
} from "@service-geek/api-client";

export default function EstimateDetailsScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const [activeView, setActiveView] = useState("mobile");
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const router = useRouter();
  const {
    data: estimateData,
    isLoading: isLoadingEstimate,
    isError: isErrorEstimate,
  } = useGetEstimateById(publicId);
  const estimate = estimateData?.data;
  const { mutate: updateEstimateStatus } = useUpdateEstimateStatus();
  const { mutateAsync: convertEstimateToInvoice } =
    useConvertEstimateToInvoice();

  const handleStatusChange = async (newStatus: string) => {
    if (!estimate || newStatus === estimate.status) {
      setShowStatusPicker(false);
      return;
    }

    setIsChangingStatus(true);
    try {
      const result = await updateEstimateStatus({
        id: estimate.id,
        status: newStatus as "DRAFT" | "SENT" | "APPROVED" | "REJECTED",
      });
      showToast("success", "Success", `Estimate marked as ${newStatus}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      showToast("error", "Error", `Failed to update status: ${errorMessage}`);
    } finally {
      setIsChangingStatus(false);
      setShowStatusPicker(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!estimate) return;

    try {
      const result = await convertEstimateToInvoice(estimate.id);
      showToast("success", "Success", "Estimate converted to invoice");
      router.push(`/invoices/${result.data.invoiceId}`);
    } catch (err) {
      showToast("error", "Error", `Failed to convert estimate`);
    }
  };

  if (isLoadingEstimate) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Estimate",
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Loading estimate...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isErrorEstimate) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Estimate",
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {isErrorEstimate}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <Stack.Screen
        options={{
          headerShown: true,
          title: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <View style={styles.backButtonContent}>
                <X size={22} color="#0a7ea4" />
                <Text style={styles.backButtonText}>Estimates</Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.topHeader}>
        <Text style={styles.estimateNumber}>#{estimate?.number}</Text>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Send size={20} color="#0a7ea4" />
          <Text style={styles.actionButtonText}>SEND</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Printer size={20} color="#0a7ea4" />
          <Text style={styles.actionButtonText}>PRINT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleConvertToInvoice}
        >
          <FileText size={20} color="#0a7ea4" />
          <Text style={styles.actionButtonText}>INVOICE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MoreHorizontal size={20} color="#0a7ea4" />
          <Text style={styles.actionButtonText}>MORE</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.statusBar}
        onPress={() => setShowStatusPicker(true)}
      >
        <Text style={styles.statusText}>
          {estimate?.status.toUpperCase() || "DRAFT"}
        </Text>
        <ChevronDown size={16} color="#fff" />
      </TouchableOpacity>

      <View style={styles.viewSelector}>
        <TouchableOpacity
          style={[
            styles.viewTab,
            activeView === "desktop" && styles.activeViewTab,
          ]}
          onPress={() => setActiveView("desktop")}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "desktop" && styles.activeViewTabText,
            ]}
          >
            Desktop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewTab,
            activeView === "mobile" && styles.activeViewTab,
          ]}
          onPress={() => setActiveView("mobile")}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "mobile" && styles.activeViewTabText,
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.invoicePreview}>
          <View style={styles.estimateContent}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>1 of 1</Text>
              <Text style={styles.sectionTitle}>ESTIMATE</Text>
            </View>

            <View style={styles.clientInfo}>
              <Text style={styles.clientTitle}>Prepared For</Text>
              <Text style={styles.clientName}>{estimate?.clientName}</Text>
              <Text style={styles.clientDetail}>
                {estimate?.clientAddress || "701 Lake Vista Ln"}
              </Text>
              <Text style={styles.clientDetail}>Knoxville, TN 37934</Text>
              <Text style={styles.clientDetail}>(801) 898-1884</Text>
            </View>

            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>ServiceGeek</Text>
              <Text style={styles.companyDetail}>
                {estimate?.companyAddress || "11325 Birch Springs Drive"}
              </Text>
              <Text style={styles.companyDetail}>Knoxville, TN 37932</Text>
              <Text style={styles.companyDetail}>Phone: (865) 771-2013</Text>
              <Text style={styles.companyDetail}>
                Email: support@restoregeek.app
              </Text>
              <Text style={styles.companyDetail}>Web: restoregeek.app/</Text>
            </View>

            <View style={styles.estimateDetails}>
              <View style={styles.estimateDetailRow}>
                <Text style={styles.estimateDetailLabel}>Estimate #</Text>
                <Text style={styles.estimateDetailValue}>
                  {estimate?.number}
                </Text>
              </View>
              <View style={styles.estimateDetailRow}>
                <Text style={styles.estimateDetailLabel}>Date</Text>
                <Text style={styles.estimateDetailValue}>
                  {formatDate(estimate?.estimateDate || new Date())}
                </Text>
              </View>
              <View style={styles.estimateDetailRow}>
                <Text style={styles.estimateDetailLabel}>Business / Tax #</Text>
                <Text style={styles.estimateDetailValue}>Suite 107</Text>
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={styles.descriptionHeader}>Description</Text>
              <Text style={styles.rateHeader}>Rate</Text>
              <Text style={styles.quantityHeader}>Quantity</Text>
              <Text style={styles.totalHeader}>Total</Text>
            </View>

            {estimate?.items &&
              estimate?.items.map((item: EstimateItem, index: number) => (
                <View key={item.id || index} style={styles.lineItem}>
                  <Text style={styles.descriptionText}>{item.description}</Text>
                  <Text style={styles.rateText}>
                    {formatCurrency(item.rate)}
                  </Text>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Text style={styles.totalText}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}

            <View style={styles.subtotalSection}>
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>
                  {formatCurrency(estimate?.subtotal || 0)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(estimate?.total || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{estimate?.clientName}</Text>
            </View>

            <View style={styles.pageFooter}>
              <Text style={styles.pageNumber}>Page 1 of 1</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/estimates")}
        >
          <FileText size={24} color="#0a7ea4" />
          <Text style={[styles.tabButtonText, styles.activeTabText]}>
            Estimates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/invoices")}
        >
          <FileText size={24} color="#64748b" />
          <Text style={styles.tabButtonText}>Invoices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/clients")}
        >
          <FileText size={24} color="#64748b" />
          <Text style={styles.tabButtonText}>Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/payments")}
        >
          <FileText size={24} color="#64748b" />
          <Text style={styles.tabButtonText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/more")}
        >
          <MoreHorizontal size={24} color="#64748b" />
          <Text style={styles.tabButtonText}>More</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showStatusPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.statusPickerContainer}>
            <View style={styles.statusPickerHeader}>
              <Text style={styles.statusPickerTitle}>Change Status</Text>
              <TouchableOpacity onPress={() => setShowStatusPicker(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {isChangingStatus ? (
              <View style={styles.loadingStatus}>
                <ActivityIndicator size="small" color="#0a7ea4" />
                <Text style={styles.loadingStatusText}>Updating status...</Text>
              </View>
            ) : (
              <FlatList
                data={[
                  "DRAFT",
                  "SENT",
                  "APPROVED",
                  "REJECTED",
                  "CANCELLED",
                  "EXPIRED",
                ]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      estimate?.status === item && styles.selectedStatusOption,
                    ]}
                    onPress={() => handleStatusChange(item)}
                  >
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: getStatusColor(item) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusOptionText,
                        estimate?.status === item &&
                          styles.selectedStatusOptionText,
                      ]}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "draft":
      return "#64748b";
    case "sent":
      return "#0a7ea4";
    case "approved":
      return "#16a34a";
    case "rejected":
      return "#dc2626";
    case "cancelled":
      return "#64748b";
    case "expired":
      return "#f59e0b";
    default:
      return "#64748b";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  backButton: {
    padding: 8,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "500",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: "#0a7ea4",
    fontWeight: "500",
  },
  topHeader: {
    padding: 16,
    alignItems: "center",
  },
  estimateNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: 12,
    flex: 1,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#94a3b8",
    paddingVertical: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  viewSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  viewTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeViewTab: {
    borderBottomColor: "#0a7ea4",
  },
  viewTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  activeViewTabText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  invoicePreview: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  estimateContent: {
    padding: 20,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#64748b",
  },
  clientInfo: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  clientTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  clientDetail: {
    fontSize: 14,
    color: "#475569",
    marginTop: 1,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 13,
    color: "#475569",
    marginVertical: 1,
  },
  estimateDetails: {
    marginBottom: 20,
  },
  estimateDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  estimateDetailLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  estimateDetailValue: {
    fontSize: 13,
    color: "#475569",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 8,
  },
  descriptionHeader: {
    flex: 5,
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
  },
  rateHeader: {
    flex: 2,
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  quantityHeader: {
    flex: 1,
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  totalHeader: {
    flex: 2,
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  lineItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  descriptionText: {
    flex: 5,
    fontSize: 13,
    color: "#475569",
  },
  rateText: {
    flex: 2,
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
  },
  quantityText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
  },
  totalText: {
    flex: 2,
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
  },
  subtotalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  subtotalRow: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  subtotalLabel: {
    width: 100,
    fontSize: 13,
    color: "#0f172a",
  },
  subtotalValue: {
    width: 100,
    fontSize: 13,
    color: "#475569",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 5,
    marginTop: 5,
  },
  totalLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },
  totalValue: {
    width: 100,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    textAlign: "right",
  },
  signature: {
    marginTop: 40,
    alignItems: "center",
  },
  signatureLine: {
    width: "80%",
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 13,
    color: "#475569",
  },
  pageFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  pageNumber: {
    fontSize: 12,
    color: "#94a3b8",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingBottom: 20, // Add extra padding for iOS home indicator
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabButtonText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  activeTabText: {
    color: "#0a7ea4",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#e11d48",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusPickerContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  statusPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  statusPickerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectedStatusOption: {
    backgroundColor: "#f1f5f9",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#0f172a",
  },
  selectedStatusOptionText: {
    fontWeight: "bold",
  },
  loadingStatus: {
    padding: 20,
    alignItems: "center",
  },
  loadingStatusText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
});
