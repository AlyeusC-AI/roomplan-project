import React, { useState } from "react";
import { Box, Button, FormControl, Heading, Modal, Stack } from "native-base";
import { format } from "date-fns";
import Collapsible from "react-native-collapsible";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  WifiOff,
  Thermometer,
  Droplets,
  Droplet,
} from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const ChevronDownComponent = ChevronDown as any;
const ChevronUpComponent = ChevronUp as any;
const ChevronRightComponent = ChevronRight as any;
const ChevronLeftComponent = ChevronLeft as any;
const WifiOffComponent = WifiOff as any;
const ThermometerComponent = Thermometer as any;
const DropletComponent = Droplet as any;
import { TouchableOpacity, Text, View } from "react-native";

// Import refactored components
import { EditNameModal } from "./components/EditNameModal";
import { ImageViewer } from "./components/ImageViewer";

// Import hooks
import { useRoomReadingState } from "./hooks/useRoomReadingState";
import { useImageHandling } from "./hooks/useImageHandling";
import RoomReadingItem from "./components/readingItem";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import {
  Room,
  Wall,
  RoomReading as RoomReadingType,
  useUpdateRoomReading,
  calculateGPP,
} from "@service-geek/api-client";

// Define the type for the room reading component props
interface RoomReadingProps {
  room: Room; // Room object
  reading: RoomReadingType; // Reading object with GenericRoomReading
  projectId?: string; // Project ID for offline functionality
  isOffline?: boolean; // Whether this reading is offline
}

const RoomReading: React.FC<RoomReadingProps> = ({
  room,
  reading,
  projectId,
  isOffline = false,
}) => {
  console.log("🚀 ~ room:", room);

  const {
    // Basic state
    isCollapsed,
    setIsCollapsed,
    setShowDatePicker,
    date,

    setDate,
    showDatePicker,
  } = useRoomReadingState(reading);
  const defaultStyles = useDefaultStyles();
  const [wall, setWall] = useState<Partial<Wall> | null>(null);
  const {
    selectedImageIndex,
    selectedImageType,
    selectedGenericIndex,
    handlePrevImage,
    handleNextImage,
    handleDeleteImage,
    closeImageViewer,
    pickImage,
    openImageViewer,
  } = useImageHandling(reading);
  const { mutate: updateRoomReading } = useUpdateRoomReading();

  const handleCancelWallNameEdit = () => {
    setWall(null);
  };

  return (
    <>
      <Button
        variant="outline"
        onPress={() => setIsCollapsed((o) => !o)}
       
        style={{
          borderWidth: 0,
          borderRadius: 16,
          height: 58,
        }}
      >
        <View className="flex flex-row justify-between w-full items-center py-1.5 gap-4 rounded-2xl">
          {/* Date on the left, readings on the right */}
          <View className="flex flex-row items-center flex-1 justify-between">
            {/* Date (left) */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-1">
              <Text className="text-gray-600 font-medium">
                {format(date, "MM/dd/yyyy")}
              </Text>
            </TouchableOpacity>
            {/* Readings (right) */}
            <View className="flex flex-row items-center gap-4 ml-4">
              {/* Temperature */}
              <View className="flex flex-row items-center">
                <ThermometerComponent size={16} color="#ef4444"  style={{marginRight: 2}}/>
                <Text className="text-gray-600 font-medium">
                  {reading.temperature}°F
                </Text>
              </View>
              {/* Humidity */}
              <View className="flex flex-row items-center ">
                <DropletComponent size={16} color="#2563eb" fill="#2563eb"  style={{marginRight: 2}}/>
                <Text className="text-gray-600 font-medium">
                  {reading.humidity}%
                </Text>
              </View>
              {/* GPP */}
              <View className="flex flex-row items-center gap-1">
                <Text className="text-gray-800 font-bold">
                  Gpp
                </Text>
                <Text className="text-gray-600 font-medium">
                  {calculateGPP(reading.temperature, reading.humidity)?.toString() || "0.0"}
                </Text>
              </View>
            </View>
          </View>
          {isOffline && (
            <View className="flex flex-row items-center bg-orange-100 px-2 py-1 rounded-full ml-2">
              <WifiOffComponent size={12} color="#f97316" />
              <Text className="text-orange-600 text-xs font-medium ml-1">
                Offline
              </Text>
            </View>
          )}
          {!isCollapsed ? (
            <ChevronDownComponent color="#1d4ed8" size={18} className="mx-2" />
          ) : (
            <ChevronRightComponent color="#1d4ed8" size={18} className="mx-2" />
          )}
        </View>
      </Button>

      {/* <Collapsible collapsed={isCollapsed}> */}
      {!isCollapsed && (
        <RoomReadingItem
          room={room}
          reading={reading}
          pickImage={pickImage}
          openImageViewer={openImageViewer}
          setWall={(wall) => setWall(wall)}
          projectId={projectId}
        />
      )}
      {/* </Collapsible> */}
      {/* Date Picker Modal */}
      <FormControl>
        <Modal isOpen={showDatePicker} onClose={() => setShowDatePicker(false)}>
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>Select Date</Modal.Header>
            <Modal.Body>
              <DateTimePicker
                mode="single"
                components={{
                  IconNext: <ChevronRightComponent color="#1d4ed8" size={18} />,
                  IconPrev: <ChevronLeftComponent color="#1d4ed8" size={18} />,
                }}
                onChange={(params) => {
                  setDate(new Date(params.date as string));
                  updateRoomReading({
                    id: reading.id,
                    data: {
                      date: new Date(params.date as string),
                    },
                  });
                  // updateRoomReading(reading.publicId, "standard", {
                  //   date: new Date(params.date as string).toISOString(),
                  // });
                  setShowDatePicker(false);
                }}
                styles={{
                  ...defaultStyles,
                  selected: {
                    ...defaultStyles.selected,
                    color: "#1d4ed8",
                    backgroundColor: "#1d4ed8",
                  },
                }}
                date={date}
              />
            </Modal.Body>
          </Modal.Content>
        </Modal>
      </FormControl>

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={selectedImageIndex !== null}
        onClose={closeImageViewer}
        selectedImageIndex={selectedImageIndex}
        selectedImageType={selectedImageType}
        selectedGenericIndex={selectedGenericIndex}
        room={room}
        reading={reading}
        onDeleteImage={handleDeleteImage}
        onPrevImage={handlePrevImage}
        onNextImage={handleNextImage}
      />

      {/* Edit Extended Wall/Floor Modal */}
      {wall && (
        <EditNameModal
          isOpen={wall !== null}
          onClose={handleCancelWallNameEdit}
          wall={wall}
        />
      )}
    </>
  );
};

export default RoomReading;
