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
import { Estimate, useGetEstimates } from "@service-geek/api-client";

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
      textColor = "#2563eb";
      break;
    case "approved":
      backgroundColor = "#dcfce7"; // Light green
      textColor = "#16a34a";
      break;
    case "rejected":
      backgroundColor = "#fee2e2"; // Red
      textColor = "#dc2626";
      break;
    case "expired":
      backgroundColor = "#f3f4f6"; // Gray
      textColor = "#4b5563";
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

// Estimate item component
const EstimateItem = ({
  estimate,
  onPress,
}: {
  estimate: Estimate;
  onPress: (id: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.estimateItem}
      onPress={() => onPress(estimate.id)}
    >
      <View style={styles.estimateDetails}>
        <View style={styles.estimateMain}>
          <Text style={styles.clientName}>{estimate.clientName}</Text>
          <Text style={styles.estimateAmount}>
            {formatCurrency(estimate.total)}
          </Text>
        </View>

        <View style={styles.estimateMeta}>
          <Text style={styles.estimateNumber}>
            {formatDate(estimate.createdAt ?? new Date())} • #{estimate.number}
          </Text>
          <StatusBadge status={estimate.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Export the ref type for TypeScript

const EstimateList = forwardRef<
  { onNewEstimate: () => void },
  { onNewEstimate: () => void }
>(({ onNewEstimate }) => {
  const {
    data: estimates = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useGetEstimates();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Group estimates by month
  const groupedEstimates = React.useMemo(() => {
    // Filter estimates based on activeTab
    const filteredEstimates = estimates?.filter((estimate) => {
      if (activeTab === "active") {
        return ["DRAFT", "SENT"].includes(estimate.status ?? "");
      } else {
        return ["APPROVED", "REJECTED", "EXPIRED", "CANCELLED"].includes(
          estimate.status ?? ""
        );
      }
    });

    // Filter by search query if present
    const searchFilteredEstimates =
      searchQuery.trim() !== ""
        ? filteredEstimates.filter(
            (estimate) =>
              estimate.clientName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              estimate.number.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : filteredEstimates;

    // Group by month
    const grouped: { [key: string]: Estimate[] } = {};
    searchFilteredEstimates.forEach((estimate) => {
      const date = new Date(estimate.createdAt ?? new Date());
      const monthYear = format(date, "MMMM yyyy");

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(estimate);
    });

    // Convert to section list format
    return Object.keys(grouped)
      .map((month) => {
        const estimatesInMonth = grouped[month];
        // Calculate total amount for the month
        const totalAmount = estimatesInMonth.reduce(
          (sum, estimate) => sum + estimate.total,
          0
        );

        return {
          title: month,
          data: estimatesInMonth,
          totalAmount,
        };
      })
      .sort((a, b) => {
        // Sort months in descending order (most recent first)
        const dateA = new Date(a.data[0].createdAt ?? new Date());
        const dateB = new Date(b.data[0].createdAt ?? new Date());
        return dateB.getTime() - dateA.getTime();
      });
  }, [estimates, activeTab, searchQuery]);

  const handleEstimatePress = (estimateId: string) => {
    // Navigate to estimate details
    router.push(`/estimates/${estimateId}`);
  };

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading estimates...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (estimates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No estimates found</Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={onNewEstimate}
        >
          <Text style={styles.emptyStateButtonText}>
            Create your first estimate
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
            placeholder="Search all estimates..."
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
          style={[styles.tab, activeTab === "approved" && styles.activeTab]}
          onPress={() => setActiveTab("approved")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "approved" && styles.activeTabText,
            ]}
          >
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Estimate list grouped by month */}
      <SectionList
        sections={groupedEstimates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EstimateItem estimate={item} onPress={handleEstimatePress} />
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
            onRefresh={() => refetch()}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              No {activeTab} estimates found
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={onNewEstimate}>
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
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
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
  estimateItem: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  estimateDetails: {
    flex: 1,
  },
  estimateMain: {
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
  estimateAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  estimateMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  estimateNumber: {
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
    backgroundColor: "#2563eb",
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
    backgroundColor: "#2563eb",
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
    backgroundColor: "#2563eb",
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

export default EstimateList;
