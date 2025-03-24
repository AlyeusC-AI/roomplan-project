import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, TouchableOpacity, NativeModules,
  requireNativeComponent, UIManager, Text, TextInput, Dimensions,
  SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { makeSVG } from '@/lib/utils/generate2DPlan';
import { userStore } from '@/lib/state/user';
import { useLocalSearchParams } from 'expo-router';
import { roomsStore } from '@/lib/state/rooms';
import { roomInferenceStore } from '@/lib/state/readings-image';
import { supabaseServiceRole } from '@/app/projects/[projectId]/camera';

const { RoomScanModule } = NativeModules;

// Check if device has LiDAR sensor (iOS only)
const hasLidarSensor = async (): Promise<boolean> => {
  return await RoomScanModule && RoomScanModule.isAvailable();
};

type RoomScanViewProps = {
  onCaptureCompleted: (ev: any) => void;
  onCaptureError: (ev: any) => void;
}

// Check if the RoomPlan component is available
const isRoomPlanAvailable = () => {
  if (Platform.OS !== 'ios') return false;
  
  // Check if the native module exists
  return UIManager.getViewManagerConfig('CubiCasaScanView') != null;
};

// Create a native component wrapper if available
const RoomScanView = isRoomPlanAvailable()
  ? requireNativeComponent<RoomScanViewProps>('CubiCasaScanView')
  : null;

interface LidarScanProps {
  onScanComplete?: (roomId?: number) => void;
  onClose?: () => void;
  roomId?: number;
  roomPlanSVG?: string;
}

const LidarScan = ({ onScanComplete, onClose, roomId, roomPlanSVG }: LidarScanProps) => {
  const [finish, setFinish] = useState(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useLocalSearchParams<{
    projectId: string;
  }>();
  const deviceWidth = Dimensions.get('window').width;
  const svgSize = deviceWidth * 0.8;
  const processedRoomId = useRef<number | undefined>(roomId);
  const processedRoomPlanSVG = useRef<string | undefined>(roomPlanSVG);

  useEffect(() => {
    const checkSupport = async () => {
      const hasLidar = await hasLidarSensor();
      setIsSupported(hasLidar);
    };

    checkSupport();
  }, []);

  const handleStartScan = async () => {
    if (!processedRoomId.current) {
      console.log("new room creation - projectId", projectId)
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            name: newRoomName,
          }),
        }
      );

      const json = await res.json();

      console.log("json", json);

      if (json.status === "failed") {
        const errorMessage = json.reason === "existing-room" ? "Room already exists" : "Failed to create room";
        Alert.alert(
          'Error',
          errorMessage,
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      processedRoomId.current = json.room.id;
      console.log("json.room.id", json.room.id);

      roomsStore.getState().addRoom({ ...json.room, RoomReading: [] });
      roomInferenceStore.getState().addRoom({ ...json.room, Inference: [] });
    }
    setShowScanner(true);
  };

  const handleCancel = () => {
    // Show confirmation alert before canceling scan
    Alert.alert(
      'Cancel Scan?',
      'Are you sure you want to cancel the current scan? Any progress will be lost.',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        { 
          text: 'Cancel Scan', 
          style: 'destructive',
          onPress: () => setShowScanner(false)
        },
      ]
    );
  };

  const handleScanComplete = (ev: { nativeEvent: { url: string }}) => {
    console.log("Complete -> handleScanComplete", ev.nativeEvent)
    const url = ev.nativeEvent.url;
    if (!url) {
      Alert.alert('Error', 'No data received. Please scan again.');
      setShowScanner(false);
      return
    }

    const process = async () => {
      setIsProcessing(true);
      try {
        // upload zip file to supabase first
        const formData = new FormData();
        const fileName = `room-${processedRoomId.current}.zip`
        // @ts-expect-error react-native form data typing issue
        formData.append("file", {
          uri: url,
          name: fileName
        });
        const storageRes = await supabaseServiceRole.storage
          .from("cubi-zip-file")
          .upload(fileName, formData, {
            cacheControl: "3600",
            upsert: true,
          });

        const zipFilePath = storageRes.data?.path
        if (!zipFilePath) { throw new Error("Failed to upload zip file"); }

        await supabaseServiceRole
        .from("Room")
        .update({
          scannedFileKey: fileName
        })
        .eq("id", processedRoomId.current);

        // TODO call api to process zip file
      } catch(error) {
        console.error("Error processing image:", error);
        Alert.alert("Error", "Failed to process scan");
      }
      setIsProcessing(false);
      setShowScanner(false);
    }
    process()

    return;
    // Show confirmation alert before completing scan
    Alert.alert(
      'Finish Scan?',
      'Are you finished scanning this room?',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        { 
          text: 'Finish Scan', 
          style: 'default',
          onPress: async () => {
            setFinish(true);
            setIsProcessing(true);

            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
              const result = await new Promise<{
                destinationURL: string,
                capturedRoomURL: string,
                transformedRoomURL: string
              }>((resolve, reject) => {
                RoomScanModule.getOutputFiles((result: {
                  destinationURL: string,
                  capturedRoomURL: string,
                  transformedRoomURL: string
                }) => {
                  resolve(result);
                });
              });
              const transformedJSON = await fetch(result.transformedRoomURL).then(res => res.json());
              const roomPlanSvg = makeSVG(transformedJSON);

              const formData = new FormData();
              const fileName = `${processedRoomId.current}.usdz`
              // @ts-expect-error react-native form data typing issue
              formData.append("file", {
                uri: result.destinationURL,
                name: fileName
              });

              await supabaseServiceRole.storage
                .from("roomplan-usdz")
                .upload(fileName, formData, {
                  cacheControl: "3600",
                  upsert: true,
                });

              await supabaseServiceRole
                .from("Room")
                .update({
                  roomPlanSVG: roomPlanSvg,
                  scannedFileKey: fileName
                })
                .eq("id", processedRoomId.current);

              processedRoomPlanSVG.current = roomPlanSvg;

              if (onScanComplete) {
                setTimeout(() => {
                  setShowScanner(false);
                  onScanComplete(processedRoomId.current);
                }, 3000);
              }
            } catch (error) {
              console.error('error',error);
              setShowScanner(false);
            }

            setIsProcessing(false);
            setFinish(false);
          }
        },
      ]
    );
  };

  const handleScanError = (ev: { nativeEvent: { message: string }}) => {
    console.log("Error -> handleScanError", ev.nativeEvent)
    return;
  }

  if (isSupported === null) {
    // Loading state
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-5">
        <MaterialIcons name="hourglass-empty" size={64} color="#007AFF" />
        <Text className="text-center text-base text-[#007AFF] mt-4 text-lg">Checking device compatibility...</Text>
        <TouchableOpacity 
          className="flex-row items-center justify-center mt-5 py-2.5 px-5"
          onPress={onClose}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          <Text className="ml-1 text-base text-[#007AFF]">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!isSupported) {
    // Not supported message
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-5">
        {Platform.OS === 'ios' ? (
          <>
            <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
            <Text className="text-center text-2xl font-bold mt-4 mb-2">LiDAR Sensor Required</Text>
            <Text className="text-center text-base leading-6 text-[#666]">
              This feature requires a device with a LiDAR sensor. Please use an iPhone 12 Pro or newer.
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="build" size={64} color="#FF9500" />
            <Text className="text-center text-2xl font-bold mt-4 mb-2">Coming Soon</Text>
            <Text className="text-center text-base leading-6 text-[#666]">
              We're working hard to bring this feature to Android devices. Stay tuned for updates!
            </Text>
          </>
        )}
        <TouchableOpacity 
          className="flex-row items-center justify-center mt-5 py-2.5 px-5"
          onPress={onClose}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          <Text className="ml-1 text-base text-[#007AFF]">Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (showScanner) {
    return (
      <View className="relative inset-0 flex-1 bg-black">
        <View className="absolute inset-0 flex-1 w-full h-full z-10">
          {RoomScanView && (
            <RoomScanView
              onCaptureCompleted={handleScanComplete}
              onCaptureError={handleScanError}
            />
          )}
        </View>
        {isProcessing && (
          <View className="absolute inset-0 flex-1 w-full h-full bg-black opacity-50 z-20">
            <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          </View>
        )}
        {/* <TouchableOpacity 
          className={cn(
            "absolute bottom-[30px] right-[30px] w-[60px] h-[60px] rounded-full bg-[#007AFF] justify-center items-center shadow-md z-20",
            { "opacity-50": isProcessing }
          )}
          disabled={isProcessing}
          onPress={handleScanComplete}
        >
          <Ionicons name="checkmark" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          className={cn(
            `absolute top-[${insets.top + 20}px] right-5 w-11 h-11 bg-black/50 rounded-[22px] justify-center items-center z-20`,
            { "opacity-50": isProcessing }
          )}
          disabled={isProcessing}
          onPress={handleCancel}
        >
          <MaterialIcons name="close" size={32} color="white" />
        </TouchableOpacity> */}
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Text className="text-2xl font-bold mt-10 mb-5 text-center">3D Room Scanner</Text>
      <Text className="text-base text-center mx-5 mb-10 text-[#666]">
        Use your device's LiDAR sensor to create a 3D model of your room.
        This feature is only available on iOS devices with LiDAR sensors.
      </Text>

      {!roomId && !processedRoomId.current && (
        <View className="mx-10 mb-5">
          <Text className="text-base mb-1 text-[#444]">Room Name:</Text>
          <TextInput
            className="border border-[#ddd] rounded-lg px-4 py-3 text-base bg-[#f9f9f9]"
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Enter a name for this room"
            placeholderTextColor="#999"
          />
        </View>
      )}

      <TouchableOpacity 
        className={`bg-[#007AFF] py-4 px-8 rounded-lg mx-10 mb-5 items-center ${(!roomId && !newRoomName) ? 'bg-[#A0C8FF] opacity-70' : ''}`}
        onPress={handleStartScan}
        disabled={!roomId && !newRoomName}
      >
        <Text className="text-white text-lg font-semibold">
          {roomId || processedRoomId.current ? 'Rescan Room' : 'Start Room Scan'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="flex-row items-center justify-center mt-5 py-2.5 px-5"
        onPress={onClose}
      >
        <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        <Text className="ml-1 text-base text-[#007AFF]">Back</Text>
      </TouchableOpacity>

      {processedRoomPlanSVG.current && (
        <View className="mt-8">
          <View className="mx-auto" style={{ width: svgSize, height: svgSize }}>
            <SvgXml xml={processedRoomPlanSVG.current} width="100%" height="100%" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LidarScan; 