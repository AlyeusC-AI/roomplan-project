import { useState } from "react";
import { userStore } from "@/lib/state/user";
import { useLocalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Label } from "@/components/ui/label";
import {
  ActivityIndicator,
  Keyboard,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react-native";
import { roomsStore } from "@/lib/state/rooms";
import { roomInferenceStore } from "@/lib/state/readings-image";

export default function RoomCreationScreen() {
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();

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
        "Could not create room. If this error persits, please contact support@servicegeek.com"
      );
    }

    setLoading(false);
  };

  return (
    <View className="p-4 flex items-center">
      <View className="flex flex-row items-center w-full">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="black" />
        </TouchableOpacity>
        <Text className="text-2xl ml-28 font-bold">Create Room</Text>
      </View>
      <View className="w-full mt-8">
        <Label nativeID="Room Name">Room Name</Label>
        <Input
          placeholder="Room Name"
          value={roomName}
          onChangeText={(text) => setRoomName(text)}
        />
        <Button
          disabled={loading}
          onPress={() => createRoom()}
          className="mt-4"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text>Create Room</Text>
          )}
        </Button>
      </View>
    </View>
  );
}
