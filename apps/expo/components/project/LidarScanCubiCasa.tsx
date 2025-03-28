import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, TouchableOpacity, NativeModules, Modal,
  requireNativeComponent, UIManager, Text, TextInput, Dimensions,
  SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { userStore } from '@/lib/state/user';
import { useLocalSearchParams } from 'expo-router';
import { roomsStore } from '@/lib/state/rooms';
import { roomInferenceStore } from '@/lib/state/readings-image';
import { supabaseServiceRole } from '@/app/projects/[projectId]/camera';

import { RoomPlanImage } from './LidarRooms';;

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

const LidarScanCubiCasa = ({ onScanComplete, onClose, roomId, roomPlanSVG }: LidarScanProps) => {
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
  const [showPlanSelectionModal, setShowPlanSelectionModal] = useState<boolean>(false);
  const [scanPlan, setScanPlan] = useState<'free' | 'fast'>('free');

  useEffect(() => {
    const checkSupport = async () => {
      const hasLidar = await hasLidarSensor();
      setIsSupported(hasLidar);
    };

    checkSupport();
  }, []);

  const handleStartScan = async (plan: 'free' | 'fast') => {
    setScanPlan(plan);
    setShowPlanSelectionModal(false);
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

    if (url === "user-cancel") {
      setShowScanner(false);
      return
    }

    const processScanData = async () => {
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

        // call api to process zip file
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room/${processedRoomId.current}/cubicasa?plan=${scanPlan}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${supabaseSession?.access_token}`,
            },
          }
        );
  
        Alert.alert("Success", "Scan completed successfully, Your 2d plan will be ready shortly");
        onClose && onClose()
      } catch(error) {
        console.error("Error processing image:", error);
        Alert.alert("Error", "Failed to process scan");
      }
      setIsProcessing(false);
      setShowScanner(false);
    }
    processScanData()

    return;
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
        onPress={() => setShowPlanSelectionModal(true)}
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
            <RoomPlanImage src={processedRoomPlanSVG.current} />
          </View>
        </View>
      )}

      <Modal
        visible={showPlanSelectionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPlanSelectionModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">Select Scan Plan</Text>
              <TouchableOpacity 
                onPress={() => setShowPlanSelectionModal(false)}
                className="p-2"
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4 gap-4">
              <TouchableOpacity
                className="bg-white border-2 border-[#007AFF] rounded-xl p-4 active:opacity-80"
                onPress={() => handleStartScan('free')}
              >
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="room" size={24} color="#007AFF" />
                  <Text className="text-xl font-semibold text-[#007AFF] ml-2">Free Scan</Text>
                </View>
                <Text className="text-gray-600 text-base leading-5">
                  Take your time to scan the room carefully. This option provides the most accurate results but may take longer to complete.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white border-2 border-[#007AFF] rounded-xl p-4 active:opacity-80"
                onPress={() => handleStartScan('fast')}
              >
                <View className="flex-row items-center mb-2">
                  <MaterialIcons name="speed" size={24} color="#007AFF" />
                  <Text className="text-xl font-semibold text-[#007AFF] ml-2">Fast Scan</Text>
                </View>
                <Text className="text-gray-600 text-base leading-5">
                  Everything in Free Scan, Plus faster results.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LidarScanCubiCasa; 