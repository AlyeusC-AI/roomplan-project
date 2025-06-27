import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Ruler,
  DoorClosed,
  Wind,
  X,
} from "lucide-react-native";
import { toast } from "sonner-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDebounce } from "@/utils/debounce";
import {
  useGetRooms,
  Room,
  useGetAreaAffected,
  useUpdateAreaAffected,
  useUpdateRoom,
  useCreateEquipment,
  useDeleteEquipment,
  useGetEquipment,
  useUpdateEquipment,
  AreaAffected as AreaAffectedInterface,
  useGetRoom,
} from "@service-geek/api-client";

// Constants for area types and equipment
const areaAffectedTitle = {
  wall: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const equipmentOptions = [
  // "Fan",
  "Dehumidifier",
  "Air Scrubber",
  "Air Mover",
  "HEPA Vacuum",
  "Drying System",
];

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#182e43",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardContent: {
    padding: 20,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#334155",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  areaToggle: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  areaToggleActive: {
    backgroundColor: "#f0f9ff",
    borderColor: "#182e43",
  },
  areaTabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  areaTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  areaTabActive: {
    backgroundColor: "#182e43",
    shadowColor: "#182e43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  areaTabInactive: {
    backgroundColor: "#f1f5f9",
    borderColor: "rgba(0,0,0,0.05)",
  },
  areaTabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  areaTabTextActive: {
    color: "#ffffff",
  },
  areaTabTextInactive: {
    color: "#64748b",
  },
  detailCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "80%",
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  saveBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  saveText: {
    fontSize: 13,
    color: "#64748b",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(30,136,229,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dimensionGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  dimensionInput: {
    flex: 1,
  },
  unitLabel: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
    fontSize: 14,
    color: "#64748b",
  },
  equipmentSelector: {
    backgroundColor: "#f8fafc",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default function Dimensions({ room }: { room: Room }) {
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [saveBarOpacity] = useState(new Animated.Value(0));
  const [saveBarHeight] = useState(new Animated.Value(0));

  const [tempRoom, setTempRoom] = useState<Partial<Room>>(room || {});
  //   useEffect(() => {
  //     if (room) {
  //       setTempRoom(room);
  //     }
  //   }, [room]);

  const [newCustomEquipment, setNewCustomEquipment] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState<
    {
      id: string;
      name: string;
      quantity: number;
    }[]
  >(
    room.equipmentsUsed?.map((e) => ({
      id: e.equipmentId,
      name: equipments?.find((eq) => eq.id === e.equipmentId)?.name || "",
      quantity: e.quantity,
    })) || []
  );
  console.log("🚀 ~ Dimensions ~ equipmentUsed:", equipmentUsed);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    isOpen: boolean;
    equipment: string;
  }>({ isOpen: false, equipment: "" });
  const { data: equipments } = useGetEquipment();
  console.log("🚀 ~ Dimensions ~ equipments:", equipments);
  const { mutate: createEquipment } = useCreateEquipment();
  const { mutate: deleteEquipment } = useDeleteEquipment();
  const { mutate: updateRoom, isPending: saving } = useUpdateRoom();
  console.log(
    "🚀 ~ Dimeaaaasadts:",
    JSON.stringify({ equipments, room }, null, 2)
  );

  useEffect(() => {
    if (equipments && room.equipmentsUsed) {
      const equipmentUsedData =
        room.equipmentsUsed?.map((e) => ({
          id: e.equipmentId,
          name: equipments.find((eq) => eq.id === e.equipmentId)?.name || "",
          quantity: e.quantity,
        })) || [];
      console.log("🚀 ~ useEffect ~ equipmentUsedData:", equipmentUsedData);

      setEquipmentUsed(equipmentUsedData);
    }
  }, [room.equipmentsUsed, equipments]);
  const debouncedData = useDebounce(tempRoom, 1000);
  useEffect(() => {
    if (debouncedData) {
      save();
    }
  }, [debouncedData]);

  const save = async () => {
    try {
      const d = tempRoom;
      if (d.length) {
        d.totalSqft = Number(d.length) * Number(d.width);
      }
      if (d.width) {
        d.totalSqft = Number(d.width) * Number(d.length);
      }

      await updateRoom({
        id: room.id,
        data: {
          name: d.name,
          length: d.length,
          width: d.width,
          height: d.height,
          totalSqft: d.totalSqft,
          windows: d.windows,
          doors: d.doors,
          equipmentUsed: equipmentUsed,
          humidity: d.humidity,
          dehuReading: d.dehuReading,
          temperature: d.temperature,
          roomPlanSVG: d.roomPlanSVG,
          scannedFileKey: d.scannedFileKey,
          cubiTicketId: d.cubiTicketId,
          cubiModelId: d.cubiModelId,
          cubiRoomPlan: d.cubiRoomPlan,
        },
      });
      console.log("🚀 ~ save ~ equipmentUsed:", equipmentUsed);

      //   toast.success("Room updated successfully.");
    } catch (e) {
      toast.error("Failed to update room.");
      console.error(e);
    }
  };

  // Add custom equipment
  const handleAddCustomEquipment = async () => {
    if (!newCustomEquipment.trim()) return;

    try {
      createEquipment({
        quantity: 1,
        name: newCustomEquipment.trim(),
      });
      setNewCustomEquipment("");
      setShowAddCustomModal(false);
      toast.success("Custom equipment added successfully");
    } catch (error) {
      console.error("Error adding custom equipment:", error);
      toast.error("Failed to add custom equipment");
    }
  };

  // Delete custom equipment
  const handleDeleteCustomEquipment = (equipment: string) => {
    setShowDeleteConfirmation({ isOpen: true, equipment });
  };

  const confirmDelete = async () => {
    const { equipment } = showDeleteConfirmation;

    try {
      deleteEquipment(equipment);
      // Also remove from selected equipment if it's selected
      if (equipmentUsed?.some((e) => e.id === equipment)) {
        const newEquipment = equipmentUsed.filter((e) => e.id !== equipment);

        setEquipmentUsed(newEquipment);
      }
      toast.success("Custom equipment deleted successfully");
    } catch (error) {
      console.error("Error deleting custom equipment:", error);
      // toast.error("Failed to delete custom equipment");
    } finally {
      setShowDeleteConfirmation({ isOpen: false, equipment: "" });
    }
  };

  // Update the equipment selection handler
  const handleEquipmentSelect = (currentValue: string) => {
    const isSelected = equipmentUsed?.some((e) => e.id === currentValue);
    const newEquipment = isSelected
      ? equipmentUsed?.filter((e) => e.id !== currentValue)
      : [
          ...(equipmentUsed ?? []),
          {
            id: currentValue,
            name: equipments?.find((e) => e.id === currentValue)?.name || "",
            quantity: 1,
          },
        ];

    setEquipmentUsed(newEquipment);
    // setOpen(false);
  };

  // Add quantity change handler
  const handleQuantityChange = (equipment: string, quantity: number) => {
    setEquipmentUsed(
      equipmentUsed?.map((e) =>
        e.id === equipment ? { ...e, quantity } : e
      ) || []
    );
  };

  const onCloseEquipmentModal = () => {
    setShowEquipmentModal(false);
    save();
  };

  return (
    <>
      <View className="px-5 py-6">
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View className="flex-row items-center">
              <View style={styles.iconContainer}>
                <Ruler size={24} color="#182e43" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Room Dimensions</Text>
                <Text style={styles.sectionDescription}>
                  Enter room measurements and details
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room Size</Text>
              <View style={styles.dimensionGroup}>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { paddingRight: 45 }]}
                    placeholder="Length"
                    keyboardType="numeric"
                    value={tempRoom.length?.toString()}
                    onChangeText={(text) =>
                      setTempRoom({ ...tempRoom, length: Number(text) })
                    }
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={styles.unitLabel}>ft</Text>
                </View>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { paddingRight: 45 }]}
                    placeholder="Width"
                    keyboardType="numeric"
                    value={tempRoom.width?.toString()}
                    onChangeText={(text) =>
                      setTempRoom({ ...tempRoom, width: Number(text) })
                    }
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={styles.unitLabel}>ft</Text>
                </View>
                <View style={styles.dimensionInput}>
                  <TextInput
                    style={[styles.input, { paddingRight: 45 }]}
                    placeholder="Height"
                    keyboardType="numeric"
                    value={tempRoom.height?.toString()}
                    onChangeText={(text) =>
                      setTempRoom({ ...tempRoom, height: Number(text) })
                    }
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={styles.unitLabel}>ft</Text>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Room Features</Text>
              <View style={styles.dimensionGroup}>
                <View style={styles.dimensionInput}>
                  <View className="flex-row items-center mb-2">
                    <DoorClosed size={16} color="#334155" className="mr-2" />
                    <Text style={[styles.inputLabel, { marginBottom: 0 }]}>
                      # Doors
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={tempRoom.doors?.toString()}
                    onChangeText={(text) =>
                      setTempRoom({ ...tempRoom, doors: Number(text) })
                    }
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <View className="flex-row items-center mb-2">
                    <Wind size={16} color="#334155" className="mr-2" />
                    <Text style={[styles.inputLabel, { marginBottom: 0 }]}>
                      # Windows
                    </Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={tempRoom.windows?.toString()}
                    onChangeText={(text) =>
                      setTempRoom({ ...tempRoom, windows: Number(text) })
                    }
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={styles.dimensionInput}>
                  <Text style={styles.inputLabel}>Total Area</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: "#f1f5f9" }]}
                    editable={false}
                    value={`${
                      Number(tempRoom.length || 0) * Number(tempRoom.width || 0)
                    } sqft`}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.inputLabel}>Equipment Used</Text>
              <TouchableOpacity
                onPress={() => setShowEquipmentModal(true)}
                style={styles.equipmentSelector}
              >
                <View style={{ flex: 1 }}>
                  <Text className="text-slate-700 text-base">
                    {equipmentUsed.length > 0
                      ? equipmentUsed
                          .map(
                            (equipment) =>
                              `${equipment.name} (${equipment.quantity})`
                          )
                          .join(", ")
                      : "Select equipment..."}
                  </Text>
                </View>
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={showEquipmentModal}
        transparent
        animationType="slide"
        onRequestClose={onCloseEquipmentModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          // keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <SafeAreaView edges={["bottom"]}>
                <View className="p-5 border-b border-slate-100">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-semibold text-slate-800">
                      Select Equipment
                    </Text>
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => setShowAddCustomModal(true)}
                        className="p-2 mr-4 bg-primary/10 rounded-lg"
                      >
                        <Text className="text-primary font-medium">
                          Add Custom
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={onCloseEquipmentModal}
                        className="p-2"
                      >
                        <Text className="text-primary font-medium">Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={styles.searchContainer}>
                  <Search size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base"
                    placeholder="Search equipment..."
                    value={equipmentSearch}
                    onChangeText={setEquipmentSearch}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <FlatList
                  data={equipments?.filter((e) =>
                    e.name.toLowerCase().includes(equipmentSearch.toLowerCase())
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleEquipmentSelect(item.id)}
                      style={styles.equipmentItem}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-slate-700 text-base">
                            {item.name}
                          </Text>
                          {/* {customEquipment.includes(item) && (
                              <TouchableOpacity
                                onPress={() =>
                                  handleDeleteCustomEquipment(item)
                                }
                                className="p-2"
                              >
                                <X size={16} color="#ef4444" />
                              </TouchableOpacity>
                            )} */}
                        </View>
                        {equipmentUsed.some((e) => e.id === item.id) && (
                          <View
                            style={{
                              marginTop: 8,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text className="text-sm text-slate-500 mr-2">
                              Quantity:
                            </Text>
                            <TextInput
                              style={[styles.input, { width: 80, padding: 8 }]}
                              keyboardType="numeric"
                              value={
                                equipmentUsed
                                  .find((e) => e.id === item.id)
                                  ?.quantity.toString() || ""
                              }
                              onChangeText={(text) => {
                                const quantity = parseInt(text) || 0;
                                handleQuantityChange(item.id, quantity);
                              }}
                              placeholderTextColor="#94a3b8"
                              // editable={!saving}
                            />
                          </View>
                        )}
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: equipmentUsed.some(
                              (e) => e.id === item.id
                            )
                              ? "#182e43"
                              : "#e2e8f0",
                            backgroundColor: equipmentUsed.some(
                              (e) => e.id === item.id
                            )
                              ? "#182e43"
                              : "transparent",
                          },
                        ]}
                      >
                        {equipmentUsed.some((e) => e.id === item.id) && (
                          <Text className="text-white text-sm">✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 400 }}
                  contentContainerStyle={{ paddingBottom: 120 }}
                  showsVerticalScrollIndicator={false}
                />
              </SafeAreaView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showAddCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddCustomModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer} className="">
            <View style={styles.modalContent} className="pb-12">
              <SafeAreaView edges={["bottom"]}>
                <View className="p-5 border-b border-slate-100">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-xl font-semibold text-slate-800">
                      Add Custom Equipment
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowAddCustomModal(false)}
                      className="p-2"
                    >
                      <X size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="p-5 space-y-4 ">
                  <View className="mb-4">
                    <Text className="text-sm font-medium text-slate-700 mb-4">
                      Equipment Name
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter equipment name"
                      value={newCustomEquipment}
                      onChangeText={setNewCustomEquipment}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleAddCustomEquipment}
                    className="bg-primary p-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-medium">
                      Add Equipment
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showDeleteConfirmation.isOpen}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowDeleteConfirmation({ isOpen: false, equipment: "" })
        }
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={["bottom"]}>
              <View className="p-5 border-b border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-semibold text-slate-800">
                    Delete Equipment
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setShowDeleteConfirmation({
                        isOpen: false,
                        equipment: "",
                      })
                    }
                    className="p-2"
                  >
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="p-5 space-y-4">
                <Text className="text-slate-700">
                  Are you sure you want to delete "
                  {showDeleteConfirmation.equipment}"? This action cannot be
                  undone.
                </Text>

                <View className="flex-row gap-3 pt-4">
                  <TouchableOpacity
                    onPress={() =>
                      setShowDeleteConfirmation({
                        isOpen: false,
                        equipment: "",
                      })
                    }
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <Text className="text-center text-slate-700">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-500 rounded-lg"
                  >
                    <Text className="text-center text-white">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      <Animated.View
        style={[
          styles.saveBar,
          {
            opacity: saveBarOpacity,
            transform: [
              {
                translateY: Animated.multiply(
                  saveBarHeight,
                  new Animated.Value(-50)
                ),
              },
            ],
          },
        ]}
      >
        <View style={styles.saveBarContent}>
          {saving ? (
            <>
              <View
                style={[styles.saveIndicator, { backgroundColor: "#182e43"  }]}
              />
              <Text style={styles.saveText}>Saving changes...</Text>
            </>
          ) : (
            <>
              <View
                style={[styles.saveIndicator, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.saveText}>Changes saved</Text>
            </>
          )}
        </View>
      </Animated.View>
    </>
  );
}
