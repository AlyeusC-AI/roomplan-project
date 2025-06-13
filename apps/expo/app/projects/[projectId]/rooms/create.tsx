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
import {
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from "@service-geek/api-client";

export default function RoomCreationScreen() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutate: createRoomMutation } = useCreateRoom();
  const { mutate: updateRoomMutation } = useUpdateRoom();
  const { mutate: deleteRoomMutation } = useDeleteRoom();

  const {
    projectId,
    projectName,
    roomName: roomNameParam,
    roomId: roomIdParam,
  } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
    roomName: string;
    roomId: string;
  }>();

  useEffect(() => {
    if (roomNameParam) {
      setRoomName(roomNameParam);
    }
  }, [roomNameParam]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Room",
      "Are you sure you want to delete this room? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteRoom,
        },
      ],
      { cancelable: true }
    );
  };

  const updateRoom = async () => {
    try {
      Keyboard.dismiss();
      if (roomName.length < 3) {
        toast.error("Your room name must be at least 3 characters long.");
        return;
      }

      setLoading(true);

      updateRoomMutation({ id: roomIdParam, data: { name: roomName } });

      router.dismiss();
    } catch (error: unknown) {
      console.log("🚀 ~ updateRoom ~ error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Could not update room.";
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  const deleteRoom = async () => {
    try {
      setLoading(true);

      deleteRoomMutation(roomIdParam);

      router.dismiss();
    } catch {
      toast.error(
        "Could not delete room. If this error persists, please contact support@restoregeek.app"
      );
    }

    setLoading(false);
  };

  const createRoom = async () => {
    try {
      Keyboard.dismiss();
      if (roomName.length < 3) {
        toast.error("Your room name must be at least 3 characters long.");
        return;
      }

      setLoading(true);

      createRoomMutation({ name: roomName, projectId: projectId });

      router.dismiss();
    } catch {
      toast.error(
        "Could not create room. If this error persists, please contact support@restoregeek.app"
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
            <ChevronLeft color="black" size={24} />
          </TouchableOpacity>
          <Text className="text-2xl ml-4 font-bold flex-1">
            {roomIdParam ? "Edit Room" : "Create Room"}
          </Text>
          {roomIdParam && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={loading}
              className="p-2 rounded-full bg-red-50"
            >
              {loading ? (
                <ActivityIndicator color="red" />
              ) : (
                <Trash2 color="red" size={20} />
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Label nativeID="Room Name" className="text-lg font-medium mb-2">
              Room Name
            </Label>
            <Input
              placeholder="Enter room name"
              value={roomName}
              onChangeText={(text) => setRoomName(text)}
              className="h-12 text-lg "
            />
          </View>

          <Button
            disabled={loading}
            onPress={roomIdParam ? updateRoom : createRoom}
            className="h-12"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center gap-2">
                <Save color="white" size={20} />
                <Text className="text-white font-medium">
                  {roomIdParam ? "Save Changes" : "Create Room"}
                </Text>
              </View>
            )}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
