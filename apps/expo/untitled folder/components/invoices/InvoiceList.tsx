import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Invoice, invoicesStore } from "@/lib/state/invoices";
import { fetchInvoices } from "@/lib/api/invoices";
import { formatDate } from "@/utils/date";
import { CheckCircle, Send, AlertTriangle, Ban, Plus } from "lucide-react-native";
import { showToast } from "@/utils/toast";

const InvoiceStatusBadge = ({ status }: { status: string }) => {
  let backgroundColor = "#e2e8f0"; // Default light gray
  let textColor = "#64748b"; // Default slate text
  let Icon = null;

  switch (status) {
    case "draft":
      backgroundColor = "#f1f5f9"; // Slate-100
      textColor = "#64748b"; // Slate-500
      break;
    case "sent":
      backgroundColor = "#e0f2fe"; // Sky-100
      textColor = "#0284c7"; // Sky-600
      Icon = Send;
      break;
    case "paid":
      backgroundColor = "#dcfce7"; // Green-100
      textColor = "#16a34a"; // Green-600
      Icon = CheckCircle;
      break;
    case "overdue":
      backgroundColor = "#fef2f2"; // Red-100
      textColor = "#dc2626"; // Red-600
      Icon = AlertTriangle;
      break;
    case "cancelled":
      backgroundColor = "#f3f4f6"; // Gray-100
      textColor = "#4b5563"; // Gray-600
      Icon = Ban;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {Icon && <Icon size={14} color={textColor} style={{ marginRight: 4 }} />}
      <Text style={[styles.badgeText, { color: textColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const InvoiceItem = ({ invoice, onPress }: { invoice: Invoice; onPress: (id: string) => void }) => {
  return (
    <TouchableOpacity
      style={styles.invoiceItem}
      onPress={() => onPress(invoice.publicId)}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceNumber}>{invoice.number}</Text>
        <InvoiceStatusBadge status={invoice.status} />
      </View>
      <View style={styles.invoiceDetails}>
        <Text style={styles.clientName}>{invoice.clientName}</Text>
        <Text style={styles.amount}>${invoice.amount.toFixed(2)}</Text>
      </View>
      <View style={styles.invoiceMeta}>
        <Text style={styles.projectName}>Project: {invoice.projectName}</Text>
        <Text style={styles.dueDate}>Due: {formatDate(invoice.dueDate)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Export the ref type for TypeScript
export interface InvoiceListRef {
  fetchInvoiceData: () => Promise<void>;
}

const InvoiceList = forwardRef<InvoiceListRef, {
  handleNewInvoice: () => void;
}>(({ handleNewInvoice }, ref) => {
  const { invoices, setInvoices } = invoicesStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Expose the fetchInvoiceData method to the parent component through ref
  useImperativeHandle(ref, () => ({
    fetchInvoiceData
  }));

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const result = await fetchInvoices();
      
      if (result.error) {
        showToast({ message: result.error, type: 'error' });
      } else if (result.data) {
        setInvoices(result.data, result.data.length);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast({ 
        message: 'Failed to load invoices. Please try again.',
        type: 'error'
      });
      
      // Use dummy data for testing if needed
      useDummyData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInvoiceData();
  };

  const handleInvoicePress = (invoiceId: string) => {
    // Navigate to invoice details
    router.push(`/invoices/${invoiceId}`);
  };

  // Fallback function to use dummy data for testing
  const useDummyData = () => {
    const dummyInvoices: Invoice[] = [
      {
        id: "1",
        publicId: "INV-001",
        number: "INV-001",
        clientName: "Acme Corporation",
        clientEmail: "billing@acme.com",
        projectName: "Website Redesign",
        projectId: "PRJ-001",
        amount: 1500.00,
        status: "draft",
        createdAt: "2023-05-15T12:00:00Z",
        dueDate: "2023-06-15T12:00:00Z",
        items: [
          {
            id: "item1",
            description: "Design Work",
            quantity: 10,
            rate: 75,
            amount: 750
          },
          {
            id: "item2",
            description: "Development",
            quantity: 15,
            rate: 50,
            amount: 750
          }
        ]
      },
      {
        id: "2",
        publicId: "INV-002",
        number: "INV-002",
        clientName: "TechStart Inc",
        clientEmail: "accounts@techstart.com",
        projectName: "Mobile App Development",
        projectId: "PRJ-002",
        amount: 3000.00,
        status: "sent",
        createdAt: "2023-05-20T12:00:00Z",
        dueDate: "2023-06-20T12:00:00Z",
        items: []
      },
      {
        id: "3",
        publicId: "INV-003",
        number: "INV-003",
        clientName: "Global Services LLC",
        clientEmail: "finance@globalservices.com",
        projectName: "SEO Optimization",
        projectId: "PRJ-003",
        amount: 750.00,
        status: "paid",
        createdAt: "2023-05-10T12:00:00Z",
        dueDate: "2023-06-10T12:00:00Z",
        items: []
      }
    ];
    
    setInvoices(dummyInvoices, dummyInvoices.length);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
      </View>

      {invoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No invoices found</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={handleNewInvoice}
          >
            <Text style={styles.emptyStateButtonText}>Create your first invoice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.publicId}
          renderItem={({ item }) => (
            <InvoiceItem invoice={item} onPress={handleInvoicePress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewInvoice}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  listContent: {
    padding: 12,
  },
  invoiceItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clientName: {
    fontSize: 15,
    color: "#334155",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  projectName: {
    fontSize: 13,
    color: "#64748b",
  },
  dueDate: {
    fontSize: 13,
    color: "#64748b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: "#0284c7",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0284c7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default InvoiceList; 