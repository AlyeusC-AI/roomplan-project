import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Label } from "@/components/ui/label";
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Trash2, Save } from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const ChevronLeftIcon = ChevronLeft as any;
const Trash2Icon = Trash2 as any;
const SaveIcon = Save as any;
import {
  useCreateChamber,
  useUpdateChamber,
  useDeleteChamber,
  useGetRooms,
  useGetChamber,
} from "@service-geek/api-client";

export default function ChamberCreationScreen() {
  const [chamberName, setChamberName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<
    { roomId: string; isEffected: boolean }[]
  >([]);
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

  const { data: rooms } = useGetRooms(projectId || "");
  const { data: existingChamber } = useGetChamber(chamberIdParam || "");

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
    }
  }, [existingChamber]);

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
      });

      router.dismiss();
    } catch {
      toast.error(
        "Could not create chamber. If this error persists, please contact support@restoregeek.app"
      );
    }

    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="flex flex-row items-center w-full mb-8">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-gray-100"
          >
            <ChevronLeftIcon color="black" size={24} />
          </TouchableOpacity>
          <Text className="text-2xl ml-4 font-bold flex-1">
            {chamberIdParam ? "Edit Chamber" : "Create Chamber"}
          </Text>
          {chamberIdParam && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={loading}
              className="p-2 rounded-full bg-red-50"
            >
              {loading ? (
                <ActivityIndicator color="red" />
              ) : (
                <Trash2Icon color="red" size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Label nativeID="Chamber Name" className="text-lg font-medium mb-2">
              Chamber Name
            </Label>
            <Input
              placeholder="Enter chamber name"
              value={chamberName}
              onChangeText={(text) => setChamberName(text)}
              className="h-12 text-lg "
            />
          </View>

          <View>
            <Label className="text-lg font-medium mb-2">Select Rooms</Label>
            <View style={{ gap: 8 }}>
              {rooms?.map((room) => {
                const isSelected = selectedRooms.some(
                  (sr) => sr.roomId === room.id
                );
                const selectedRoom = selectedRooms.find(
                  (sr) => sr.roomId === room.id
                );

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
                          { roomId: room.id, isEffected: false },
                        ]);
                      }
                    }}
                    className={`p-3 rounded-lg border ${
                      isSelected
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-medium">{room.name}</Text>
                      <View className="flex-row items-center gap-2">
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
                            className={`px-3 py-1 rounded-full ${
                              selectedRoom?.isEffected
                                ? "bg-red-100 border border-red-300"
                                : "bg-green-100 border border-green-300"
                            }`}
                          >
                            <Text
                              className={`text-sm font-medium ${
                                selectedRoom?.isEffected
                                  ? "text-red-700"
                                  : "text-green-700"
                              }`}
                            >
                              {selectedRoom?.isEffected
                                ? "Affected"
                                : "Not Affected"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Button
            disabled={loading}
            onPress={chamberIdParam ? updateChamber : createChamber}
            className="h-12"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center gap-2">
                <SaveIcon color="white" size={20} />
                <Text className="text-white font-medium">
                  {chamberIdParam ? "Save Changes" : "Create Chamber"}
                </Text>
              </View>
            )}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
