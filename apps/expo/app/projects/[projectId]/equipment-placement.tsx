import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import {
  X,
  Plus,
  Minus,
  Clock,
  MapPin,
  Search,
  Filter,
} from "lucide-react-native";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Colors } from "@/constants/Colors";
import {
  useGetEquipment,
  useGetEquipmentAssignments,
  useAssignEquipment,
  useRemoveEquipmentAssignment,
  Equipment,
  EquipmentProject,
} from "@service-geek/api-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

// Type assertions for Lucide icons
const XIcon = X as any;
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const ClockIcon = Clock as any;
const MapPinIcon = MapPin as any;
const SearchIcon = Search as any;
const FilterIcon = Filter as any;

interface EquipmentWithHistory extends Equipment {
  currentAssignments?: EquipmentProject[];
}

export default function EquipmentPlacementScreen() {
  const { projectId, roomId, roomName } = useLocalSearchParams<{
    projectId: string;
    roomId: string;
    roomName: string;
  }>();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | undefined>(
    undefined
  );

  // API hooks
  const { data: equipment = [] } = useGetEquipment({
    categoryId: filterCategory,
  });
  const { data: assignmentsResponse } = useGetEquipmentAssignments(projectId);
  const assignments = assignmentsResponse?.data || [];
  const assignEquipment = useAssignEquipment();
  const removeAssignment = useRemoveEquipmentAssignment();

  // Filter equipment based on search query
  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) =>
      eq.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [equipment, searchQuery]);

  // Get current room assignments
  const currentRoomAssignments = useMemo(() => {
    return assignments.filter((assignment) => assignment.roomId === roomId);
  }, [assignments, roomId]);

  // Get equipment with history
  const equipmentWithHistory = useMemo(() => {
    return filteredEquipment.map((eq) => ({
      ...eq,
      currentAssignments: assignments.filter(
        (assignment: EquipmentProject) => assignment.equipmentId === eq.id
      ),
    })) as EquipmentWithHistory[];
  }, [filteredEquipment, assignments]);

  // Handle equipment assignment
  const handleAssignEquipment = async () => {
    if (!selectedEquipment) return;

    try {
      await assignEquipment.mutateAsync({
        equipmentId: selectedEquipment.id,
        projectId,
        roomId,
        quantity,
      });

      toast.success(`${selectedEquipment.name} assigned to ${roomName}`);
      setShowQuantityModal(false);
      setSelectedEquipment(null);
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to assign equipment");
      console.error("Error assigning equipment:", error);
    }
  };

  // Handle equipment removal
  const handleRemoveEquipment = async (
    assignmentId: string,
    equipmentName: string
  ) => {
    Alert.alert(
      "Remove Equipment",
      `Are you sure you want to remove ${equipmentName} from this room?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeAssignment.mutateAsync(assignmentId);
              toast.success(`${equipmentName} removed from ${roomName}`);
            } catch (error) {
              toast.error("Failed to remove equipment");
              console.error("Error removing equipment:", error);
            }
          },
        },
      ]
    );
  };

  // Get available categories - for now we'll use a simple approach since category structure may vary
  const categories = useMemo(() => {
    // Return empty array for now - can be enhanced when category structure is clear
    return [];
  }, [equipment]);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <XIcon size={28} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Equipment Placement</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Room Info */}
      <Card style={styles.roomCard}>
        <CardContent>
          <View style={styles.roomInfo}>
            <MapPinIcon size={20} color={Colors.light.primary} />
            <Text style={styles.roomName}>{roomName}</Text>
            <Badge variant="outline">
              {currentRoomAssignments.length} equipment
            </Badge>
          </View>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <SearchIcon size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() =>
            setFilterCategory(filterCategory ? undefined : undefined)
          }
        >
          <FilterIcon
            size={20}
            color={filterCategory ? Colors.light.primary : "#64748b"}
          />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !filterCategory && styles.categoryChipActive,
            ]}
            onPress={() => setFilterCategory(undefined)}
          >
            <Text
              style={[
                styles.categoryChipText,
                !filterCategory && styles.categoryChipTextActive,
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
                filterCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  filterCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Current Room Equipment */}
      {currentRoomAssignments.length > 0 && (
        <Card style={styles.sectionCard}>
          <CardHeader>
            <CardTitle>Current Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            {currentRoomAssignments.map((assignment) => (
              <View key={assignment.id} style={styles.equipmentItem}>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>
                    {assignment.equipment?.name}
                  </Text>
                  <Text style={styles.equipmentQuantity}>
                    Qty: {assignment.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() =>
                    handleRemoveEquipment(
                      assignment.id,
                      assignment.equipment?.name || "Equipment"
                    )
                  }
                >
                  <MinusIcon size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Equipment */}
      <Card style={styles.sectionCard}>
        <CardHeader>
          <CardTitle>Available Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollView style={styles.equipmentList}>
            {equipmentWithHistory.map((eq: EquipmentWithHistory) => (
              <TouchableOpacity
                key={eq.id}
                style={styles.equipmentItem}
                onPress={() => {
                  setSelectedEquipment(eq);
                  setShowQuantityModal(true);
                }}
              >
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{eq.name}</Text>
                  <Text style={styles.equipmentDescription}>
                    {eq.description || "No description"}
                  </Text>
                  {eq.currentAssignments &&
                    eq.currentAssignments.length > 0 && (
                      <View style={styles.historyIndicator}>
                        <ClockIcon size={14} color="#f59e42" />
                        <Text style={styles.historyText}>
                          Currently in {eq.currentAssignments.length} other
                          room(s)
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedEquipment(eq);
                            setShowHistoryModal(true);
                          }}
                        >
                          <Text style={styles.viewHistoryText}>
                            View history
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
                <PlusIcon size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </CardContent>
      </Card>

      {/* Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Equipment</Text>
              <TouchableOpacity onPress={() => setShowQuantityModal(false)}>
                <XIcon size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedEquipment?.name}
              </Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <MinusIcon size={16} color="#64748b" />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(quantity + 1)}
                  >
                    <PlusIcon size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
              <Button
                onPress={handleAssignEquipment}
                disabled={assignEquipment.isPending}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>
                  {assignEquipment.isPending ? "Adding..." : "Add Equipment"}
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Equipment History</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <XIcon size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedEquipment?.name}
              </Text>
              <ScrollView style={styles.historyList}>
                {(
                  selectedEquipment as EquipmentWithHistory
                )?.currentAssignments?.map((assignment: EquipmentProject) => (
                  <View key={assignment.id} style={styles.historyItem}>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyRoomName}>
                        {assignment.room?.name || "Unknown Room"}
                      </Text>
                      <Text style={styles.historyQuantity}>
                        Quantity: {assignment.quantity}
                      </Text>
                      <Text style={styles.historyDate}>
                        Added:{" "}
                        {new Date(assignment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  roomCard: {
    margin: 16,
    marginTop: 8,
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: "#64748b",
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
  },
  equipmentList: {
    maxHeight: 400,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  equipmentDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  equipmentQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  historyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  historyText: {
    fontSize: 12,
    color: "#f59e42",
  },
  viewHistoryText: {
    fontSize: 12,
    color: Colors.light.primary,
    textDecorationLine: "underline",
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalBody: {
    padding: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: "#64748b",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 30,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyList: {
    maxHeight: 300,
  },
  historyItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
  },
  historyInfo: {
    gap: 4,
  },
  historyRoomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  historyQuantity: {
    fontSize: 14,
    color: "#64748b",
  },
  historyDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
