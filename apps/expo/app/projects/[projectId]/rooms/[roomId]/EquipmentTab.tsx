import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  Plus,
  Minus,
  Clock,
  Search,
  Filter,
  X,
  Check,
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
import { useGetEquipmentCategories } from "@service-geek/api-client/src/hooks/useEquipmentCategory";
import { toast } from "sonner-native";

// Type assertions for Lucide icons
const PlusIcon = Plus as any;
const MinusIcon = Minus as any;
const ClockIcon = Clock as any;
const SearchIcon = Search as any;
const FilterIcon = Filter as any;
const XIcon = X as any;
const CheckIcon = Check as any;

interface EquipmentWithHistory extends Equipment {
  currentAssignments?: EquipmentProject[];
}

interface SelectedEquipment {
  equipment: Equipment;
  quantity: number;
}

interface EquipmentTabProps {
  projectId: string;
  roomId: string;
  room: any;
}

// Equipment Calculations Header UI Component
function EquipmentCalculationsHeader() {
  return (
    <View
      style={{
        backgroundColor: "#f1f5f9",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 1,
        borderColor: "#cbd5e1",
        padding: 8,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          color: "#64748b",
          marginBottom: 8,
          fontSize: 15,
        }}
      >
        Equipment Calculations
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Dehumidifier Recommendation Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: 12,
            alignItems: "flex-start",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Image
            source={require("@/assets/equipments/dehumidifier.png")}
            style={{ width: 32, height: 32, marginBottom: 6 }}
          />
          <Text
            style={{
              fontWeight: "600",
              color: "#334155",
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            Dehumidifier Recommendation
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginBottom: 2 }}>
            0 of 95.3 pints placed
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13 }}>0 units placed</Text>
        </View>
        {/* Air Mover Recommendation Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 8,
            padding: 12,
            alignItems: "flex-start",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Image
            source={require("@/assets/equipments/airMover.png")}
            style={{ width: 32, height: 32, marginBottom: 6 }}
          />
          <Text
            style={{
              fontWeight: "600",
              color: "#334155",
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            Air Mover Recommendation
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginBottom: 2 }}>
            0 of 3 rooms met
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13 }}>
            0 of (6 - 7) units placed
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function EquipmentTab({
  projectId,
  roomId,
  room,
}: EquipmentTabProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<SelectedEquipment[]>([]);
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
  const { data: categories = [] } = useGetEquipmentCategories();

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

  // Get equipment with history and available quantities
  const equipmentWithHistory = useMemo(() => {
    return filteredEquipment.map((eq) => {
      const currentAssignments = assignments.filter(
        (assignment: EquipmentProject) => assignment.equipmentId === eq.id
      );

      // Only count active assignments for available quantity calculation
      const activeAssignments = currentAssignments.filter(
        (assignment: any) =>
          assignment.status === "ACTIVE" || !assignment.status
      );

      const totalAssigned = activeAssignments.reduce(
        (sum, assignment) => sum + assignment.quantity,
        0
      );

      const availableQuantity = eq.quantity - totalAssigned;

      return {
        ...eq,
        currentAssignments,
        activeAssignments,
        totalAssigned,
        availableQuantity,
      };
    }) as (EquipmentWithHistory & {
      totalAssigned: number;
      availableQuantity: number;
      activeAssignments: EquipmentProject[];
    })[];
  }, [filteredEquipment, assignments]);

  // Check if equipment is selected
  const isEquipmentSelected = (equipmentId: string) => {
    return selectedItems.some((item) => item.equipment.id === equipmentId);
  };

  // Get quantity for selected equipment
  const getSelectedQuantity = (equipmentId: string) => {
    const item = selectedItems.find(
      (item) => item.equipment.id === equipmentId
    );
    return item ? item.quantity : 0;
  };

  // Handle equipment selection
  const handleEquipmentSelection = (equipment: Equipment) => {
    const isSelected = isEquipmentSelected(equipment.id);

    if (isSelected) {
      // Remove from selection
      setSelectedItems((prev) =>
        prev.filter((item) => item.equipment.id !== equipment.id)
      );
    } else {
      // Add to selection with default quantity 1
      setSelectedItems((prev) => [...prev, { equipment, quantity: 1 }]);
    }
  };

  // Handle quantity change for specific equipment
  const handleQuantityChange = (equipmentId: string, newQuantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.equipment.id === equipmentId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // Handle equipment assignment
  const handleAssignEquipment = async () => {
    if (selectedItems.length === 0) return;

    try {
      console.log(
        "🚀 ~ handleAssignEquipment ~ selectedItems:",
        selectedItems,
        selectedItems.map((item) => item.equipment.id)
      );

      // Assign all selected equipment
      const promises = selectedItems.map((item) =>
        assignEquipment.mutateAsync({
          equipmentId: item.equipment.id,
          projectId,
          roomId,
          quantity: item.quantity,
        })
      );

      await Promise.all(promises);

      const equipmentNames = selectedItems
        .map((item) => item.equipment.name)
        .join(", ");
      toast.success(`Equipment added to ${room.name}`);

      setShowQuantityModal(false);
      setSelectedItems([]);
    } catch (error: any) {
      // Handle specific validation errors from backend
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to assign equipment");
      }
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
              toast.success(`${equipmentName} removed from ${room.name}`);
            } catch (error) {
              toast.error("Failed to remove equipment");
              console.error("Error removing equipment:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <EquipmentCalculationsHeader />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Room Equipment */}
        {currentRoomAssignments.length > 0 ? (
          <Card style={styles.sectionCard}>
            <CardHeader>
              <CardTitle>Current Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              {currentRoomAssignments.map((assignment) => (
                <View key={assignment.id} style={styles.equipmentItem}>
                  <TouchableOpacity
                    style={styles.equipmentInfoContainer}
                    onPress={() => {
                      if (assignment.equipment) {
                        setSelectedEquipment(assignment.equipment);
                        setShowHistoryModal(true);
                      }
                    }}
                  >
                    <View style={styles.equipmentInfo}>
                      <Text style={styles.equipmentName}>
                        {assignment.equipment?.name}
                      </Text>
                      <Text style={styles.equipmentQuantity}>
                        Qty: {assignment.quantity}
                      </Text>
                    </View>
                    <View style={styles.equipmentActions}>
                      <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => {
                          if (assignment.equipment) {
                            setSelectedEquipment(assignment.equipment);
                            setShowHistoryModal(true);
                          }
                        }}
                      >
                        <ClockIcon size={16} color="#64748b" />
                      </TouchableOpacity>
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
                  </TouchableOpacity>
                </View>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            <CardContent style={styles.emptyState} className="pt-4">
              <Text style={styles.emptyStateText}>
                No equipment assigned to this room yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the button below to add equipment
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Add Equipment Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => setShowQuantityModal(true)}
            style={styles.addEquipmentButton}
          >
            <PlusIcon size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.addEquipmentButtonText}>Add Equipment</Text>
          </Button>
        </View>
      </ScrollView>

      {/* Full Screen Quantity Modal */}
      <Modal
        visible={showQuantityModal}
        animationType="slide"
        onRequestClose={() => setShowQuantityModal(false)}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowQuantityModal(false);
                setSelectedItems([]);
              }}
              style={styles.closeButton}
            >
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Equipment</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Group equipment by categoryId and map to category name */}
            {Object.entries(
              equipmentWithHistory.reduce(
                (acc, eq) => {
                  const cat =
                    categories.find(
                      (c: { id: string; name: string }) =>
                        c.id === eq.categoryId
                    )?.name || "Other";
                  acc[cat] = acc[cat] || [];
                  acc[cat].push(eq);
                  return acc;
                },
                {} as Record<string, typeof equipmentWithHistory>
              )
            )
              .sort(([a], [b]) => {
                if (a === "Dehumidifiers") return -1;
                if (b === "Dehumidifiers") return 1;
                if (a === "Other") return 1;
                if (b === "Other") return -1;
                return a.localeCompare(b);
              })
              .map(([category, items]) => {
                // Progress calculation: include both assigned and selected (pending) equipment
                const total = items.reduce((sum, eq) => sum + eq.quantity, 0);
                // Sum assigned
                let placed = items.reduce(
                  (sum, eq) => sum + eq.totalAssigned,
                  0
                );
                // Add selected (pending) equipment for this category
                placed += selectedItems
                  .filter((item) => {
                    const cat =
                      categories.find(
                        (c: { id: string; name: string }) =>
                          c.id === item.equipment.categoryId
                      )?.name || "Other";
                    return cat === category;
                  })
                  .reduce((sum, item) => sum + item.quantity, 0);
                // Icon mapping
                const iconMap: Record<string, any> = {
                  Dehumidifiers: require("@/assets/equipments/dehumidifier.png"),
                  "Air Movers": require("@/assets/equipments/airMover.png"),
                  "Air Scrubbers": require("@/assets/equipments/airScrubber.png"),
                  Heater: require("@/assets/equipments/heatBoostBar.png"),
                  "Drying Matts": require("@/assets/equipments/dryingMatts.png"),
                  "Ozone Generator": require("@/assets/equipments/oZoneGenerator.png"),
                  "Wall Cavity Dryer": require("@/assets/equipments/wallCavitydryer.png"),
                };
                const icon =
                  iconMap[category] || require("@/assets/equipments/6.png");
                // Handler to add one unit of the first available equipment in this category
                const handleAddOne = () => {
                  // Find the first equipment in this category that is not fully selected
                  const firstAvailable = items.find((eq) => {
                    const selected = selectedItems.find(
                      (item) => item.equipment.id === eq.id
                    );
                    // If not selected at all, it's available
                    if (!selected) return eq.availableQuantity > 0;
                    // If selected, only available if not at max
                    return selected.quantity < eq.availableQuantity;
                  });
                  if (!firstAvailable) {
                    toast.error(`No more available equipment in ${category}`);
                    console.log(`No more available equipment in ${category}`);
                    return;
                  }
                  const alreadySelected = selectedItems.find(
                    (item) => item.equipment.id === firstAvailable.id
                  );
                  if (alreadySelected) {
                    // Increment quantity if not exceeding available
                    if (
                      alreadySelected.quantity <
                      firstAvailable.availableQuantity
                    ) {
                      setSelectedItems((prev) =>
                        prev.map((item) =>
                          item.equipment.id === firstAvailable.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                        )
                      );
                      toast.success(`Added 1 more ${firstAvailable.name}`);
                      console.log(`Incremented ${firstAvailable.name}`);
                    } else {
                      toast.error(
                        `No more available units for ${firstAvailable.name}`
                      );
                      console.log(
                        `No more available units for ${firstAvailable.name}`
                      );
                    }
                  } else {
                    setSelectedItems((prev) => [
                      ...prev,
                      { equipment: firstAvailable, quantity: 1 },
                    ]);
                    toast.success(`Added 1 ${firstAvailable.name}`);
                    console.log(`Added 1 ${firstAvailable.name}`);
                  }
                };
                return (
                  <View key={category} style={{ marginBottom: 24 }}>
                    {/* Category Header */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{ fontWeight: "700", fontSize: 16, flex: 1 }}
                      >
                        {category}
                      </Text>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: "#e5e7eb",
                            borderRadius: 3,
                          }}
                        >
                          <View
                            style={{
                              width: `${total ? (placed / total) * 100 : 0}%`,
                              height: 6,
                              backgroundColor: Colors.light.primary,
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <Text style={{ fontSize: 11, color: "#64748b" }}>
                          {placed} of {total} units placed
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.light.primary,
                          borderRadius: 8,
                          padding: 4,
                        }}
                        onPress={handleAddOne}
                      >
                        <PlusIcon size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    {/* Show only selected equipment for this category */}
                    {selectedItems
                      .filter((item) => {
                        const cat =
                          categories.find(
                            (c: { id: string; name: string }) =>
                              c.id === item.equipment.categoryId
                          )?.name || "Other";
                        return cat === category;
                      })
                      .map((item) => {
                        const eq = item.equipment;
                        const selectedQuantity = item.quantity;
                        return (
                          <View
                            key={eq.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: "#fff",
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#e5e7eb",
                              marginBottom: 8,
                              padding: 10,
                            }}
                          >
                            <Image
                              source={icon}
                              style={{ width: 24, height: 24, marginRight: 8 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{ fontWeight: "600", color: "#1e293b" }}
                              >
                                {eq.name}
                              </Text>
                              {/* Special UI for Dehumidifiers (pints selector) */}
                              {category === "Dehumidifiers" && (
                                <View
                                  style={{ flexDirection: "row", marginTop: 4 }}
                                >
                                  {[60, 120, 180].map((val) => (
                                    <TouchableOpacity
                                      key={val}
                                      style={{
                                        backgroundColor:
                                          selectedQuantity === val
                                            ? Colors.light.primary
                                            : "#f1f5f9",
                                        borderRadius: 6,
                                        paddingHorizontal: 10,
                                        paddingVertical: 4,
                                        marginRight: 6,
                                      }}
                                      onPress={() =>
                                        handleQuantityChange(eq.id, val)
                                      }
                                    >
                                      <Text
                                        style={{
                                          color:
                                            selectedQuantity === val
                                              ? "#fff"
                                              : "#1e293b",
                                        }}
                                      >
                                        {val}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                  <TouchableOpacity
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      borderRadius: 6,
                                      paddingHorizontal: 10,
                                      paddingVertical: 4,
                                    }}
                                    onPress={() =>
                                      handleQuantityChange(eq.id, 1)
                                    }
                                  >
                                    <Text style={{ color: "#1e293b" }}>
                                      Custom
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontWeight: "600",
                                  color: "#1e293b",
                                  marginRight: 8,
                                }}
                              >
                                {selectedQuantity}
                              </Text>
                              <TouchableOpacity
                                style={{ marginLeft: 8 }}
                                onPress={() =>
                                  setSelectedItems((prev) =>
                                    prev.filter((i) => i.equipment.id !== eq.id)
                                  )
                                }
                              >
                                <MinusIcon size={18} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                );
              })}
          </ScrollView>

          {/* Footer with View Selected and Place buttons */}
          <View
            style={{
              flexDirection: "row",
              padding: 16,
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              paddingBottom: 40,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: Colors.light.primary,
                borderRadius: 8,
                marginRight: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={() => {}}
            >
              <Text style={{ color: Colors.light.primary, fontWeight: "600" }}>
                View Selected ({selectedItems.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: Colors.light.primary,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
              onPress={handleAssignEquipment}
              disabled={assignEquipment.isPending}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Place</Text>
            </TouchableOpacity>
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
                )?.currentAssignments?.map((assignment: EquipmentProject) => {
                  const status = (assignment as any).status || "ACTIVE";
                  const isActive = status === "ACTIVE";
                  const isRemoved = status === "REMOVED";

                  return (
                    <View
                      key={assignment.id}
                      style={[
                        styles.historyItem,
                        isRemoved && styles.removedHistoryItem,
                      ]}
                    >
                      <View style={styles.historyInfo}>
                        <View style={styles.historyHeader}>
                          <Text style={styles.historyRoomName}>
                            {assignment.room?.name || "Unknown Room"}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              isActive
                                ? styles.activeStatusBadge
                                : styles.inactiveStatusBadge,
                            ]}
                          >
                            <Text style={styles.statusText}>
                              {isActive ? "ACTIVE" : status}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.historyQuantity}>
                          Quantity: {assignment.quantity}
                        </Text>
                        <Text style={styles.historyDate}>
                          Added:{" "}
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </Text>
                        {/* TODO: Uncomment when user types are updated
                        {assignment.user && (
                          <Text style={styles.historyUser}>
                            Assigned by: {assignment.user.firstName} {assignment.user.lastName}
                          </Text>
                        )}
                        */}
                      </View>
                    </View>
                  );
                })}
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
  scrollView: {
    flex: 1,
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addEquipmentButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  addEquipmentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  equipmentInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
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
  equipmentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#fef2f2",
    borderRadius: 6,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  placeholder: {
    width: 40,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  equipmentSelection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  equipmentSelectionContainer: {
    marginBottom: 12,
  },
  equipmentSelectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedEquipment: {
    borderColor: Colors.light.primary,
    backgroundColor: "#f0f9ff",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.primary,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 30,
    textAlign: "center",
  },
  modalFooter: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  selectedSummary: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  totalQuantity: {
    fontSize: 12,
    color: "#64748b",
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
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
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyRoomName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatusBadge: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
    borderWidth: 1,
  },
  inactiveStatusBadge: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
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
  historyUser: {
    fontSize: 12,
    color: "#64748b",
  },
  removedHistoryItem: {
    opacity: 0.7,
    backgroundColor: "#f0f0f0",
    borderColor: "#e0e0e0",
  },
  disabledEquipment: {
    opacity: 0.7,
    backgroundColor: "#f0f0f0",
    borderColor: "#e0e0e0",
  },
  disabledText: {
    color: "#94a3b8",
  },
  quantityInfo: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableQuantity: {
    fontSize: 12,
    color: "#64748b",
  },
  assignedInfo: {
    fontSize: 12,
    color: "#64748b",
  },
  disabledIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  disabledIndicatorText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  disabledQuantityButton: {
    opacity: 0.5,
  },
  maxQuantityText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 10,
  },
});
