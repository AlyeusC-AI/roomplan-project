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
import { useOfflineUpdateAreaAffected } from "@/lib/hooks/useOfflineScope";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { RoomReadingInput } from "../reading";

// Constants for area types and equipment
const areaAffectedTitle = {
  walls: "Walls",
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
    backgroundColor: "#15438e",
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
    borderColor: "#15438e",
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
    backgroundColor: "#15438e",
    shadowColor: "#15438e",
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

export default function AffectedArea({ room }: { room: Room }) {
  const { roomId, roomName, projectId } = useGlobalSearchParams<{
    roomId: string;
    roomName: string;
    projectId: string;
  }>();
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("wall");
  const [localChanges, setLocalChanges] = useState<Record<string, any>>({});

  const [saveBarOpacity] = useState(new Animated.Value(0));
  const [saveBarHeight] = useState(new Animated.Value(0));
  const [showExtraFieldModal, setShowExtraFieldModal] = useState(false);
  const [editingExtraField, setEditingExtraField] = useState<{
    id: string;
    label: string;
    unit: string;
  } | null>(null);
  const [newExtraField, setNewExtraField] = useState({ label: "", unit: "" });
  const [extraFieldValues, setExtraFieldValues] = useState<
    Record<string, string>
  >({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    fieldId: string;
    areaType: string;
    areaId: number;
  } | null>(null);
  const { data: areaAffected, isLoading } = useGetAreaAffected(room.id);
  const { mutate: updateAreaAffected } = useOfflineUpdateAreaAffected();
  const { isOffline } = useNetworkStatus();
  const areaAffecteds = [
    {
      ...areaAffected?.wallsAffected,
      type: "walls",
    },
    {
      ...areaAffected?.ceilingAffected,
      type: "ceiling",
    },
    {
      ...areaAffected?.floorAffected,
      type: "floor",
    },
  ].filter((a) => a.isVisible);
  // Modify handleInputChange to be simpler
  const handleInputChange = (
    field: string,
    value: string,
    areaType: string,
    areaId: number
  ) => {
    setLocalChanges((prev) => ({
      ...prev,
      [`${areaType}_${areaId}_${field}`]: value,
    }));
    setHasChanges(true);
  };

  const saveAffectedArea = async (
    data: any,
    type: "walls" | "ceiling" | "floor"
  ) => {
    setSaving(true);
    setHasChanges(true);

    try {
      await updateAreaAffected(room.id, type, data, projectId);

      setHasChanges(false);
      setLocalChanges({});
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Modify handleAreaToggle to trigger auto-save
  const handleAreaToggle = async (
    type: "walls" | "ceiling" | "floor",
    checked: boolean
  ) => {
    try {
      await updateAreaAffected(
        room.id,
        type,
        {
          isVisible: checked,
        },
        projectId
      );
    } catch (error) {
      console.error("Error toggling area:", error);
      toast.error("Failed to update area");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExtraField = (
    areaType: "walls" | "ceiling" | "floor",
    areaId: number
  ) => {
    if (!newExtraField.label) return;

    const fieldId = `extra_${Date.now()}`;
    const updatedArea = {
      ...areaAffecteds.find((a: any) => a.id === areaId),
      extraFields: {
        ...(areaAffecteds.find((a: any) => a.id === areaId)?.extraFields || {}),
        [fieldId]: {
          label: newExtraField.label,
          unit: newExtraField.unit,
          value: "",
        },
      },
    };

    saveAffectedArea({ extraFields: updatedArea.extraFields }, areaType);

    setNewExtraField({ label: "", unit: "" });
    setShowExtraFieldModal(false);
    setExtraFieldValues((prev) => ({
      ...prev,
      [fieldId]: "",
    }));
  };

  const handleUpdateExtraField = (
    areaType: "walls" | "ceiling" | "floor",
    areaId: number,
    fieldId: string
  ) => {
    if (!editingExtraField) return;

    const updatedArea = {
      ...areaAffecteds.find((a: any) => a.id === areaId),
      extraFields: {
        ...(areaAffecteds.find((a: any) => a.id === areaId)?.extraFields || {}),
        [fieldId]: {
          ...(areaAffecteds.find((a: any) => a.id === areaId)?.extraFields?.[
            fieldId
          ] || {}),
          label: editingExtraField.label,
          unit: editingExtraField.unit,
        },
      },
    };

    saveAffectedArea({ extraFields: updatedArea.extraFields }, areaType);
    setEditingExtraField(null);
  };

  // Update handleRemoveExtraField to use confirmation
  const handleRemoveExtraField = (
    areaType: string,
    areaId: number,
    fieldId: string
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      fieldId,
      areaType,
      areaId,
    });
  };

  // Add confirmDelete function
  const confirmDeleteExtraField = async () => {
    if (!deleteConfirmation) return;

    const { fieldId, areaType, areaId } = deleteConfirmation;
    const updatedArea = {
      ...areaAffecteds.find((a: any) => a.id === areaId),
      extraFields: {
        ...(areaAffecteds.find((a: any) => a.id === areaId)?.extraFields || {}),
      },
    };

    // Remove the field from extraFields
    delete updatedArea.extraFields[fieldId];

    // Remove from local state
    setExtraFieldValues((prev) => {
      const newValues = { ...prev };
      delete newValues[fieldId];
      return newValues;
    });

    saveAffectedArea({ extraFields: updatedArea.extraFields }, areaType);
    setDeleteConfirmation(null);
  };

  return (
    <View className="flex-1 bg-background">
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Areas Affected</Text>
          <Text style={styles.sectionDescription}>
            Select areas that need attention
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View className="space-y-3">
            {[
              {
                id: "walls",
                type: "walls",
                label: "Walls",
                isVisible: areaAffected?.wallsAffected?.isVisible,
              },
              {
                id: "ceiling",
                type: "ceiling",
                label: "Ceiling",
                isVisible: areaAffected?.ceilingAffected?.isVisible,
              },
              {
                id: "floor",
                type: "floor",
                label: "Floor",
                isVisible: areaAffected?.floorAffected?.isVisible,
              },
            ].map(({ id, type, label, isVisible }) => {
              const isChecked = isVisible ?? false;

              return (
                <View
                  key={id}
                  style={[
                    styles.areaToggle,
                    isChecked && styles.areaToggleActive,
                  ]}
                >
                  <Text className="text-slate-700 font-medium text-base">
                    {label}
                  </Text>
                  <Switch
                    value={isChecked}
                    onValueChange={(value) => handleAreaToggle(type, value)}
                    trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                    thumbColor={isChecked ? "#15438e" : "#ffffff"}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {areaAffecteds.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Area Details</Text>
            <Text style={styles.sectionDescription}>
              Document affected area specifications
            </Text>
          </View>

          <View style={styles.cardContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.areaTabsContainer}
            >
              {areaAffecteds.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => setActiveTab(area.type)}
                  style={[
                    styles.areaTab,
                    activeTab === area.type
                      ? styles.areaTabActive
                      : styles.areaTabInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.areaTabText,
                      activeTab === area.type
                        ? styles.areaTabTextActive
                        : styles.areaTabTextInactive,
                    ]}
                  >
                    {
                      areaAffectedTitle[
                        area.type as keyof typeof areaAffectedTitle
                      ]
                    }
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {areaAffecteds.map((area) => {
              if (area.type !== activeTab) return null;

              return (
                <View key={area.id} className="space-y-6">
                  <View style={styles.detailCard}>
                    <Text style={styles.inputLabel}>
                      {area.type === "wall"
                        ? "Wall Material"
                        : area.type === "floor"
                          ? "Floor Material"
                          : "Material"}
                    </Text>
                    <RoomReadingInput
                      // style={styles.input}
                      placeholder="Enter material type"
                      value={
                        // getRoomFieldValue(area, "material")
                        area.material || ""
                      }
                      onChange={(text) =>
                        saveAffectedArea({ material: text }, area.type)
                      }
                      // placeholderTextColor="#94a3b8"
                      rightText="sqft"
                    />
                    {/* <MaterialSelect
                            value={getRoomFieldValue(area, "material")}
                            onValueChange={(value) =>
                              handleInputChange("material", value, area.type, area.id)
                            }
                            options={area.type === "wall" ? wallOptions : floorOptions}
                            title={area.type === "wall" ? "Wall Material" : "Floor Material"}
                            type={area.type === "wall" ? "wallMaterial" : "floorMaterial"}
                          /> */}
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={styles.inputLabel}>Total Area Removed</Text>
                    <View className="relative">
                      <RoomReadingInput
                        // style={[styles.input, { paddingRight: 55 }]}
                        placeholder="0"
                        value={area.totalAreaRemoved || ""}
                        onChange={(text) =>
                          saveAffectedArea(
                            { totalAreaRemoved: text },
                            area.type
                          )
                        }
                        rightText="sqft"
                      />
                      {/* <Text style={styles.unitLabel}>sqft</Text> */}
                    </View>
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={styles.inputLabel}>
                      Total Area Anti-Microbial Applied
                    </Text>
                    <View className="relative">
                      <RoomReadingInput
                        // style={[styles.input, { paddingRight: 55 }]}
                        placeholder="0"
                        value={area.totalAreaMicrobialApplied || ""}
                        onChange={(text) =>
                          saveAffectedArea(
                            { totalAreaMicrobialApplied: text },
                            area.type
                          )
                        }
                        rightText="sqft"
                      />
                      {/* <Text style={styles.unitLabel}>sqft</Text> */}
                    </View>
                  </View>

                  {area.type === "wall" && (
                    <View style={styles.detailCard}>
                      <Text style={styles.inputLabel}>Cabinetry Removed</Text>
                      <View className="relative">
                        <RoomReadingInput
                          // style={[styles.input, { paddingRight: 55 }]}
                          placeholder="0"
                          value={area.cabinetryRemoved || ""}
                          onChange={(text) =>
                            saveAffectedArea(
                              { cabinetryRemoved: text },
                              area.type
                            )
                          }
                          rightText="sqft"
                        />
                        {/* <Text style={styles.unitLabel}>sqft</Text> */}
                      </View>
                    </View>
                  )}

                  {/* Extra Fields Section */}
                  <View style={styles.detailCard}>
                    <View className="flex-row items-center justify-between mb-4">
                      <Text style={styles.inputLabel}>Additional Fields</Text>
                      <TouchableOpacity
                        onPress={() => setShowExtraFieldModal(true)}
                        className="p-2 bg-primary/10 rounded-lg"
                      >
                        <Text className="text-primary font-medium">
                          Add Field
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {area.extraFields &&
                      Object.entries(area.extraFields).map(
                        ([fieldId, field]: [string, any]) => (
                          <View key={fieldId} className="mb-4">
                            <View className="flex-row items-center justify-between mb-2">
                              <Text className="text-slate-700 font-medium">
                                {field.label}
                              </Text>
                              <View className="flex-row items-center">
                                <TouchableOpacity
                                  onPress={() =>
                                    setEditingExtraField({
                                      id: fieldId,
                                      label: field.label,
                                      unit: field.unit,
                                    })
                                  }
                                  className="p-1 mr-2"
                                >
                                  <Text className="text-primary text-sm">
                                    Edit
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    handleRemoveExtraField(
                                      area.type,
                                      area.id,
                                      fieldId
                                    )
                                  }
                                  className="p-1"
                                >
                                  <Text className="text-red-500 text-sm">
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View className="relative">
                              <RoomReadingInput
                                // style={[styles.input, { paddingRight: 55 }]}
                                placeholder="0"
                                value={extraFieldValues[fieldId] ?? field.value}
                                onChange={(text) => {
                                  // setExtraFieldValues((prev) => ({
                                  //   ...prev,
                                  //   [fieldId]: text,
                                  // }));
                                  saveAffectedArea(
                                    {
                                      extraFields: {
                                        ...area.extraFields,
                                        [fieldId]: {
                                          ...field,
                                          value: text,
                                        },
                                      },
                                    },
                                    area.type
                                  );
                                }}
                                rightText={field.unit}
                              />
                              {/* <Text style={styles.unitLabel}>{field.unit}</Text> */}
                            </View>
                          </View>
                        )
                      )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={[styles.card, { padding: 24, alignItems: "center" }]}>
          <Text className="text-slate-500 text-center text-base">
            Select at least one affected area above to add details
          </Text>
        </View>
      )}

      <Modal
        visible={showExtraFieldModal || !!editingExtraField}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowExtraFieldModal(false);
          setEditingExtraField(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent} className="pb-12">
              <SafeAreaView edges={["bottom"]}>
                <View className="p-5 border-b border-slate-100">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-semibold text-slate-800">
                      {editingExtraField ? "Edit Field" : "Add New Field"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowExtraFieldModal(false);
                        setEditingExtraField(null);
                      }}
                      className="p-2"
                    >
                      <Text className="text-primary font-medium">Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="p-5 space-y-4 gap-8">
                  <View>
                    <Text className="text-sm font-medium text-slate-700 mb-4">
                      Field Label
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter field label"
                      value={
                        editingExtraField
                          ? editingExtraField.label
                          : newExtraField.label
                      }
                      onChangeText={(text) => {
                        if (editingExtraField) {
                          setEditingExtraField({
                            ...editingExtraField,
                            label: text,
                          });
                        } else {
                          setNewExtraField({ ...newExtraField, label: text });
                        }
                      }}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <View className="mb-2">
                    <Text className="text-sm font-medium text-slate-700 mb-4">
                      Unit
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter unit (e.g., sqft, ft, etc.)"
                      value={
                        editingExtraField
                          ? editingExtraField.unit
                          : newExtraField.unit
                      }
                      onChangeText={(text) => {
                        if (editingExtraField) {
                          setEditingExtraField({
                            ...editingExtraField,
                            unit: text,
                          });
                        } else {
                          setNewExtraField({ ...newExtraField, unit: text });
                        }
                      }}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (editingExtraField) {
                        handleUpdateExtraField(
                          activeTab as "walls" | "ceiling" | "floor",
                          areaAffecteds.find((a: any) => a.type === activeTab)
                            ?.id,
                          editingExtraField.id
                        );
                      } else {
                        handleAddExtraField(
                          activeTab as "walls" | "ceiling" | "floor",
                          areaAffecteds.find((a: any) => a.type === activeTab)
                            ?.id
                        );
                      }
                    }}
                    className="bg-primary p-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-medium">
                      {editingExtraField ? "Update Field" : "Add Field"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!deleteConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteConfirmation(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={["bottom"]}>
              <View className="p-5 border-b border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-semibold text-slate-800">
                    Delete Field
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDeleteConfirmation(null)}
                    className="p-2"
                  >
                    <X size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="p-5 space-y-4 mb-12">
                <Text className="text-slate-700">
                  Are you sure you want to delete this field? This action cannot
                  be undone.
                </Text>

                <View className="flex-row gap-3 pt-4">
                  <TouchableOpacity
                    onPress={() => setDeleteConfirmation(null)}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <Text className="text-center text-slate-700">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmDeleteExtraField}
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
    </View>
  );
}
