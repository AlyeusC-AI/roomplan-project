import { useState, useEffect } from "react";
import { userStore } from "@/lib/state/user";
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
import { roomsStore } from "@/lib/state/rooms";
import { roomInferenceStore } from "@/lib/state/readings-image";
import { api } from "@/lib/api";
import { notesStore } from "@/lib/state/notes";

export default function RoomCreationScreen() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { session: supabaseSession } = userStore((state) => state);

  const { projectId, projectName, roomName: roomNameParam, roomId: roomIdParam } = useLocalSearchParams<{
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

      const res = await api.patch(`/api/v1/projects/${projectId}/room`, { 
        name: roomName,
        roomId: roomIdParam,
      });

      const json = res.data;
      console.log("🚀 ~ updateRoom ~ json:", json);

      roomsStore.getState().updateRoom({  name: roomName, publicId: roomIdParam });
      roomInferenceStore.getState().setRooms([{   name: roomName }]);
      notesStore.getState().setNotes(notesStore.getState().notes.map(note => note.publicId === roomIdParam ? { ...note, name: roomName } : note));

      router.dismiss();
    } catch (error: unknown) {
      console.log("🚀 ~ updateRoom ~ error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not update room.";
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  const deleteRoom = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room/${roomIdParam}`,
        {
          method: "DELETE",
          headers: {
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );

      if (res.ok) {
        roomsStore.getState().setRooms(roomsStore.getState().rooms.filter(r => r.publicId !== roomIdParam));
        roomInferenceStore.getState().setRooms(roomInferenceStore.getState().rooms.filter(r => r.publicId !== roomIdParam));
        router.dismiss();
      } else {
        throw new Error("Failed to delete room");
      }
    } catch {
      toast.error(
        "Could not delete room. If this error persists, please contact support@servicegeek.com"
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

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            name: roomName,
          }),
        }
      );

      const json = await res.json();

      roomsStore.getState().addRoom({ ...json.room, RoomReading: [] });
      roomInferenceStore.getState().addRoom({ ...json.room, Inference: [] });

      router.dismiss();
    } catch {
      toast.error(
        "Could not create room. If this error persists, please contact support@servicegeek.com"
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
