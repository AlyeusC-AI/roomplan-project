import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { toast } from "sonner-native";
import { Label } from "@/components/ui/label";
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Trash2,
  Save,
  Plus,
  Check,
  X,
  Droplets,
} from "lucide-react-native";
import AddRoomButton from "@/components/project/AddRoomButton";

// Type assertions to fix ReactNode compatibility
const ChevronLeftIcon = ChevronLeft as any;
const Trash2Icon = Trash2 as any;
const SaveIcon = Save as any;
const PlusIcon = Plus as any;
const CheckIcon = Check as any;
const XIcon = X as any;
const DropletsIcon = Droplets as any;

import {
  useCreateChamber,
  useUpdateChamber,
  useDeleteChamber,
  useGetRooms,
  useGetChamber,
  useGetProjectById,
} from "@service-geek/api-client";

// Define WaterDamageClass type
type WaterDamageClass = "Class 1" | "Class 2" | "Class 3" | "Class 4";

// Water damage categories with descriptions
const WATER_DAMAGE_CATEGORIES = [
  {
    label: "Category 1",
    value: "Category 1",
    description:
      "Water from a clean and sanitary source that poses no health risk through skin contact, ingestion, or inhalation.",
  },
  {
    label: "Category 2",
    value: "Category 2",
    description:
      "Water that is moderately contaminated and may cause illness if touched or consumed.",
  },
  {
    label: "Category 3",
    value: "Category 3",
    description:
      "Heavily contaminated water containing harmful agents such as pathogens or toxins. Can cause serious health effects if touched or ingested.",
  },
];

// Water damage classes with descriptions
const WATER_DAMAGE_CLASSES = [
  { label: "Class 1 – Minimal Damage", value: "Class 1" as WaterDamageClass },
  {
    label: "Class 2 – Significant Damage",
    value: "Class 2" as WaterDamageClass,
  },
  { label: "Class 3 – Extensive Damage", value: "Class 3" as WaterDamageClass },
  { label: "Class 4 – Specialty Drying", value: "Class 4" as WaterDamageClass },
];

export default function ChamberCreationScreen() {
  const [chamberName, setChamberName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<
    { roomId: string; isEffected: boolean }[]
  >([]);
  const [waterDamageCategory, setWaterDamageCategory] = useState("");
  const [waterClass, setWaterClass] = useState<WaterDamageClass | undefined>();
  console.log("🚀 ~ ChamberCreationScreen ~ selectedRooms:", selectedRooms);

  const router = useRouter();
  const { mutate: createChamberMutation } = useCreateChamber();
  const { mutate: updateChamberMutation } = useUpdateChamber();
  const { mutate: deleteChamberMutation } = useDeleteChamber();

  const {
    projectId,
    projectName,
    chamberName: chamberNameParam,
    chamberId: chamberIdParam,
  } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
    chamberName: string;
    chamberId: string;
  }>();

  const { data: rooms, isLoading: isLoadingRooms } = useGetRooms(
    projectId || ""
  );
  const { data: existingChamber } = useGetChamber(chamberIdParam || "");
  const { data: project } = useGetProjectById(projectId || "");

  useEffect(() => {
    if (chamberNameParam) {
      setChamberName(chamberNameParam);
    }
  }, [chamberNameParam]);

  // Load existing chamber data when editing
  useEffect(() => {
    if (existingChamber) {
      setChamberName(existingChamber.name);
      setSelectedRooms(
        existingChamber.roomChambers.map((rc) => ({
          roomId: rc.roomId,
          isEffected: rc.isEffected,
        }))
      );
      setWaterDamageCategory(existingChamber.catCode || "");
      setWaterClass(existingChamber.waterClass as WaterDamageClass);
    }
  }, [existingChamber]);

  // Set initial values from project if creating new chamber
  useEffect(() => {
    if (!chamberIdParam && project?.data) {
      if (project.data.catCode) {
        setWaterDamageCategory(project.data.catCode);
      }
      if (project.data.waterClass) {
        setWaterClass(project.data.waterClass as WaterDamageClass);
      }
    }
  }, [project?.data, chamberIdParam]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Chamber",
      "Are you sure you want to delete this chamber? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteChamber,
        },
      ],
      { cancelable: true }
    );
  };

  const updateChamber = async () => {
    try {
      Keyboard.dismiss();
      if (chamberName.length < 3) {
        toast.error("Your chamber name must be at least 3 characters long.");
        return;
      }

      if (selectedRooms.length === 0) {
        toast.error("Please select at least one room for the chamber.");
        return;
      }

      setLoading(true);

      updateChamberMutation({
        id: chamberIdParam,
        data: {
          name: chamberName,
          rooms: selectedRooms,
          catCode: waterDamageCategory,
          waterClass: waterClass,
        },
      });

      router.dismiss();
    } catch (error: unknown) {
      console.log("🚀 ~ updateChamber ~ error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Could not update chamber.";
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  const deleteChamber = async () => {
    try {
      setLoading(true);

      deleteChamberMutation(chamberIdParam);

      router.dismiss();
    } catch {
      toast.error(
        "Could not delete chamber. If this error persists, please contact support@restoregeek.app"
      );
    }

    setLoading(false);
  };

  const createChamber = async () => {
    try {
      Keyboard.dismiss();
      if (chamberName.length < 3) {
        toast.error("Your chamber name must be at least 3 characters long.");
        return;
      }

      if (selectedRooms.length === 0) {
        toast.error("Please select at least one room for the chamber.");
        return;
      }

      setLoading(true);

      createChamberMutation({
        name: chamberName,
        projectId: projectId,
        rooms: selectedRooms,
        catCode: waterDamageCategory,
        waterClass: waterClass,
      });

      router.dismiss();
    } catch {
      toast.error(
        "Could not create chamber. If this error persists, please contact support@restoregeek.app"
      );
    }

    setLoading(false);
  };

  const selectedRoomsCount = selectedRooms.length;
  const totalRoomsCount = rooms?.length || 0;

  return (
    <View className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Header Section */}
          <View className="flex flex-row items-center w-full mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-3 rounded-full bg-white shadow-sm border border-gray-100"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <ChevronLeftIcon color="#374151" size={24} />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {chamberIdParam ? "Edit Chamber" : "Create Chamber"}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {chamberIdParam
                  ? "Update chamber details and room assignments"
                  : "Set up a new chamber for your project"}
              </Text>
            </View>
            {chamberIdParam && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={loading}
                className="p-3 rounded-full bg-red-50 border border-red-200"
                style={{
                  shadowColor: "#EF4444",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#EF4444" />
                ) : (
                  <Trash2Icon color="#EF4444" size={20} />
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={{ gap: 24 }}>
            {/* Chamber Name Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold text-sm">1</Text>
                </View>
                <Label
                  nativeID="Chamber Name"
                  className="text-lg font-semibold text-gray-900"
                >
                  Chamber Name
                </Label>
              </View>
              <Input
                placeholder="Enter a descriptive chamber name..."
                value={chamberName}
                onChangeText={(text) => setChamberName(text)}
                className="h-14 text-lg bg-gray-50 border-gray-200 rounded-xl px-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              />
              <Text className="text-xs text-gray-500 mt-2 ml-1">
                Minimum 3 characters required
              </Text>
            </View>

            {/* Room Selection Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">2</Text>
                  </View>
                  <Label className="text-lg font-semibold text-gray-900">
                    Select Rooms
                  </Label>
                </View>
                <View className="bg-blue-50 px-3 py-1 rounded-full">
                  <Text className="text-sm font-medium text-blue-700">
                    {selectedRoomsCount}/{totalRoomsCount} selected
                  </Text>
                </View>
              </View>

              <Text className="text-sm text-gray-600 mb-4">
                Choose which rooms belong to this chamber and mark their damage
                status
              </Text>

              {/* Add Room Button */}
              <View className="mb-4">
                <AddRoomButton
                  variant="outline"
                  size="default"
                  showText={true}
                  className="w-full"
                  onPress={() => {
                    router.push(
                      `../rooms/create?projectId=${projectId}&projectName=${projectName || ""}`
                    );
                  }}
                />
              </View>

              <View style={{ gap: 12 }}>
                {isLoadingRooms ? (
                  <View className="bg-gray-50 rounded-xl p-6 items-center">
                    <ActivityIndicator color="#3B82F6" size="large" />
                    <Text className="text-gray-500 text-center mt-2">
                      Loading rooms...
                    </Text>
                  </View>
                ) : (
                  rooms?.map((room) => {
                    const isSelected = selectedRooms.some(
                      (sr) => sr.roomId === room.id
                    );
                    const selectedRoom = selectedRooms.find(
                      (sr) => sr.roomId === room.id
                    );

                    const roomCardStyle = {
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      backgroundColor: isSelected ? "#EBF8FF" : "#F9FAFB",
                      borderColor: isSelected ? "#93C5FD" : "#E5E7EB",
                      shadowColor: isSelected ? "#3B82F6" : "#000",
                      shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                      shadowOpacity: isSelected ? 0.1 : 0,
                      shadowRadius: isSelected ? 4 : 0,
                      elevation: isSelected ? 3 : 0,
                    };

                    const checkboxStyle = {
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      alignItems: "center" as const,
                      justifyContent: "center" as const,
                      marginRight: 12,
                      backgroundColor: isSelected ? "#3B82F6" : "transparent",
                      borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                    };

                    const roomNameStyle = {
                      fontSize: 16,
                      fontWeight: "500" as const,
                      color: isSelected ? "#1E3A8A" : "#374151",
                    };

                    const statusButtonStyle = {
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      flexDirection: "row" as const,
                      alignItems: "center" as const,
                      backgroundColor: selectedRoom?.isEffected
                        ? "#FEE2E2"
                        : "#D1FAE5",
                      borderWidth: 1,
                      borderColor: selectedRoom?.isEffected
                        ? "#FCA5A5"
                        : "#A7F3D0",
                    };

                    const statusDotStyle = {
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      marginRight: 8,
                      backgroundColor: selectedRoom?.isEffected
                        ? "#EF4444"
                        : "#10B981",
                    };

                    const statusTextStyle = {
                      fontSize: 14,
                      fontWeight: "500" as const,
                      color: selectedRoom?.isEffected ? "#B91C1C" : "#047857",
                    };

                    return (
                      <TouchableOpacity
                        key={room.id}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedRooms((prev) =>
                              prev.filter((sr) => sr.roomId !== room.id)
                            );
                          } else {
                            setSelectedRooms((prev) => [
                              ...prev,
                              { roomId: room.id, isEffected: true },
                            ]);
                          }
                        }}
                        style={roomCardStyle}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <View style={checkboxStyle}>
                              {isSelected && (
                                <CheckIcon color="white" size={12} />
                              )}
                            </View>
                            <Text style={roomNameStyle}>{room.name}</Text>
                          </View>

                          {isSelected && (
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedRooms((prev) =>
                                  prev.map((sr) =>
                                    sr.roomId === room.id
                                      ? { ...sr, isEffected: !sr.isEffected }
                                      : sr
                                  )
                                );
                              }}
                              style={statusButtonStyle}
                            >
                              <View style={statusDotStyle} />
                              <Text style={statusTextStyle}>
                                {selectedRoom?.isEffected
                                  ? "Affected"
                                  : "Not Affected"}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {!isLoadingRooms && rooms?.length === 0 && (
                <View className="bg-gray-50 rounded-xl p-6 items-center">
                  <Text className="text-gray-500 text-center mb-4">
                    No rooms available for this project
                  </Text>
                  <Text className="text-sm text-gray-400 text-center">
                    Add your first room to get started
                  </Text>
                </View>
              )}
            </View>

            {/* Water Damage Category Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold text-sm">3</Text>
                </View>
                <Label className="text-lg font-semibold text-gray-900">
                  Water Damage Category
                </Label>
              </View>
              <Text className="text-sm text-gray-600 mb-4">
                Select the category of water damage for this chamber
              </Text>

              <View style={{ gap: 12 }}>
                {WATER_DAMAGE_CATEGORIES.map((category) => {
                  const isSelected = waterDamageCategory === category.value;

                  const categoryCardStyle = {
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    backgroundColor: isSelected ? "#EBF8FF" : "#F9FAFB",
                    borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
                    shadowColor: isSelected ? "#3B82F6" : "#000",
                    shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                    shadowOpacity: isSelected ? 0.1 : 0,
                    shadowRadius: isSelected ? 4 : 0,
                    elevation: isSelected ? 3 : 0,
                  };

                  const checkboxStyle = {
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    alignItems: "center" as const,
                    justifyContent: "center" as const,
                    marginRight: 12,
                    backgroundColor: isSelected ? "#3B82F6" : "transparent",
                    borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                  };

                  return (
                    <TouchableOpacity
                      key={category.value}
                      onPress={() => setWaterDamageCategory(category.value)}
                      style={categoryCardStyle}
                    >
                      <View className="flex-row items-start">
                        <View style={checkboxStyle}>
                          {isSelected && <CheckIcon color="white" size={12} />}
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <DropletsIcon
                              size={16}
                              color={isSelected ? "#3B82F6" : "#94A3B8"}
                            />
                            <Text className="ml-2 text-base font-semibold text-gray-900">
                              {category.label}
                            </Text>
                          </View>
                          <Text className="text-sm text-gray-600 leading-5">
                            {category.description}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Water Class Section */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-4">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold text-sm">4</Text>
                </View>
                <Label className="text-lg font-semibold text-gray-900">
                  Water Damage Class
                </Label>
              </View>
              <Text className="text-sm text-gray-600 mb-4">
                Select the class of water damage for this chamber
              </Text>

              <View style={{ gap: 12 }}>
                {WATER_DAMAGE_CLASSES.map((waterClassOption) => {
                  const isSelected = waterClass === waterClassOption.value;

                  const classCardStyle = {
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    backgroundColor: isSelected ? "#EBF8FF" : "#F9FAFB",
                    borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
                    shadowColor: isSelected ? "#3B82F6" : "#000",
                    shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                    shadowOpacity: isSelected ? 0.1 : 0,
                    shadowRadius: isSelected ? 4 : 0,
                    elevation: isSelected ? 3 : 0,
                  };

                  const checkboxStyle = {
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    alignItems: "center" as const,
                    justifyContent: "center" as const,
                    marginRight: 12,
                    backgroundColor: isSelected ? "#3B82F6" : "transparent",
                    borderColor: isSelected ? "#3B82F6" : "#D1D5DB",
                  };

                  return (
                    <TouchableOpacity
                      key={waterClassOption.value}
                      onPress={() => setWaterClass(waterClassOption.value)}
                      style={classCardStyle}
                    >
                      <View className="flex-row items-start">
                        <View style={checkboxStyle}>
                          {isSelected && <CheckIcon color="white" size={12} />}
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <DropletsIcon
                              size={16}
                              color={isSelected ? "#3B82F6" : "#94A3B8"}
                            />
                            <Text className="ml-2 text-base font-semibold text-gray-900">
                              {waterClassOption.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Button */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Button
                disabled={loading}
                onPress={chamberIdParam ? updateChamber : createChamber}
                className="h-14 rounded-xl"
                style={{
                  backgroundColor: loading ? "#9CA3AF" : "#3B82F6",
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: loading ? 0 : 0.2,
                  shadowRadius: 8,
                  elevation: loading ? 0 : 6,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center justify-center gap-3">
                    <SaveIcon color="white" size={20} />
                    <Text className="text-white font-semibold text-lg">
                      {chamberIdParam ? "Save Changes" : "Create Chamber"}
                    </Text>
                  </View>
                )}
              </Button>

              <Text className="text-xs text-gray-500 text-center mt-3">
                {chamberIdParam
                  ? "Your changes will be saved immediately"
                  : "This will create a new chamber for your project"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
