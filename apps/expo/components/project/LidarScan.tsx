import React, { useEffect, useRef, useState } from 'react';
import { View, Platform, TouchableOpacity, NativeModules, Share,
  requireNativeComponent, UIManager, Text, TextInput, Dimensions,
  SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { makeSVG } from '@/lib/utils/generate2DPlan';
import { userStore } from '@/lib/state/user';
import { useLocalSearchParams } from 'expo-router';
import { roomsStore } from '@/lib/state/rooms';
import { roomInferenceStore } from '@/lib/state/readings-image';
import { supabaseServiceRole } from '@/app/projects/[projectId]/camera';
import { useCreateRoom } from '@service-geek/api-client';

import { RoomPlanImage } from './LidarRooms';
import { cn } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LidarRoomTypeSelect } from './LidarRoomTypeSelect';

const { RoomScanModule } = NativeModules;

// Check if device has LiDAR sensor (iOS only)
const hasLidarSensor = async (): Promise<boolean> => {
  console.log("NativeModules.RoomScanModule: ", NativeModules.RoomScanModule);
  console.log("RoomScanModule has isAvailable? ", typeof RoomScanModule.isAvailable === 'function');
  console.log("RoomScanModule.isAvailable(): ", RoomScanModule.isAvailable());
  return await RoomScanModule && RoomScanModule.isAvailable();
};

/**
 * finish values:
 * -1: scanning
 * 0: scan completed
 * 1: finish this room
 * 2: finish entire structure
 */
type RoomScanViewProps = {
  finish: -1 | 0 | 1 | 2;
  onCaptureCompleted: (ev: any) => void;
  onCaptureError: (ev: any) => void;
}

// Check if the RoomPlan component is available
const isRoomPlanAvailable = () => {
  if (Platform.OS !== 'ios') return false;
  
  // Check if the native module exists
  return UIManager.getViewManagerConfig('RoomScanView') != null;
};

// Create a native component wrapper if available
const RoomScanView = isRoomPlanAvailable()
  ? requireNativeComponent<RoomScanViewProps>('RoomScanView')
  : null;

interface LidarScanProps {
  onScanComplete?: (roomId?: number) => void;
  onClose?: () => void;
  roomId?: number;
  roomPlanSVG?: string;
}

const LidarScan = ({ onScanComplete, onClose, roomId, roomPlanSVG }: LidarScanProps) => {
  const [finish, setFinish] = useState<-1 | 0 | 1 | 2>(0);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [isScanProcessed, setIsScanProcessed] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [imgkitLoading, setImgkitLoading] = useState<boolean>(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const deviceWidth = Dimensions.get('window').width;
  const svgSize = deviceWidth * 0.95;
  const processedRoomId = useRef<number | undefined>(roomId);
  const processedRoomPlanSVG = useRef<string | undefined>(roomPlanSVG);
  const pngBase64 = useRef<string>('');
  const rooms = roomsStore();
  const [roomNames, setRoomNames] = useState<string[]>([]);
  const [showROomTypeSelect, setShowRoomTypeSelect] = useState(false);
  const createRoom = useCreateRoom();

  useEffect(() => {
    const checkSupport = async () => {
      const hasLidar = await hasLidarSensor();
      setIsSupported(hasLidar);
    };

    checkSupport();
  }, []);

  const handleStartScan = async () => {
    setIsScanProcessed(false)
    if (!processedRoomId.current) {
      console.log("new room creation - projectId", projectId)
      try {
        const result = await createRoom.mutateAsync({
          name: newRoomName,
          projectId,
        });

        if (result.status === "failed") {
          const errorMessage = result.reason === "existing-room" ? "Room already exists" : "Failed to create room";
          Alert.alert(
            'Error',
            errorMessage,
            [{ text: 'OK', style: 'cancel' }]
          );
          return;
        }

        processedRoomId.current = result.room.id;
        console.log("json.room.id", result.room.id);

        roomsStore.getState().addRoom({ ...result.room, RoomReading: [] });
        roomInferenceStore.getState().addRoom({ ...result.room, Inference: [] });
      } catch (error) {
        console.error("Error creating room:", error);
        Alert.alert(
          'Error',
          'Failed to create room',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }
    } else {
      const room = rooms.rooms.find(room => room.id === processedRoomId.current);
      if (room) {
        setNewRoomName(room.name);
      }
    }
    setShowRoomTypeSelect(true);
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

  const handleScanComplete = async () => {
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
      const roomPlanSvg = makeSVG(transformedJSON, roomNames, newRoomName);

      const formData = new FormData();
      const fileName = `${processedRoomId.current}.usdz`
      // @ts-expect-error react-native form data typing issue
      formData.append("file", {
        uri: result.destinationURL,
        name: fileName
      });

      const jsonFormData = new FormData();
      const jsonFileName = `${processedRoomId.current}.json`

      // @ts-expect-error react-native form data typing issue
      jsonFormData.append("file", {
        uri: result.capturedRoomURL,
        name: jsonFileName
      })

      await supabaseServiceRole.storage
        .from("roomplan-usdz")
        .upload(fileName, formData, {
          cacheControl: "3600",
          upsert: true,
        });


      await supabaseServiceRole.storage
        .from("roomplan-usdz")
        .upload(jsonFileName, jsonFormData, {
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
          // setShowScanner(false);
          onScanComplete(processedRoomId.current);
        }, 3000);
      }
      setIsScanProcessed(true)
    } catch (error) {
      console.error('error',error);
      setShowScanner(false);
    }

    setIsProcessing(false);
    setFinish(0);
  }

  useEffect(() => {
    if (finish > 0) {
      setFinish(0)
    }
  }, [finish])

  const confirmScanComplete = () => {
    // Show confirmation alert before completing scan
    // Below is IOS Native Lidar Sensor integration. Keep this so that we use it when we come back from cubicasa
    Alert.alert(
      'Finish Scan?',
      'Are you finished scanning this room?',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        { 
          text: 'Finish This Room', 
          style: 'default',
          onPress: () => {
            setFinish(1);
          }
        },
        { 
          text: 'Finish Entire Structure', 
          style: 'default',
          onPress: () => {
            setFinish(2);
            setIsProcessing(true);
          }
        },
      ]
    );
  };

  const handleScanError = (ev: { nativeEvent: { message: string }}) => {
    console.log("Error -> handleScanError", ev.nativeEvent)
    Alert.alert(
      'Error',
      'Failed to capture room. Please try again.',
      [{ text: 'OK', style: 'cancel' }]
    )
    setIsProcessing(false)
    setShowScanner(false)
    return;
  }

  const handleNextRoomScanStart = () => {
    setShowRoomTypeSelect(true);
  }

  const handleShareRoomPlan = async () => {
    if (pngBase64.current) {
      setImgkitLoading(true);
      try {
        console.log('>>>>')
        console.log(pngBase64.current)
        const result = await new Promise(res => RoomScanModule.savePngFile(pngBase64.current, res))

        console.log(result)

        Share.share({
          url: result.path,
        })
      } catch (error) {
        console.error('error', error);
      } finally {
        setImgkitLoading(false);
      }
    }
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
              finish={finish}
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
        {!isScanProcessed && !isProcessing && finish === 0 && (
          <View className="absolute bottom-[110px] w-72 left-1/2 -translate-x-1/2 z-20 bg-black/50 rounded-lg py-4 px-5">
            <Text className="text-white text-lg text-center font-semibold">
              Please go to the next room and begin the scan when you're ready.
            </Text>
          </View>
        )}
        {!isScanProcessed && (
          <TouchableOpacity 
            className={cn(
              "absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-red-500 justify-center items-center shadow-md z-20",
              { "opacity-50": isProcessing }
            )}
            disabled={isProcessing}
            onPress={() => { finish !== -1 ? handleNextRoomScanStart(): confirmScanComplete() }}
          >
            <Ionicons name={finish === -1 ? "stop" : "scan-circle"} size={36} color="white" />
          </TouchableOpacity>
        )}
        {isScanProcessed && (
          <TouchableOpacity 
            className="absolute bottom-[30px] left-1/2 -translate-x-1/2 py-4 px-5 rounded-lg bg-black/50 justify-center items-center z-20"
            onPress={() => {
              setIsScanProcessed(false)
              setShowScanner(false)
            }}
          >
            <Text className="text-white text-base">Scan processed. Tap To Close</Text>
          </TouchableOpacity>
        )}
        {!isScanProcessed && (
          <TouchableOpacity 
            className={cn(
              `absolute top-[80px] right-5 w-11 h-11 bg-black/50 rounded-[22px] justify-center items-center z-20`,
              { "opacity-50": isProcessing }
            )}
            disabled={isProcessing}
            onPress={handleCancel}
          >
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>
        )}
        {showROomTypeSelect && (
          <LidarRoomTypeSelect
            onSelect={(roomType) => {
              setRoomNames(roomNames.concat(roomType))
              setFinish(-1)
              setShowRoomTypeSelect(false)
            }}
            onCancel={() => { setShowRoomTypeSelect(false) }}
          />
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
        className="flex-row items-center justify-center mt-5 py-2.5 px-5"
        onPress={onClose}
      >
        <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        <Text className="ml-1 text-base text-[#007AFF]">Back</Text>
      </TouchableOpacity>

      {processedRoomPlanSVG.current && (
        <View className="mt-8">
          <View className="mx-auto" style={{ width: svgSize, height: svgSize }}>
            <RoomPlanImage
              key={processedRoomPlanSVG.current}
              src={processedRoomPlanSVG.current}
              onPngReady={data => pngBase64.current = data}
            />
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center mt-5 py-2.5 px-5"
            onPress={handleShareRoomPlan}
            disabled={imgkitLoading}
          >
            {imgkitLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <MaterialIcons name="share" size={24} color="#007AFF" />
                <Text className="ml-1 text-base text-[#007AFF]">Share Room Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row justify-around w-full mt-10">
        <TouchableOpacity 
          className={`bg-[#007AFF] py-4 px-8 rounded-lg mb-5 items-center ${(!roomId && !newRoomName) ? 'bg-[#A0C8FF] opacity-70' : ''}`}
          disabled={!roomId && !newRoomName}
        >
          <Text className="text-white text-lg font-semibold">
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`bg-[#007AFF] py-4 px-8 rounded-lg mb-5 items-center ${(!roomId && !newRoomName) ? 'bg-[#A0C8FF] opacity-70' : ''}`}
          onPress={handleStartScan}
          disabled={!roomId && !newRoomName}
        >
          <Text className="text-white text-lg font-semibold">
            {roomId || processedRoomId.current ? 'Rescan Room' : 'Start Room Scan'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`bg-[#007AFF] py-4 px-8 rounded-lg mb-5 items-center ${(!roomId && !newRoomName) ? 'bg-[#A0C8FF] opacity-70' : ''}`}
          disabled={!roomId && !newRoomName}
        >
          <Text className="text-white text-lg font-semibold">
            ESX
          </Text>
        </TouchableOpacity>
      </View>
      {showROomTypeSelect && (
        <LidarRoomTypeSelect
          onSelect={(roomType) => {
            setRoomNames(roomNames.concat(roomType))
            setShowScanner(true)
            setFinish(-1)
            setShowRoomTypeSelect(false)
          }}
          onCancel={() => { setShowRoomTypeSelect(false) }}
        />
      )}
    </SafeAreaView>
  );
};

export default LidarScan; 