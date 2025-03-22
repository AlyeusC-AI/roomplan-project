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

import { ReadingType } from "@/types/app";
// Import refactored components
import { EditNameModal } from "./components/EditNameModal";
import { ImageViewer } from "./components/ImageViewer";

// Import hooks
import { useRoomReadingState } from "./hooks/useRoomReadingState";
import { useImageHandling } from "./hooks/useImageHandling";
import RoomReadingItem from "./components/readingItem";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";

// Define the type for the room reading component props
interface RoomReadingProps {
  room: any; // Room object
  reading: any; // Reading object with GenericRoomReading
  addReading: (data: any, type: ReadingType) => Promise<any>;
}

const RoomReading: React.FC<RoomReadingProps> = ({
  room,
  reading,
  addReading,
}) => {
  console.log("🚀 ~ room:", room);

  const {
    // Basic state
    isCollapsed,
    setIsCollapsed,
    setShowDatePicker,
    date,
    // Wall and floor name state
    showWallNameEdit,
    setShowWallNameEdit,
    showFloorNameEdit,
    setShowFloorNameEdit,
    wallName,
    setWallName,
    floorName,
    setFloorName,
    originalWallName,
    setOriginalWallName,
    originalFloorName,
    setOriginalFloorName,
    isUpdatingWallName,
    setIsUpdatingWallName,
    isUpdatingFloorName,
    setIsUpdatingFloorName,

    // Extended walls state
    extendedWallsStructure,
    setExtendedWallsStructure,

    showExtendedWallEdit,
    setShowExtendedWallEdit,
    currentEditingWall,
    setCurrentEditingWall,
    isUpdatingExtendedWall,
    setIsUpdatingExtendedWall,

    // Storage for images
    roomImages,
    genericImages,

    // Store access
    supabaseSession,
    rooms,
    projectId,
    updateRoom,
    setDate,
    showDatePicker,
    updateRoomReading,
  } = useRoomReadingState(room, reading, addReading);
  const defaultStyles = useDefaultStyles();

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
  } = useImageHandling(reading, async () => {
    // Function to refresh rooms data
    await fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
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
        rooms.setRooms(data.rooms);
      });
  });

  // Handlers for extended walls/floors

  const handleSaveExtendedWall = async () => {
    if (!currentEditingWall) return;

    try {
      setIsUpdatingExtendedWall(true);

      // Check if we're adding a new wall or updating existing
      const updatedWalls =
        currentEditingWall.id &&
        extendedWallsStructure.some((w) => w.id === currentEditingWall.id)
          ? extendedWallsStructure.map((w) =>
              w.id === currentEditingWall.id ? currentEditingWall : w
            )
          : [...extendedWallsStructure, currentEditingWall];

      // Update the state
      setExtendedWallsStructure(updatedWalls);

      // Save to database
      await updateRoom({
        extendedWalls: updatedWalls,
      });

      setShowExtendedWallEdit(false);
      setCurrentEditingWall(null);
    } catch (error) {
      console.error("Failed to save extended wall:", error);
    } finally {
      setIsUpdatingExtendedWall(false);
    }
  };

  const handleCancelExtendedWallEdit = () => {
    setShowExtendedWallEdit(false);
    setCurrentEditingWall(null);
  };

  // Wall and floor name handlers
  const handleUpdateWallName = async () => {
    try {
      setIsUpdatingWallName(true);
      await updateRoom({
        wallName,
      });
      setShowWallNameEdit(false);
      setOriginalWallName(wallName);
    } catch (error) {
      console.error("Failed to update wall name:", error);
    } finally {
      setIsUpdatingWallName(false);
    }
  };

  const handleUpdateFloorName = async () => {
    try {
      setIsUpdatingFloorName(true);
      await updateRoom({
        floorName,
      });
      setShowFloorNameEdit(false);
      setOriginalFloorName(floorName);
    } catch (error) {
      console.error("Failed to update floor name:", error);
    } finally {
      setIsUpdatingFloorName(false);
    }
  };

  const handleCancelWallNameEdit = () => {
    setWallName(originalWallName);
    setShowWallNameEdit(false);
  };

  const handleCancelFloorNameEdit = () => {
    setFloorName(originalFloorName);
    setShowFloorNameEdit(false);
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
            addReading={addReading}
            supabaseSession={supabaseSession}
            rooms={rooms}
            projectId={projectId}
            updateRoom={updateRoom}
            extendedWallsStructure={extendedWallsStructure}
            setExtendedWallsStructure={setExtendedWallsStructure}
            setShowExtendedWallEdit={setShowExtendedWallEdit}
            setCurrentEditingWall={setCurrentEditingWall}
            roomImages={roomImages}
            genericImages={genericImages}
            setShowWallNameEdit={setShowWallNameEdit}
            setShowFloorNameEdit={setShowFloorNameEdit}
            wallName={wallName}
            floorName={floorName}
            updateRoomReading={updateRoomReading}
            pickImage={pickImage}
            openImageViewer={openImageViewer}
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
        roomImages={roomImages}
        genericImages={genericImages}
        reading={reading}
        onDeleteImage={handleDeleteImage}
        onPrevImage={handlePrevImage}
        onNextImage={handleNextImage}
      />

      {/* Edit Wall Name Modal */}
      {showWallNameEdit && (
        <EditNameModal
          isOpen={showWallNameEdit}
          onClose={handleCancelWallNameEdit}
          title="Wall Name"
          value={wallName}
          onChange={setWallName}
          onSave={handleUpdateWallName}
          isLoading={isUpdatingWallName}
        />
      )}

      {/* Edit Floor Name Modal */}
      {showFloorNameEdit && (
        <EditNameModal
          isOpen={showFloorNameEdit}
          onClose={handleCancelFloorNameEdit}
          title="Floor Name"
          value={floorName}
          onChange={setFloorName}
          onSave={handleUpdateFloorName}
          isLoading={isUpdatingFloorName}
        />
      )}

      {/* Edit Extended Wall/Floor Modal */}
      {showExtendedWallEdit && (
        <EditNameModal
          isOpen={showExtendedWallEdit}
          onClose={handleCancelExtendedWallEdit}
          title={
            currentEditingWall?.type === "wall" ? "Wall Name" : "Floor Name"
          }
          value={currentEditingWall?.name || ""}
          onChange={(name) =>
            setCurrentEditingWall((prev: any) =>
              prev ? { ...prev, name } : null
            )
          }
          onSave={handleSaveExtendedWall}
          isLoading={isUpdatingExtendedWall}
        />
      )}
    </>
  );
};

export default RoomReading;
