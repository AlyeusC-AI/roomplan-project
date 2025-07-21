import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import { formatDate } from "@/utils/date";
import {
  CheckCircle,
  AlertTriangle,
  Send,
  Ban,
  Plus,
  Search,
  Clock,
} from "lucide-react-native";
import { showToast } from "@/utils/toast";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { Invoice, useGetInvoices } from "@service-geek/api-client";
import { Colors } from "@/constants/Colors";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let backgroundColor = "#e2e8f0"; // Default light gray
  let textColor = "#64748b"; // Default slate text

  switch (status.toLowerCase()) {
    case "draft":
      backgroundColor = "#e2e8f0"; // Gray
      textColor = "#64748b";
      break;
    case "sent":
      backgroundColor = "#dbeafe"; // Light blue
      textColor = Colors.light.primary;
      break;
    case "paid":
      backgroundColor = "#dcfce7"; // Light green
      textColor = "#16a34a";
      break;
    case "partial":
      backgroundColor = "#fef9c3"; // Yellow
      textColor = "#ca8a04";
      break;
    case "overdue":
      backgroundColor = "#fee2e2"; // Red
      textColor = "#dc2626";
      break;
    case "cancelled":
      backgroundColor = "#f3f4f6"; // Gray
      textColor = "#4b5563";
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

// Invoice item component
const InvoiceItem = ({
  invoice,
  onPress,
}: {
  invoice: Invoice;
  onPress: (id: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.invoiceItem}
      onPress={() => onPress(invoice.id)}
    >
      <View style={styles.invoiceDetails}>
        <View style={styles.invoiceMain}>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          <Text style={styles.invoiceAmount}>
            {formatCurrency(invoice.total)}
          </Text>
        </View>

        <View style={styles.invoiceMeta}>
          <Text style={styles.invoiceNumber}>
            {formatDate(invoice.createdAt)} • #{invoice.number}
          </Text>
          <StatusBadge status={invoice.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Export the ref type for TypeScript
export interface InvoiceListRef {
  fetchInvoiceData: () => Promise<void>;
}

const InvoiceList = ({ onNewInvoice }: { onNewInvoice: () => void }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: errorInvoices,
    isRefetching,
    refetch,
  } = useGetInvoices();
  const invoices = invoicesData?.data || [];

  // Group invoices by month
  const groupedInvoices = React.useMemo(() => {
    // Filter invoices based on activeTab
    const filteredInvoices = invoices.filter((invoice) => {
      if (activeTab === "active") {
        return invoice.status !== "PAID" && invoice.status !== "CANCELLED";
      } else if (activeTab === "paid") {
        return invoice.status === "PAID";
      }
      return true;
    });

    // Filter by search query if present
    const searchFilteredInvoices =
      searchQuery.trim() !== ""
        ? filteredInvoices.filter(
            (invoice) =>
              invoice.clientName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              invoice.number.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : filteredInvoices;

    // Group by month
    const grouped: { [key: string]: Invoice[] } = {};
    searchFilteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const monthYear = format(date, "MMMM yyyy");

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(invoice);
    });

    // Convert to section list format
    return Object.keys(grouped)
      .map((month) => {
        const invoicesInMonth = grouped[month];
        // Calculate total amount for the month
        const totalAmount = invoicesInMonth.reduce(
          (sum, invoice) => sum + invoice.total,
          0
        );

        return {
          title: month,
          data: invoicesInMonth,
          totalAmount,
        };
      })
      .sort((a, b) => {
        // Sort months in descending order (most recent first)
        const dateA = new Date(a.data[0].createdAt);
        const dateB = new Date(b.data[0].createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }, [invoices, activeTab, searchQuery]);

  const handleInvoicePress = (invoiceId: string) => {
    // Navigate to invoice details
    router.push(`/invoices/${invoiceId}`);
  };

  if (isLoadingInvoices) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading invoices...</Text>
      </View>
    );
  }

  if (errorInvoices) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {errorInvoices.message}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch({ throwOnError: true })}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (invoices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No invoices found</Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={onNewInvoice}
        >
          <Text style={styles.emptyStateButtonText}>
            Create your first invoice
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "paid" && styles.activeTab]}
          onPress={() => setActiveTab("paid")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "paid" && styles.activeTabText,
            ]}
          >
            Paid
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invoice list grouped by month */}
      <SectionList
        sections={groupedInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InvoiceItem invoice={item} onPress={handleInvoicePress} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionAmount}>
              {formatCurrency(section.totalAmount)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            enabled={!isLoadingInvoices}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No {activeTab} invoices found
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={onNewInvoice}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  sectionAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  invoiceItem: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#e11d48",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyListContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.light.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default InvoiceList;
