import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Heading, Modal, Stack } from "native-base";
import { format } from "date-fns";
import Collapsible from "react-native-collapsible";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react-native";
import { v4 } from "react-native-uuid/dist/v4";
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
} from "react-native";
import DateTimePicker, { getDefaultStyles } from "react-native-ui-datepicker";
import { ExtendedWallItem } from "@/types/app";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner-native";
import { useGlobalSearchParams } from "expo-router";
import { roomsStore } from "@/lib/state/rooms";
import { userStore } from "@/lib/state/user";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";

// Import refactored components
import { RoomReadingInput } from "./components/RoomReadingInput";
import { EditNameModal } from "./components/EditNameModal";
import { ImageViewer } from "./components/ImageViewer";
import { ExtendedWallSection } from "./components/ExtendedWallSection";
import { GenericRoomReadingSection } from "./components/GenericRoomReadingSection";

// Import hooks
import { useRoomReadingState } from "./hooks/useRoomReadingState";
import { useImageHandling } from "./hooks/useImageHandling";

// Define the type for the room reading component props
interface RoomReadingProps {
  room: any; // Room object
  reading: any; // Reading object with GenericRoomReading
  addReading: (data: any, type: string) => Promise<any>;
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
    showDatePicker,
    setShowDatePicker,
    isDeleting,
    setIsDeleting,
    isAdding,
    setIsAdding,
    date,
    setDate,

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
    extendedWalls,
    setExtendedWalls,
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

    // Functions
    updateRoomReading,
    deleteReading,

    // Store access
    supabaseSession,
    rooms,
    projectId,
    updateRoom,
  } = useRoomReadingState(room, reading, addReading);

  const {
    selectedImageIndex,
    selectedImageType,
    selectedGenericIndex,
    handlePrevImage,
    handleNextImage,
    handleDeleteImage,
    pickImage,
    closeImageViewer,
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

  const defaultStyles = getDefaultStyles();

  const calculateGPP = (
    temperature: string | null,
    humidity: string | null
  ) => {
    if (!temperature || !humidity) return null;
    const temp = Number(temperature);
    const hum = Number(humidity);
    if (isNaN(temp) || isNaN(hum)) return null;
    return (hum / 100) * 7000 * (1 / 7000 + (2 / 7000) * (temp - 32));
  };

  // Add effect to calculate initial gpp
  useEffect(() => {
    const initialGPP = calculateGPP(reading.temperature, reading.humidity);
    if (initialGPP !== null && reading.gpp !== initialGPP.toFixed(2)) {
      updateRoomReading(reading.publicId, "standard", {
        gpp: initialGPP.toFixed(2),
      });
    }
  }, []);

  // Handlers for extended walls/floors
  const handleAddExtendedWall = (type: "wall" | "floor") => {
    const newWall: ExtendedWallItem = {
      id: v4().toString(),
      name:
        type === "wall"
          ? `Wall ${extendedWallsStructure.filter((w) => w.type === "wall").length + 1}`
          : `Floor ${extendedWallsStructure.filter((w) => w.type === "floor").length + 1}`,
      value: null,
      type,
    };
    setCurrentEditingWall(newWall);
    setShowExtendedWallEdit(true);
  };

  const handleEditExtendedWall = (wall: ExtendedWallItem) => {
    setCurrentEditingWall({ ...wall });
    setShowExtendedWallEdit(true);
  };

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

  const handleDeleteExtendedWall = async (id: string) => {
    try {
      const updatedWalls = extendedWallsStructure.filter((w) => w.id !== id);
      setExtendedWallsStructure(updatedWalls);

      await updateRoom({
        extendedWalls: updatedWalls,
      });

      toast.success("Measurement deleted successfully");
    } catch (error) {
      toast.error("Failed to delete measurement");
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

  const confirmDeleteReading = () => {
    Alert.alert(
      "Delete Reading",
      "Are you sure you want to delete this reading? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => deleteReading(reading.publicId, "standard"),
        },
      ]
    );
  };

  // Helper function to get images for a specific extended wall
  const getExtendedWallImagesForUI = (
    wallId: string
  ): { key: string; uri: string }[] => {
    if (!reading.RoomReadingImage) return [];

    const images = reading.RoomReadingImage.filter(
      (img: any) => img.type === wallId
    )
      .map((img: any) => ({
        key: img.imageKey,
        uri: roomImages[img.imageKey] || "",
      }))
      .filter((img: { key: string; uri: string }) => img.uri);

    return images;
  };

  // Function to handle value changes for extended walls
  const handleExtendedWallValueChange = async (id: string, value: string) => {
    const updatedWalls = extendedWalls.map((w) =>
      w.id === id ? { ...w, value } : w
    );
    setExtendedWalls(updatedWalls);
    await updateRoomReading(reading.publicId, "standard", {
      extendedWalls: updatedWalls,
    });
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
        <Box
          key={reading?.publicId}
          w="full"
          pl={4}
          borderLeftWidth={1}
          borderLeftColor="blue.500"
          className="gap-y-2"
        >
          {/* Delete Reading Button */}
          <Button
            onPress={confirmDeleteReading}
            className="flex-row items-center justify-center bg-white rounded-lg py-1.5 px-3 border border-red-300"
            variant="destructive"
            disabled={isDeleting}
          >
            <View className="flex-row items-center">
              {isDeleting ? (
                <ActivityIndicator
                  color="#dc2626"
                  size="small"
                  className="mr-1.5"
                />
              ) : (
                <Trash2
                  color="#dc2626"
                  height={16}
                  width={16}
                  className="mr-1.5"
                />
              )}
              <Text className="text-red-700 font-medium text-sm">
                {isDeleting ? "Deleting..." : "Delete Reading"}
              </Text>
            </View>
          </Button>

          {/* Date Picker Modal */}
          <FormControl>
            <Modal
              isOpen={showDatePicker}
              onClose={() => setShowDatePicker(false)}
            >
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

          {/* Main Form */}
          <FormControl>
            <Stack mx="2" className="gap-y-2">
              {/* Temperature Input */}
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                  Temperature
                </FormControl.Label>
                <RoomReadingInput
                  value={reading.temperature || ""}
                  placeholder="Temperature"
                  rightText="°F"
                  onChange={(value) => {
                    updateRoomReading(reading.publicId, "standard", {
                      temperature: value,
                      gpp: calculateGPP(value, reading.humidity)?.toFixed(2),
                    });
                  }}
                />
              </View>

              {/* Relative Humidity Input */}
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                  Relative Humidity
                </FormControl.Label>
                <RoomReadingInput
                  value={reading.humidity || ""}
                  placeholder="Relative Humidity"
                  rightText="%"
                  onChange={(value) => {
                    updateRoomReading(reading.publicId, "standard", {
                      humidity: value,
                      gpp: calculateGPP(reading.temperature, value)?.toFixed(2),
                    });
                  }}
                />
              </View>

              {/* Grains Per Pound Input */}
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                  Grains Per Pound
                </FormControl.Label>
                <RoomReadingInput
                  value={reading.gpp || ""}
                  placeholder="Grains Per Pound"
                  rightText="gpp"
                  disabled
                  onChange={() => {}}
                />
              </View>

              {/* Wall Moisture Content Section */}
              <View>
                <View className="flex-row items-center justify-between mb-0.5">
                  <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => setShowWallNameEdit(true)}>
                      <FormControl.Label className="text-gray-700 font-medium text-sm">
                        {wallName || "Moisture Content (Wall)"}
                      </FormControl.Label>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAddExtendedWall("wall")}
                      className="ml-2"
                    >
                      <Plus color="#1d4ed8" size={16} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => pickImage("room", undefined, "wall")}
                    className="p-0.5"
                  >
                    <Camera color="#1d4ed8" size={20} />
                  </TouchableOpacity>
                </View>

                {/* Wall Moisture Content Input */}
                <RoomReadingInput
                  value={reading.moistureContentWall || ""}
                  placeholder="Enter moisture content percentage"
                  rightText="%"
                  onChange={(moistureContentWall) =>
                    updateRoomReading(reading.publicId, "standard", {
                      moistureContentWall,
                    })
                  }
                />

                {/* Wall Images */}
                {reading.RoomReadingImage &&
                  reading.RoomReadingImage.filter(
                    (img: any) => img.type === "wall"
                  ).length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
                      {reading.RoomReadingImage.filter(
                        (img: any) => img.type === "wall"
                      ).map((img: any, index: number) => (
                        <Pressable
                          key={img.imageKey}
                          onPress={() => openImageViewer(index, "wall")}
                        >
                          <Image
                            source={{ uri: roomImages[img.imageKey] }}
                            style={{ width: 80, height: 80, borderRadius: 6 }}
                          />
                        </Pressable>
                      ))}
                    </View>
                  )}

                {/* Extended Walls Section */}
                {extendedWallsStructure
                  ?.filter((w) => w.type === "wall")
                  .map((wall) => (
                    <ExtendedWallSection
                      key={wall.id}
                      wall={{
                        ...wall,
                        value:
                          reading.extendedWalls?.find((w) => w.id === wall.id)
                            ?.value || null,
                      }}
                      onEdit={handleEditExtendedWall}
                      onDelete={handleDeleteExtendedWall}
                      onPickImage={(id) => pickImage("room", undefined, id)}
                      onValueChange={handleExtendedWallValueChange}
                      images={getExtendedWallImagesForUI(wall.id)}
                      onImagePress={(index, id) => openImageViewer(index, id)}
                    />
                  ))}
              </View>

              {/* Floor Moisture Content Section */}
              <View>
                <View className="flex-row items-center justify-between mb-0.5">
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => setShowFloorNameEdit(true)}
                    >
                      <FormControl.Label className="text-gray-700 font-medium text-sm">
                        {floorName || "Moisture Content (Floor)"}
                      </FormControl.Label>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAddExtendedWall("floor")}
                      className="ml-2"
                    >
                      <Plus color="#1d4ed8" size={16} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => pickImage("room", undefined, "floor")}
                    className="p-0.5"
                  >
                    <Camera color="#1d4ed8" size={20} />
                  </TouchableOpacity>
                </View>

                {/* Floor Moisture Content Input */}
                <RoomReadingInput
                  value={reading.moistureContentFloor || ""}
                  placeholder="Enter moisture content percentage"
                  rightText="%"
                  onChange={(moistureContentFloor) =>
                    updateRoomReading(reading.publicId, "standard", {
                      moistureContentFloor,
                    })
                  }
                />

                {/* Floor Images */}
                {reading.RoomReadingImage &&
                  reading.RoomReadingImage.filter(
                    (img: any) => img.type === "floor"
                  ).length > 0 && (
                    <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
                      {reading.RoomReadingImage.filter(
                        (img: any) => img.type === "floor"
                      ).map((img: any, index: number) => (
                        <Pressable
                          key={img.imageKey}
                          onPress={() => openImageViewer(index, "floor")}
                        >
                          <Image
                            source={{ uri: roomImages[img.imageKey] }}
                            style={{ width: 80, height: 80, borderRadius: 6 }}
                          />
                        </Pressable>
                      ))}
                    </View>
                  )}

                {/* Extended Floors Section */}
                {extendedWallsStructure
                  ?.filter((w) => w.type === "floor")
                  .map((floor) => (
                    <ExtendedWallSection
                      key={floor.id}
                      wall={{
                        ...floor,
                        value:
                          reading.extendedWalls?.find((w) => w.id === floor.id)
                            ?.value || null,
                      }}
                      onEdit={handleEditExtendedWall}
                      onDelete={handleDeleteExtendedWall}
                      onPickImage={(id) => pickImage("room", undefined, id)}
                      onValueChange={handleExtendedWallValueChange}
                      images={getExtendedWallImagesForUI(floor.id)}
                      onImagePress={(index, id) => openImageViewer(index, id)}
                    />
                  ))}
              </View>

              {/* Dehumidifier Readings Section */}
              <Heading
                size="sm"
                mt="2"
                mb="1"
                className="text-gray-700 font-semibold text-sm"
              >
                Dehumidifier Readings
              </Heading>

              {/* Map through generic readings */}
              {reading.GenericRoomReading.map((grr: any, index: number) => (
                <GenericRoomReadingSection
                  key={grr.publicId}
                  index={index}
                  reading={grr}
                  onUpdateReading={updateRoomReading}
                  onPickImage={(id) => pickImage("generic", id)}
                  genericImages={genericImages}
                  onImagePress={(imgIndex, genericId) =>
                    openImageViewer(imgIndex, "generic", genericId)
                  }
                />
              ))}

              {/* Empty state for generic readings */}
              {reading.GenericRoomReading.length === 0 && (
                <View className="flex items-center justify-center py-4">
                  <Text className="text-gray-400 font-medium text-sm">
                    No dehumidifier readings yet
                  </Text>
                </View>
              )}

              {/* Add Dehumidifier Reading Button */}
              <Button
                onPress={async () => {
                  setIsAdding(true);
                  try {
                    const body = await addReading(
                      {
                        roomReadingId: reading.id,
                        publicId: v4(),
                        value: "",
                        type: "dehumidifer",
                      },
                      "generic"
                    );
                    rooms.addGenericRoomReading(
                      room.id,
                      reading.id,
                      body.reading
                    );
                  } catch (err) {
                    console.error("Failed to add dehumidifer reading:", err);
                  } finally {
                    setIsAdding(false);
                  }
                }}
                className="flex-row items-center justify-center bg-blue-600 rounded-lg py-1.5 px-3 my-2 mx-2 border border-blue-700"
                disabled={isAdding}
              >
                <View className="flex-row items-center ">
                  {isAdding ? (
                    <ActivityIndicator
                      color="#FFF"
                      size="small"
                      className="mr-1.5"
                    />
                  ) : (
                    <Plus
                      color="#FFF"
                      height={16}
                      width={16}
                      className="mr-1.5"
                    />
                  )}
                  <Text className="text-white font-medium text-sm">
                    {isAdding ? "Adding..." : "Add Dehumidifier Reading"}
                  </Text>
                </View>
              </Button>
            </Stack>
          </FormControl>
        </Box>
      </Collapsible>

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
      <EditNameModal
        isOpen={showWallNameEdit}
        onClose={handleCancelWallNameEdit}
        title="Wall Name"
        value={wallName}
        onChange={setWallName}
        onSave={handleUpdateWallName}
        isLoading={isUpdatingWallName}
      />

      {/* Edit Floor Name Modal */}
      <EditNameModal
        isOpen={showFloorNameEdit}
        onClose={handleCancelFloorNameEdit}
        title="Floor Name"
        value={floorName}
        onChange={setFloorName}
        onSave={handleUpdateFloorName}
        isLoading={isUpdatingFloorName}
      />

      {/* Edit Extended Wall/Floor Modal */}
      <EditNameModal
        isOpen={showExtendedWallEdit}
        onClose={handleCancelExtendedWallEdit}
        title={currentEditingWall?.type === "wall" ? "Wall Name" : "Floor Name"}
        value={currentEditingWall?.name || ""}
        onChange={(name) =>
          setCurrentEditingWall((prev) => (prev ? { ...prev, name } : null))
        }
        onSave={handleSaveExtendedWall}
        isLoading={isUpdatingExtendedWall}
      />
    </>
  );
};

export default RoomReading;
