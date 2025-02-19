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
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PinchGestureHandler } from "react-native-gesture-handler";
import { ActivityIndicator, Text } from "react-native";

export const supabaseServiceRole = createClient(
  getConstants().supabaseUrl,
  getConstants().serviceRoleJwt
);

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
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
      // we're trying to map the scale gesture to a linear zoom here
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
      console.log("ZOOMING");
    },
  });

  useEffect(() => {
    // Reset zoom to it's default everytime the `device` changes.
    zoom.value = device?.neutralZoom ?? 1;
  }, [zoom, device]);

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

  if (device === null)
    return (
      <View className="flex justify-center items-center h-full w-full">
        <ActivityIndicator />
        <Text>Opening Camera</Text>
      </View>
    );
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
          <ReanimatedCamera
            style={{
              flex: 1,
              height: "100%",
            }}
            device={device}
            isActive={true}
            photo={true}
            ref={camera}
            zoom={zoom}
          />
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
          <View className="size-20 " />
        </View>
      </View>
    </View>
  );
}
