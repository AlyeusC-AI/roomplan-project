import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Image,
  View,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Camera, PhotoFile, useCameraDevice } from "react-native-vision-camera";
import { getConstants } from "@/utils/constants";
import RoomSelection from "@/components/RoomSelection";
import { createClient } from "@supabase/supabase-js";
import uuid from "react-native-uuid";
import { userStore } from "@/lib/state/user";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";
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
  Upload,
  CheckCircle2,
  XCircle,
  Check,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { uploadImage } from "@/lib/imagekit";
import { useCameraStore } from "@/lib/state/camera";

export const supabaseServiceRole = createClient(
  getConstants().supabaseUrl,
  getConstants().serviceRoleJwt
);

const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UploadItem {
  id: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  message: string;
  photo: PhotoFile;
}

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const camera = useRef<Camera>(null);
  const [lastPhoto, setLastPhoto] = useState("");
  const device = useCameraDevice("back", {
    physicalDevices: ["wide-angle-camera"],
  });
  const [disabled, setDisabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);

  const { projectId, formId, fieldId, mode } = useGlobalSearchParams<{
    projectId: string;
    formId?: string;
    fieldId?: string;
    mode?: string;
  }>();
  const rooms = roomsStore();
  const isFormMode = mode === "form";
  const {
    addImage,
    images,
    fieldId: cameraFieldId,
    setFieldId,
    clearImages,
  } = useCameraStore();

  useFocusEffect(
    useCallback(() => {
      console.log("Screen is focused sssss");

      return () => {
        console.log("Screen lost focussssss");
        setTimeout(() => {
          setFieldId(null);
          clearImages();
        }, 10000);
      };
    }, [])
  );

  const zoom = useSharedValue(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("auto");
  const [showZoomSlider, setShowZoomSlider] = useState(false);

  const [selectedRoomId, setRoomId] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const refetchRooms = async () => {
    const roomsRes = await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": supabaseSession?.access_token || "",
        },
      }
    );

    const roomsData = await roomsRes.json();
    rooms.setRooms(roomsData.rooms);
  };
  useEffect(() => {
    console.log(
      "🚀 ~ CameraScreen ~ rooms:",
      JSON.stringify(rooms.rooms, null, 2)
    );
    refetchRooms();
  }, []);

  const onRoomSelect = (r: string) => {
    setRoomId(r);
  };

  // Process image uploads in the background
  const processImageUpload = async (uploadItem: UploadItem) => {
    console.log("🚀 ~ processImageUpload ~ uploadItem:", uploadItem);
    try {
      setIsUploading(true);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? {
                ...item,
                status: "uploading",
                progress: 0,
                message: "Preparing image...",
              }
            : item
        )
      );

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, progress: 0.2, message: "Optimizing image..." }
            : item
        )
      );

      // Convert PhotoFile to Blob for ImageKit upload
      const response = await fetch(uploadItem.photo.path);
      const blob = await response.blob();

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, progress: 0.4, message: "Uploading..." }
            : item
        )
      );

      // Upload to ImageKit
      const uploadResult = await uploadImage(
        {
          uri: uploadItem.photo.path,
          type: "image/jpeg",
          name: "photo.jpg",
        },
        {
          folder: isFormMode
            ? `forms/${formId}/fields/${fieldId}`
            : `projects/${projectId}/rooms/${selectedRoomId}`,
          useUniqueFileName: true,
          tags: isFormMode
            ? [`form-${formId}`, `field-${fieldId}`]
            : [`project-${projectId}`, `room-${selectedRoomId}`],
        }
      );

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, progress: 0.8, message: "Finalizing..." }
            : item
        )
      );

      if (!isFormMode && !cameraFieldId) {
        // Save image reference to your backend for room photos
        const saveImageRes = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${supabaseSession?.access_token}`,
            },
            body: JSON.stringify({
              roomId: selectedRoomId,
              imageId: uploadResult.url,
            }),
          }
        );
      }

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? {
                ...item,
                status: "success",
                progress: 1,
                message: "Upload complete!",
              }
            : item
        )
      );
      console.log("🚀 ~ processImageUpload ~ isFormMode:", isFormMode);

      // If in form mode, go back to form with the image data
      if (isFormMode || cameraFieldId) {
        // router.back();

        addImage({
          fieldId: fieldId as string,
          url: uploadResult.url,
          name: "photo.jpg",
          type: "image/jpeg",
          size: uploadResult.size,
          fileId: uploadResult.fileId,
          filePath: uploadResult.filePath,
          // fileId: uploadResult.fileId,
          // filePath: uploadResult.filePath,
        });
      }

      // Set the result in Zustand store
    } catch (error) {
      console.error("Upload error:", error);
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.id === uploadItem.id
            ? { ...item, status: "error", message: "Upload failed" }
            : item
        )
      );
    } finally {
      // Remove the completed upload after a delay
      setTimeout(() => {
        setUploadQueue((prev) =>
          prev.filter((item) => item.id !== uploadItem.id)
        );
        if (uploadQueue.length === 1) {
          setIsUploading(false);
        }
      }, 2000);
    }
  };

  // Handle the upload queue
  useEffect(() => {
    if (uploadQueue.length > 0) {
      const pendingUploads = uploadQueue.filter(
        (item) => item.status === "idle"
      );
      pendingUploads.forEach((uploadItem) => {
        processImageUpload(uploadItem);
      });
    }
  }, [uploadQueue]);

  // Simplified function to just capture the photo and update UI immediately
  const processImage = (photo: PhotoFile) => {
    console.log("Setting last photo", photo.path);
    setLastPhoto(photo.path);

    // Add to upload queue to process in background
    setUploadQueue((prev) => [
      ...prev,
      {
        id: uuid.v4(),
        progress: 0,
        status: "idle",
        message: "Queued",
        photo,
      },
    ]);
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

  const handleComplete = () => {
    router.back();
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
        {/* Header */}
        <View className="py-2 bg-black px-4 flex-row justify-between items-center">
          <Pressable
            onPress={() => router.back()}
            className="p-2 bg-black/50 rounded-full"
          >
            <ArrowLeft size={24} color="white" />
          </Pressable>
          {!isFormMode && !cameraFieldId && (
            <View className="flex-1 mx-2">
              <RoomSelection
                rooms={rooms.rooms}
                selectedRoom={selectedRoomId}
                onChange={onRoomSelect}
              />
            </View>
          )}
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

            {/* Upload Queue Overlay */}
            {/* {uploadQueue.length > 0 && (
              <View className="absolute top-4 right-4 space-y-2">
                {uploadQueue.map((item) => (
                  <View
                    key={item.id}
                    className="bg-black/80 rounded-lg p-4 w-64"
                  >
                    <View className="flex-row items-center space-x-2 mb-2">
                      {item.status === "success" ? (
                        <CheckCircle2 size={20} color="#4CAF50" />
                      ) : item.status === "error" ? (
                        <XCircle size={20} color="#F44336" />
                      ) : (
                        <Upload size={20} color="white" />
                      )}
                      <Text className="text-white font-medium flex-1">
                        {item.message}
                      </Text>
                      {item.status === "uploading" && (
                        <Text className="text-white/70 text-xs">
                          {Math.round(item.progress * 100)}%
                        </Text>
                      )}
                    </View>
                    {item.status === "uploading" && (
                      <View className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-white rounded-full"
                          style={{ width: `${item.progress * 100}%` }}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )} */}

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

            {/* Confirm button */}
            <TouchableOpacity
              onPress={handleComplete}
              className="size-16 rounded-full bg-black/50 flex items-center justify-center"
              // disabled={isProcessing || isUploading}
            >
              <Check size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
