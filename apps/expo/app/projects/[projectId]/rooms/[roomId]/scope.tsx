import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  FlatList,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Text } from "@/components/ui/text";
import { router, useGlobalSearchParams, useRouter } from "expo-router";
import { userStore } from "@/lib/state/user";
import { roomsStore } from "@/lib/state/rooms";
import { ArrowLeft, Save, Search, ChevronDown, Ruler, DoorClosed, Wind } from "lucide-react-native";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { api } from "@/lib/api";

// Constants for area types and equipment
const areaAffectedTitle = {
  wall: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const areaAffectedOrder = ["wall", "floor", "ceiling"] as const;

const equipmentOptions = [
  "Fan",
  "Dehumidifier",
  "Air Scrubber",
  "Air Mover",
  "HEPA Vacuum",
  "Drying System",
];

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#1e88e5",
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
    borderColor: "#1e88e5",
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
    backgroundColor: "#1e88e5",
    shadowColor: "#1e88e5",
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
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 16,
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

export default function RoomScopeScreen() {
  const { roomId, roomName, projectId } = useGlobalSearchParams<{
    roomId: string;
    roomName: string;
    projectId: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("wall");
  const [localChanges, setLocalChanges] = useState<Record<string, any>>({});
  const rooms = roomsStore();
  const router = useRouter();
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const { top, bottom } = useSafeAreaInsets();
  useEffect(() => {
    // Find the room in the rooms store
    const foundRoom = rooms.rooms.find((r) => r.publicId === roomId);
    if (foundRoom) {
      setRoom(foundRoom);
      setLoading(false);
    } else {
      // If not found in store, fetch from API
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = () => {
    setLoading(true);
    api.get(`/api/v1/projects/${projectId}/room`)
      .then((res) => {
        const data = res.data;
        const foundRoom = data.rooms.find((r: any) => r.publicId === roomId);
        if (foundRoom) {
          setRoom(foundRoom);
          rooms.setRooms(data.rooms);
        } else {
          toast.error("Room not found");
          router.back();
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching room:", error);
        setLoading(false);
        toast.error("Failed to load room");
      });
  };

  const saveAffectedArea = async (
    data: any,
    type: string,
    roomId: string
  ) => {
    setSaving(true);
    setHasChanges(true);

    try {
      const res = await api.post(`/api/v1/projects/${projectId}/room/affected-area`, {
        roomId,
        affectedAreaData: data,
        type,
      });
      const json = res.data;
      if (res.status !== 200) {
        toast.error("Failed to save changes");
      } else {
        toast.success("Changes saved successfully");
      }

      if (res.status !== 200) {
        toast.error("Failed to save changes");
      } else {
        // Update the room in the store
        const updatedRoom = { ...room };
        const areaIndex = updatedRoom.AreaAffected.findIndex(
          (a: any) => a.type === type
        );
        
        if (areaIndex >= 0) {
          updatedRoom.AreaAffected[areaIndex] = {
            ...updatedRoom.AreaAffected[areaIndex],
            ...json.areaAffected,
          };
        } else {
          updatedRoom.AreaAffected.push(json.areaAffected);
        }
        
        setRoom(updatedRoom);
        toast.success("Changes saved successfully");
        fetchRoom();
        setHasChanges(false);
        setLocalChanges({});
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAreaToggle = async (type: string, checked: boolean) => {
    try {
      if (!room?.AreaAffected) {
        room.AreaAffected = [];
      }

      const existingArea = room.AreaAffected.find(
        (a: any) => a.type === type && !a.isDeleted
      );
      console.log("🚀 ~ handleAreaToggle ~ room.AreaAffected:", room.AreaAffected)
      console.log("🚀 ~ handleAreaToggle ~ existingArea:",roomId,type, existingArea)
    //   return;
      setSaving(true);

      if (existingArea) {
        // If area exists and is being unchecked, mark as deleted
        const res = await api.post(`/api/v1/projects/${projectId}/room/affected-area`, {
          roomId: room.publicId,
          affectedAreaData: { isDeleted: true, id: existingArea.id },
          type,
        });

        if (res.status !== 200) {
          throw new Error("Failed to update area");
        }

        // Update local state
        setRoom((prevRoom: any) => ({
          ...prevRoom,
          AreaAffected: prevRoom.AreaAffected.map((a: any) =>
            a.id === existingArea.id ? { ...a, isDeleted: true } : a
          ),
        }));

      } else if (checked) {
        // Create new area
        const res = await api.post(`/api/v1/projects/${projectId}/room/affected-area`, {
          roomId: room.publicId,
          affectedAreaData: { isDeleted: false },
          type,
        });
        const json = res.data;
        console.log("🚀 ~ handleAreaToggle ~ json:", json)
        if (res.status !== 200) {
          throw new Error("Failed to create area");
        }

        // Update local state
        setRoom((prevRoom: any) => ({
          ...prevRoom,
          AreaAffected: [...(prevRoom.AreaAffected || []), json.areaAffected],
        }));

        // Set this as the active tab
        setActiveTab(type);
      }

      toast.success("Area updated successfully");
      fetchRoom();
    } catch (error) {
      console.error("Error toggling area:", error);
      toast.error("Failed to update area");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string,
    areaType: string,
    areaId: number
  ) => {
    // Store the change locally first
    setLocalChanges(prev => ({
      ...prev,
      [`${areaType}_${areaId}_${field}`]: value
    }));
    setHasChanges(true);
  };

  const saveRoomDetails = async (data: any) => {
    console.log("🚀 ~ saveRoomDetails ~ data:", data)
    console.log("🚀 ~ saveRoomDetails ~ roomId:", roomId)

    setSaving(true);
    try {
      const res = await api.patch(
        `/api/v1/projects/${projectId}/room`,
        {
          roomId,
          ...data,
        },
     
      );

      if (res.status !== 200) {
        toast.error("Failed to save room details");
        return;
      }

      const json = res.data;
      setRoom((prev: Record<string, any>) => ({ ...prev, ...json.room }));
      toast.success("Room details saved successfully");
      setHasChanges(false);
      setLocalChanges({});
      setRoom({
        ...room,
        ...data
      });
      // Refetch room data to ensure we have the latest state
      fetchRoom();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save room details");
    } finally {
      setSaving(false);
    }
  };

  const handleRoomDetailChange = (field: string, value: string) => {
    setLocalChanges((prev: Record<string, any>) => ({
      ...prev,
      [`room_${field}`]: value
    }));
    setHasChanges(true);
  };

  const getRoomFieldValue = (obj: any, field: string) => {
    if (!obj) return "";
    
    // If it's a room field
    if (field.startsWith("room_") || !obj.type) {
      const key = `room_${field}`;
      return localChanges[key] !== undefined ? localChanges[key] : obj[field] || "";
    }
    
    // If it's an area field
    const key = `${obj.type}_${obj.id}_${field}`;
    return localChanges[key] !== undefined ? localChanges[key] : obj[field] || "";
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) => {
      const isSelected = prev.includes(equipment);
      const newSelection = isSelected
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment];

      // Update the room equipment field
      handleRoomDetailChange("equipmentUsed", newSelection);
      return newSelection;
    });
  };

  const filteredEquipment = equipmentOptions.filter(equipment =>
    equipment.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const saveAllChanges = () => {
    // First, save room details if they've changed
    const roomChanges = Object.entries(localChanges)
      .filter(([key]) => key.startsWith("room_"))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key.replace("room_", "")]: value
      }), {});

    if (Object.keys(roomChanges).length > 0) {
      saveRoomDetails(roomChanges);
    }

    // Then save area changes
    const areaChanges = Object.entries(localChanges)
      .filter(([key]) => !key.startsWith("room_"))
      .reduce((acc, [key, value]) => {
        const [areaType, areaId, field] = key.split('_');
        if (!acc[`${areaType}_${areaId}`]) {
          acc[`${areaType}_${areaId}`] = {};
        }
        acc[`${areaType}_${areaId}`][field] = value;
        return acc;
      }, {} as Record<string, Record<string, any>>);

    Object.entries(areaChanges).forEach(([key, changes]) => {
      const [areaType, areaId] = key.split('_');
      saveAffectedArea(
        { ...changes, id: parseInt(areaId) },
        areaType,
        room.publicId
      );
    });
  };

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ room:", room)

    // Set initial equipment selection when room data is loaded
    if (room?.equipmentUsed) {
      setSelectedEquipment(room.equipmentUsed);
    }
  }, [room]);

  if (loading && !room) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
  >
    <View className="flex-1 bg-background" >
      <View style={[styles.headerContainer, { paddingTop: top }]}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 bg-white/10 rounded-full"
          >
            <ArrowLeft color="white" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-semibold">
              {roomName}
            </Text>
            <Text className="text-white/80 text-sm">Room Scope Details</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-background">
        <View className="px-5 py-6">
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View className="flex-row items-center">
                <View style={styles.iconContainer}>
                  <Ruler size={24} color="#1e88e5" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Room Dimensions</Text>
                  <Text style={styles.sectionDescription}>Enter room measurements and details</Text>
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
                      value={getRoomFieldValue(room, "length")}
                      onChangeText={(text) => handleRoomDetailChange("length", text)}
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.unitLabel}>ft</Text>
                  </View>
                  <View style={styles.dimensionInput}>
                    <TextInput
                      style={[styles.input, { paddingRight: 45 }]}
                      placeholder="Width"
                      keyboardType="numeric"
                      value={getRoomFieldValue(room, "width")}
                      onChangeText={(text) => handleRoomDetailChange("width", text)}
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.unitLabel}>ft</Text>
                  </View>
                  <View style={styles.dimensionInput}>
                    <TextInput
                      style={[styles.input, { paddingRight: 45 }]}
                      placeholder="Height"
                      keyboardType="numeric"
                      value={getRoomFieldValue(room, "height")}
                      onChangeText={(text) => handleRoomDetailChange("height", text)}
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
                      <Text style={[styles.inputLabel, { marginBottom: 0 }]}># Doors</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={(getRoomFieldValue(room, "doors")).toString()}
                      onChangeText={(text) => handleRoomDetailChange("doors", text)}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.dimensionInput}>
                    <View className="flex-row items-center mb-2">
                      <Wind size={16} color="#334155" className="mr-2" />
                      <Text style={[styles.inputLabel, { marginBottom: 0 }]}># Windows</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={(getRoomFieldValue(room, "windows")).toString()}
                      onChangeText={(text) => handleRoomDetailChange("windows", text)}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.dimensionInput}>
                    <Text style={styles.inputLabel}>Total Area</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: "#f1f5f9" }]}
                      editable={false}
                      value={`${
                        Number(getRoomFieldValue(room, "length") || 0) *
                        Number(getRoomFieldValue(room, "width") || 0)
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
                  <Text className="text-slate-700 text-base">
                    {selectedEquipment.length > 0
                      ? selectedEquipment.join(", ")
                      : "Select equipment..."}
                  </Text>
                  <ChevronDown size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Areas Affected</Text>
              <Text style={styles.sectionDescription}>Select areas that need attention</Text>
            </View>
            
            <View style={styles.cardContent}>
              <View className="space-y-3">
                {[
                  { id: "walls", type: "wall", label: "Walls" },
                  { id: "ceilings", type: "ceiling", label: "Ceilings" },
                  { id: "floors", type: "floor", label: "Floors" },
                ].map(({ id, type, label }) => {
                  const isChecked = room?.AreaAffected?.some(
                    (a: any) => a?.type === type && !a?.isDeleted
                  ) ?? false;
                  
                  return (
                    <View
                      key={id}
                      style={[
                        styles.areaToggle,
                        isChecked && styles.areaToggleActive,
                      ]}
                    >
                      <Text className="text-slate-700 font-medium text-base">{label}</Text>
                      <Switch
                        value={isChecked}
                        onValueChange={(value) => handleAreaToggle(type, value)}
                        trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
                        thumbColor={isChecked ? "#1e88e5" : "#ffffff"}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {(room?.AreaAffected?.filter((a: any) => !a.isDeleted) || []).length > 0 ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Area Details</Text>
                <Text style={styles.sectionDescription}>Document affected area specifications</Text>
              </View>
              
              <View style={styles.cardContent}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.areaTabsContainer}
                >
                  {(room?.AreaAffected?.filter((a: any) => !a.isDeleted) || []).map(
                    (area: any) => (
                      <TouchableOpacity
                        key={area.publicId}
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
                          {areaAffectedTitle[area.type as keyof typeof areaAffectedTitle]}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>

                {(room?.AreaAffected?.filter((a: any) => !a.isDeleted) || []).map(
                  (area: any) => {
                    if (area.type !== activeTab) return null;
                    
                    return (
                      
                      <View key={area.publicId} className="space-y-6">
                       
                        <View style={styles.detailCard}>
                          <Text style={styles.inputLabel}>
                            {area.type === "wall"
                              ? "Wall Material"
                              : area.type === "floor"
                              ? "Floor Material"
                              : "Material"}
                          </Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Enter material type"
                            value={getRoomFieldValue(area, "material")}
                            onChangeText={(text) =>
                              handleInputChange("material", text, area.type, area.id)
                            }
                            placeholderTextColor="#94a3b8"
                          />
                        </View>

                        <View style={styles.detailCard}>
                          <Text style={styles.inputLabel}>Total Area Removed</Text>
                          <View className="relative">
                            <TextInput
                              style={[styles.input, { paddingRight: 55 }]}
                              placeholder="0"
                              keyboardType="numeric"
                              value={getRoomFieldValue(area, "totalAreaRemoved")}
                              onChangeText={(text) =>
                                handleInputChange(
                                  "totalAreaRemoved",
                                  text,
                                  area.type,
                                  area.id
                                )
                              }
                              placeholderTextColor="#94a3b8"
                            />
                            <Text style={styles.unitLabel}>sqft</Text>
                          </View>
                        </View>

                        <View style={styles.detailCard}>
                          <Text style={styles.inputLabel}>
                            Total Area Anti-Microbial Applied
                          </Text>
                          <View className="relative">
                            <TextInput
                              style={[styles.input, { paddingRight: 55 }]}
                              placeholder="0"
                              keyboardType="numeric"
                              value={getRoomFieldValue(area, "totalAreaMicrobialApplied")}
                              onChangeText={(text) =>
                                handleInputChange(
                                  "totalAreaMicrobialApplied",
                                  text,
                                  area.type,
                                  area.id
                                )
                              }
                              placeholderTextColor="#94a3b8"
                            />
                            <Text style={styles.unitLabel}>sqft</Text>
                          </View>
                        </View>

                        {area.type === "wall" && (
                          <View style={styles.detailCard}>
                            <Text style={styles.inputLabel}>Cabinetry Removed</Text>
                            <View className="relative">
                              <TextInput
                                style={[styles.input, { paddingRight: 55 }]}
                                placeholder="0"
                                keyboardType="numeric"
                                value={getRoomFieldValue(area, "cabinetryRemoved")}
                                onChangeText={(text) =>
                                  handleInputChange(
                                    "cabinetryRemoved",
                                    text,
                                    area.type,
                                    area.id
                                  )
                                }
                                placeholderTextColor="#94a3b8"
                              />
                              <Text style={styles.unitLabel}>sqft</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  }
                )}
              </View>
            </View>
          ) : (
            <View style={[styles.card, { padding: 24, alignItems: "center" }]}>
              <Text className="text-slate-500 text-center text-base">
                Select at least one affected area above to add details
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showEquipmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SafeAreaView edges={["bottom"]}>
              <View className="p-5 border-b border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-xl font-semibold text-slate-800">
                    Select Equipment
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowEquipmentModal(false)}
                    className="p-2"
                  >
                    <Text className="text-primary font-medium">Done</Text>
                  </TouchableOpacity>
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
                data={filteredEquipment}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => toggleEquipment(item)}
                    style={styles.equipmentItem}
                    activeOpacity={0.7}
                  >
                    <Text className="text-slate-700 text-base">{item}</Text>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedEquipment.includes(item)
                            ? "#1e88e5"
                            : "#e2e8f0",
                          backgroundColor: selectedEquipment.includes(item)
                            ? "#1e88e5"
                            : "transparent",
                        },
                      ]}
                    >
                      {selectedEquipment.includes(item) && (
                        <Text className="text-white text-sm">✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {hasChanges && (
        <BlurView intensity={20} tint="light" style={styles.saveBar}>
          <View className="flex-row items-center justify-between" style={{ paddingBottom: bottom }}>
            <Text className="text-sm font-medium text-slate-600">
              {saving ? "Saving changes..." : "You have unsaved changes"}
            </Text>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => {
                  setHasChanges(false);
                  setLocalChanges({});
                }}
                className="rounded-xl px-4 py-2 bg-slate-100"
                disabled={saving}
              >
                <Text className="text-sm font-medium text-slate-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveAllChanges}
                className="rounded-xl bg-primary px-6 py-2"
                disabled={saving}
              >
                <Text className="text-sm font-medium text-white">
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      )}
    </View>
    </KeyboardAvoidingView>

  );
} 