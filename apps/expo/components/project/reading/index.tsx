import React, { useState } from "react";
import { Box, Button, FormControl, Heading, Modal, Stack } from "native-base";
import { format } from "date-fns";
import Collapsible from "react-native-collapsible";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react-native";
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
} from "@service-geek/api-client";

// Define the type for the room reading component props
interface RoomReadingProps {
  room: Room; // Room object
  reading: RoomReadingType; // Reading object with GenericRoomReading
}

const RoomReading: React.FC<RoomReadingProps> = ({ room, reading }) => {
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

  const handleCancelWallNameEdit = () => {
    setWall(null);
  };

  return (
    <>
      <Button
        variant="outline"
        onPress={() => setIsCollapsed((o) => !o)}
        className="mb-4"
      >
        <View className="flex flex-row justify-between w-full items-center px-3 py-1.5">
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text className="text-blue-600 font-medium">
              {format(date, "MM/dd/yyyy")}
            </Text>
          </TouchableOpacity>
          {!isCollapsed ? (
            <ChevronDown color="#1d4ed8" size={18} />
          ) : (
            <ChevronUp color="#1d4ed8" size={18} />
          )}
        </View>
      </Button>

      <Collapsible collapsed={isCollapsed}>
        {!isCollapsed && (
          <RoomReadingItem
            room={room}
            reading={reading}
            pickImage={pickImage}
            openImageViewer={openImageViewer}
            setWall={(wall) => setWall(wall)}
          />
        )}
      </Collapsible>
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
                  IconNext: <ChevronRight color="#1d4ed8" size={18} />,
                  IconPrev: <ChevronLeft color="#1d4ed8" size={18} />,
                }}
                onChange={(params) => {
                  setDate(new Date(params.date as string));
                  updateRoomReading(reading.publicId, "standard", {
                    date: new Date(params.date as string).toISOString(),
                  });
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
