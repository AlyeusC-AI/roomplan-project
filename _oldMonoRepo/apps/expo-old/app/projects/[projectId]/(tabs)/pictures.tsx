import React, { useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { Camera as CameraIcon } from "lucide-react-native";
import RoomImages from "@/components/project/room-images";

import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { urlMapStore } from "@/lib/state/url-map";
import { roomInferenceStore } from "@/lib/state/readings-image";
import { Button } from "@/components/ui/button";

export default function ProjectPhotos() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const { session: supabaseSession } = userStore((state) => state);
  const [loading, setLoading] = React.useState(true);
  const rooms = roomInferenceStore();
  const urlMap = urlMapStore();

  useEffect(() => {
    setUrlMap();
  }, []);

  function setUrlMap() {
    setLoading(true);
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/image`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": supabaseSession?.access_token || "",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        console.log(data);
        rooms.setRooms(data.rooms);
        urlMap.setUrlMap(data.urlMap);
      });
  }

  const router = useRouter();

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  const onPress = async () => {
    try {
      await Camera.requestCameraPermission();
      router.navigate({
        pathname: "../camera",
      });
    } catch (error) {
      console.error("Cannot open camera", error);
      toast.error(
        "Could not open the camera. It's possible camera access was denied for this application. If the issue persists, please contact support@servicegeek.com"
      );
    }
  };

  if (!loading && rooms.rooms.length === 0) {
    return (
      <Empty
        title="No Images"
        description="Upload images to associate with this project. Images of rooms can
              be automatically assigned a room"
        buttonText="Start Taking Pictures"
        icon={<CameraIcon height={50} width={50} />}
        secondaryIcon={
          <CameraIcon height={20} width={20} color="#fff" className="ml-4" />
        }
        onPress={onPress}
      />
    );
  }

  return (
    <View className="w-full h-full px-3 mt-4">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={setUrlMap} />
        }
      >
        <View className="flex-row justify-end">
          <Button
            className="w-32"
            onPress={() => router.push("../rooms/create")}
          >
            <Text>Add Room</Text>
          </Button>
        </View>
        <Accordion
          type="single"
          collapsible
          className="w-full max-w-sm native:max-w-md"
        >
          {rooms.rooms.filter(e => !e.isDeleted).map((room) => (
            <AccordionItem key={room.name} value={room.name}>
              <AccordionTrigger>
                <Text className="font-bold text-2xl my-3">{room.name}</Text>
              </AccordionTrigger>
              <AccordionContent>
                <RoomImages
                  key={room.name}
                  inferences={room.Inference}
                  urlMap={urlMap.urlMap}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollView>

      {rooms.rooms.length > 0 && (
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={() => router.push("../camera")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              position: "absolute",
              bottom: 20,
              right: 15,
              height: 60,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 1,
              backgroundColor: "#1e40af",
              borderRadius: 100,
            }}
          >
            <CameraIcon size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
