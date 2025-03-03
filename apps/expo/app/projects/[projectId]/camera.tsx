import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Image, View } from "react-native";
import { Camera, PhotoFile, useCameraDevice } from "react-native-vision-camera";
import { getConstants } from "@/utils/constants";
import RoomSelection from "@/components/RoomSelection";
import { createClient } from "@supabase/supabase-js";
import uuid from "react-native-uuid";
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams } from "expo-router";
import { roomsStore } from "@/lib/state/rooms";
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PinchGestureHandler } from "react-native-gesture-handler";
import { ActivityIndicator, Text, Pressable } from "react-native";
import { Minus, Plus } from "lucide-react-native";

export const supabaseServiceRole = createClient(
  getConstants().supabaseUrl,
  getConstants().serviceRoleJwt
);

const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

export default function CameraScreen() {
  const camera = useRef<Camera>(null);
  const [lastPhoto, setLastPhoto] = useState("");
  const device = useCameraDevice("back");
  const [disabled, setDisabled] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const rooms = roomsStore();
  const zoom = useSharedValue(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  const [selectedRoomId, setRoomId] = useState("");
  const onRoomSelect = (r: string) => {
    setRoomId(r);
  };

  const processImage = async (photo: PhotoFile) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Setting last photo", photo.path);
      setLastPhoto(photo.path);
      console.log("Uploading photo");
      const fileName = photo.path.substring(photo.path.lastIndexOf("/") + 1);
      const supabasePath = `${user!.id}/${uuid.v4()}_${fileName}`;

      let contentType = "image/jpeg";
      if (fileName.indexOf(".png") >= 0) {
        contentType = "image/png";
      }

      const p = {
        uri: photo.path,
        type: contentType,
        name: fileName,
      };
      const formData = new FormData();
      // @ts-expect-error maaaaan react-native sucks
      formData.append("file", p);

      const { data, error } = await supabaseServiceRole.storage
        .from("media")
        .upload(supabasePath, formData, {
          cacheControl: "3600",
          contentType,
          upsert: false,
        });

      console.log("Uploaded photo", data, error);
      if (data) {
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${supabaseSession?.access_token}`,
            },
            body: JSON.stringify({
              roomId: selectedRoomId,
              imageId: data.path,
            }),
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const SCALE_FULL_ZOOM = 3;
  const MAX_ZOOM_FACTOR = 10;
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const onPinchGesture = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    { startZoom?: number }
  >({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP
      );
      zoom.value = interpolate(
        scale,
        [-1, 0, 1],
        [minZoom, startZoom, maxZoom],
        Extrapolate.CLAMP
      );
    },
    onEnd: () => {
      runOnJS(setZoomLevel)(zoom.value);
    },
  });

  useEffect(() => {
    const neutralZoom = device?.neutralZoom ?? 1;
    zoom.value = withTiming(neutralZoom, { duration: 200 });
    setZoomLevel(neutralZoom);

    return () => {
      zoom.value = neutralZoom;
    };
  }, [device]);

  const animatedProps = useAnimatedProps(() => ({
    zoom: zoom.value,
  }));

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.5, maxZoom);
    console.log("🚀 ~ handleZoomIn ~ newZoom:", newZoom);
    zoom.value = withTiming(newZoom, { duration: 200 });
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.5, minZoom);
    console.log("🚀 ~ handleZoomOut ~ newZoom:", newZoom);
    zoom.value = withTiming(newZoom, { duration: 200 });
    setZoomLevel(newZoom);
  };

  const takePhoto = async () => {
    if (!camera || !camera.current) return;
    setDisabled(true);
    try {
      console.log("TAKING PICTURE");
      const photo = await camera.current.takePhoto({
        flash: "auto",
        enableShutterSound: false,
      });
      processImage(photo);
    } catch (error) {
      console.error("Caught error");
      console.error(error);
    }
    setDisabled(false);
  };

  if (!device) {
    return (
      <View className="flex justify-center items-center h-full w-full">
        <ActivityIndicator />
        <Text>Opening Camera</Text>
      </View>
    );
  }

  return (
    <View className="relative h-full w-full flex">
      <View className="w-full h-full justify-between">
        <View className="py-2 bg-black">
          <RoomSelection
            rooms={rooms.rooms}
            selectedRoom={selectedRoomId}
            onChange={onRoomSelect}
          />
        </View>
        <PinchGestureHandler onGestureEvent={onPinchGesture}>
          <View className="flex-1">
            <AnimatedCamera
              style={{
                flex: 1,
                height: "100%",
              }}
              device={device}
              isActive={true}
              photo={true}
              ref={camera}
              animatedProps={animatedProps}
            />
            <View className="absolute right-4 top-1/2 -mt-20 bg-black/40 rounded-full">
              <Pressable onPress={handleZoomIn} className="p-2">
                <Plus size={24} color="white" />
              </Pressable>
              <View className="py-2 px-3 bg-black/60">
                <Text className="text-white font-medium text-center">
                  {zoomLevel.toFixed(1)}x
                </Text>
              </View>
              <Pressable onPress={handleZoomOut} className="p-2">
                <Minus size={24} color="white" />
              </Pressable>
            </View>
          </View>
        </PinchGestureHandler>
        <View className="flex flex-row justify-between items-center content-center bg-black px-4 py-2 w-full">
          {lastPhoto ? (
            <Image
              className="size-16 border-white border-2 rounded-md"
              source={{
                uri: lastPhoto,
              }}
              alt="Last Photo Taken"
            />
          ) : (
            <View className="size-16 border-white border-2 rounded-md" />
          )}
          <Button
            className="size-20 rounded-full border-2 border-primary-500 bg-white shadow-8"
            onPress={() => takePhoto()}
            disabled={disabled}
          />
          <View className="size-16" />
        </View>
      </View>
    </View>
  );
}
