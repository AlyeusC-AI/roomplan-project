import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Image, View, StatusBar, Dimensions } from "react-native";
import { Camera, PhotoFile, useCameraDevice } from "react-native-vision-camera";
import { getConstants } from "@/utils/constants";
import RoomSelection from "@/components/RoomSelection";
import { createClient } from "@supabase/supabase-js";
import uuid from "react-native-uuid";
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
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
import {
  PinchGestureHandler,
  PanGestureHandler,
} from "react-native-gesture-handler";
import { ActivityIndicator, Text, Pressable } from "react-native";
import {
  ArrowLeft,
  Camera as CameraIcon,
  Zap,
  ZapOff,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImageManipulator from "expo-image-manipulator";

export const supabaseServiceRole = createClient(
  getConstants().supabaseUrl,
  getConstants().serviceRoleJwt
);

const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const camera = useRef<Camera>(null);
  const [lastPhoto, setLastPhoto] = useState("");
  const device = useCameraDevice("back");
  const [disabled, setDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const rooms = roomsStore();
  const zoom = useSharedValue(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("auto");
  const [showZoomSlider, setShowZoomSlider] = useState(false);

  const [selectedRoomId, setRoomId] = useState("");
  const [uploadQueue, setUploadQueue] = useState<PhotoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const onRoomSelect = (r: string) => {
    setRoomId(r);
  };

  // Process image uploads in the background
  const processImageUpload = async (photo: PhotoFile) => {
    try {
      setIsUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Uploading photo");
      const fileName = photo.path.substring(photo.path.lastIndexOf("/") + 1);
      const supabasePath = `${user!.id}/${uuid.v4()}_${fileName}`;

      let contentType = "image/jpeg";
      if (fileName.indexOf(".png") >= 0) {
        contentType = "image/png";
      }

      // Resize the image to reduce file size
      try {
        // Resize and compress the image
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.path,
          [{ resize: { width: 1200 } }], // Resize to max width of 1200px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality JPEG
        );

        // Use the resized image for upload
        const p = {
          uri: manipResult.uri,
          type: "image/jpeg",
          name: fileName,
        };

        const formData = new FormData();
        // @ts-expect-error maaaaan react-native sucks
        formData.append("file", p);

        const { data, error } = await supabaseServiceRole.storage
          .from("media")
          .upload(supabasePath, formData, {
            cacheControl: "3600",
            contentType: "image/jpeg",
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
      } catch (resizeError) {
        console.error("Error resizing image:", resizeError);

        // Fallback to original image if resize fails
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

        console.log("Uploaded original photo", data, error);
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
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Process next photo in queue if any
      setUploadQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        newQueue.shift(); // Remove the processed photo
        return newQueue;
      });
    }
  };

  // Handle the upload queue
  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      processImageUpload(uploadQueue[0]);
    }
  }, [uploadQueue, isUploading]);

  // Simplified function to just capture the photo and update UI immediately
  const processImage = (photo: PhotoFile) => {
    console.log("Setting last photo", photo.path);
    setLastPhoto(photo.path);

    // Add to upload queue to process in background
    setUploadQueue((prevQueue) => [...prevQueue, photo]);
  };

  const SCALE_FULL_ZOOM = 3;
  const MAX_ZOOM_FACTOR = 10;
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const zoomSliderPosition = useSharedValue(0);
  const zoomSliderWidth = SCREEN_WIDTH * 0.7;

  const zoomSliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: zoomSliderPosition.value }],
    };
  });

  const zoomFillStyle = useAnimatedStyle(() => {
    const fillWidth = interpolate(
      zoom.value,
      [minZoom, maxZoom],
      [0, zoomSliderWidth],
      Extrapolate.CLAMP
    );
    return {
      width: fillWidth,
    };
  });

  const onZoomSliderGesture = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      const newZoom = interpolate(
        event.translationX,
        [0, zoomSliderWidth],
        [context.startZoom, maxZoom],
        Extrapolate.CLAMP
      );
      zoom.value = Math.max(minZoom, Math.min(maxZoom, newZoom));
      runOnJS(setZoomLevel)(zoom.value);
    },
  });

  const hideZoomSlider = () => {
    setTimeout(() => {
      setShowZoomSlider(false);
    }, 2000);
  };

  const onPinchGesture = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    { startZoom?: number }
  >({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
      runOnJS(setShowZoomSlider)(true);
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
      // Hide zoom slider after a delay using the separate function
      runOnJS(hideZoomSlider)();
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
    if (disabled) return; // Remove isProcessing check to allow taking photos while uploading
    setDisabled(true);
    setIsProcessing(true); // Show processing indicator briefly
    try {
      console.log("TAKING PICTURE");
      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: false,
      });
      processImage(photo);
    } catch (error) {
      console.error("Caught error");
      console.error(error);
    }
    setIsProcessing(false); // Hide processing indicator immediately after capture
    setDisabled(false);
  };

  const toggleFlash = () => {
    if (flash === "off") setFlash("on");
    else if (flash === "on") setFlash("auto");
    else setFlash("off");
  };

  if (!device) {
    return (
      <SafeAreaView className="flex justify-center items-center h-full w-full bg-black">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4 text-lg">Opening Camera...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="relative h-full w-full flex bg-black">
      <StatusBar barStyle="light-content" />
      <View
        className="w-full h-full justify-between"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Reverted header */}
        <View className="py-2 bg-black px-4 flex-row justify-between items-center">
          <Pressable
            onPress={() => router.back()}
            className="p-2 bg-black/50 rounded-full"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-2">
            <RoomSelection
              rooms={rooms.rooms}
              selectedRoom={selectedRoomId}
              onChange={onRoomSelect}
            />
          </View>
          <Pressable
            onPress={toggleFlash}
            className="p-2 bg-black/50 rounded-full"
          >
            {flash === "off" ? (
              <ZapOff size={24} color="white" />
            ) : (
              <Zap size={24} color={flash === "on" ? "#FFD700" : "white"} />
            )}
          </Pressable>
        </View>

        <PinchGestureHandler onGestureEvent={onPinchGesture}>
          <Reanimated.View className="flex-1">
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

            {/* iOS-style zoom indicator */}
            {showZoomSlider && (
              <View className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center">
                <Text className="text-white font-bold text-lg mb-2">
                  {zoomLevel.toFixed(1)}x
                </Text>
                <View
                  className="h-1.5 rounded-full bg-white/30 overflow-hidden"
                  style={{ width: zoomSliderWidth }}
                >
                  <Reanimated.View
                    className="h-full bg-white rounded-full"
                    style={zoomFillStyle}
                  />
                </View>
              </View>
            )}
          </Reanimated.View>
        </PinchGestureHandler>

        <View className="flex flex-col bg-black w-full pb-6">
          {/* iOS-style zoom options directly above the button */}
          <View className="flex-row justify-center items-center py-2 mb-4 space-x-10">
            <Pressable
              onPress={() => {
                zoom.value = withTiming(0.5, { duration: 200 });
                setZoomLevel(0.5);
              }}
              className={`px-2 py-1 ${
                Math.abs(zoomLevel - 0.5) < 0.1 ? "border-b-2 border-white" : ""
              }`}
            >
              <Text className={`font-medium text-xs text-white`}>0.5</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                zoom.value = withTiming(1, { duration: 200 });
                setZoomLevel(1);
              }}
              className={`px-2 py-1 ${
                Math.abs(zoomLevel - 1) < 0.1 ? "border-b-2 border-white" : ""
              }`}
            >
              <Text className={`font-medium text-xs text-white`}>1x</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                zoom.value = withTiming(2, { duration: 200 });
                setZoomLevel(2);
              }}
              className={`px-2 py-1 ${
                Math.abs(zoomLevel - 2) < 0.1 ? "border-b-2 border-white" : ""
              }`}
            >
              <Text className={`font-medium text-xs text-white`}>2</Text>
            </Pressable>
          </View>

          {/* Camera controls row */}
          <View className="flex flex-row justify-between items-center px-6">
            {lastPhoto ? (
              <Pressable
                onPress={() => {}}
                className="size-16 rounded-md overflow-hidden"
              >
                <Image
                  className="size-16"
                  source={{
                    uri: lastPhoto,
                  }}
                  alt="Last Photo Taken"
                />
              </Pressable>
            ) : (
              <View className="size-16 rounded-md bg-black/30 flex items-center justify-center">
                <CameraIcon size={24} color="rgba(255,255,255,0.5)" />
              </View>
            )}

            {/* Enhanced iOS-style shutter button */}
            <Pressable
              onPress={() => takePhoto()}
              disabled={disabled}
              className={`w-[80px] h-[80px] rounded-full items-center justify-center ${
                disabled ? "opacity-50" : ""
              }`}
            >
              <View className="w-[76px] h-[76px] rounded-full border-[3px] border-white bg-transparent flex items-center justify-center">
                {isProcessing ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <View className="w-[66px] h-[66px] rounded-full bg-white" />
                )}
              </View>
            </Pressable>

            <View className="size-16" />
          </View>
        </View>
      </View>
    </View>
  );
}
