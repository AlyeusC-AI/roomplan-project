import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Heading, Modal, Stack } from "native-base";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
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
} from "react-native";
import DateTimePicker, { useDefaultStyles } from "react-native-ui-datepicker";
import { ExtendedWallItem, ReadingType } from "@/types/app";
import { toast } from "sonner-native";

// Import refactored components
import { RoomReadingInput } from "./RoomReadingInput";
import { ExtendedWallSection } from "./ExtendedWallSection";
import { GenericRoomReadingSection } from "./GenericRoomReadingSection";

// Import hooks
import { useRoomReadingState } from "../hooks/useRoomReadingState";
import { useImageHandling } from "../hooks/useImageHandling";
import { OptimizedImage } from "@/lib/utils/OptimizedImage";
import { Database } from "@/types/database";

const RoomReadingItem = ({
  room,
  reading,
  addReading,
  // Store access
  supabaseSession,
  rooms,
  projectId,
  updateRoom,
  // Extended walls state
  extendedWallsStructure,
  setExtendedWallsStructure,
  setShowExtendedWallEdit,
  setCurrentEditingWall,
  // Storage for images
  roomImages,
  genericImages,
  setShowWallNameEdit,
  setShowFloorNameEdit,
  wallName,
  floorName,
  updateRoomReading,
  pickImage,
  openImageViewer,
}: {
  room: any;
  reading: any;
  addReading: any;
  supabaseSession: any;
  rooms: any;
  projectId: any;
  updateRoom: any;
  extendedWallsStructure: any;
  setExtendedWallsStructure: any;
  setShowExtendedWallEdit: any;
  setCurrentEditingWall: any;
  roomImages: any;
  genericImages: any;
  setShowWallNameEdit: any;
  setShowFloorNameEdit: any;
  wallName: any;
  floorName: any;
  updateRoomReading: any;
  pickImage: any;
  openImageViewer: any;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Extended walls state
  const [extendedWalls, setExtendedWalls] = useState<ExtendedWallItem[]>([]);

  const [computedGPP, setComputedGPP] = useState<string | null>(null);

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
    setComputedGPP(initialGPP?.toFixed(2) || null);

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
          ? `Wall ${
              extendedWallsStructure.filter((w: any) => w.type === "wall")
                .length + 1
            }`
          : `Floor ${
              extendedWallsStructure.filter((w: any) => w.type === "floor")
                .length + 1
            }`,
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

  const handleDeleteExtendedWall = async (id: string) => {
    try {
      const updatedWalls = extendedWallsStructure.filter(
        (w: any) => w.id !== id
      );
      setExtendedWallsStructure(updatedWalls);

      await updateRoom({
        extendedWalls: updatedWalls,
      });

      toast.success("Measurement deleted successfully");
    } catch (error) {
      toast.error("Failed to delete measurement");
    }
  };
  const deleteReading = async (readingId: string, type: ReadingType) => {
    try {
      setIsDeleting(true);
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            type,
            readingId,
          }),
        }
      );
      rooms.removeReading(room.id, reading.id);
    } catch {
      toast.error("Could not delete reading");
    } finally {
      setIsDeleting(false);
    }
  };

  // Wall and floor name handlers

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
            <Trash2 color="#dc2626" height={16} width={16} className="mr-1.5" />
          )}
          <Text className="text-red-700 font-medium text-sm">
            {isDeleting ? "Deleting..." : "Delete Reading"}
          </Text>
        </View>
      </Button>

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
                const gpp = calculateGPP(value, reading.humidity);
                setComputedGPP(gpp ? gpp.toFixed(2) : null);
                updateRoomReading(reading.publicId, "standard", {
                  temperature: value,
                  gpp: gpp ? gpp.toFixed(2) : null,
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
                const gpp = calculateGPP(reading.temperature, value);
                setComputedGPP(gpp ? gpp.toFixed(2) : null);
                updateRoomReading(reading.publicId, "standard", {
                  humidity: value,
                  gpp: gpp ? gpp.toFixed(2) : null,
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
              value={computedGPP || ""}
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
              reading.RoomReadingImage.filter((img: any) => img.type === "wall")
                .length > 0 && (
                <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
                  {reading.RoomReadingImage.filter(
                    (img: any) => img.type === "wall"
                  ).map((img: any, index: number) => (
                    <OptimizedImage
                      onPress={() => openImageViewer(index, "wall")}
                      uri={roomImages[img.imageKey]}
                      style={{ width: 80, height: 80, borderRadius: 6 }}
                      key={img.imageKey}
                    />
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
                <TouchableOpacity onPress={() => setShowFloorNameEdit(true)}>
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
                    <OptimizedImage
                      uri={roomImages[img.imageKey]}
                      style={{ width: 80, height: 80, borderRadius: 6 }}
                      key={img.imageKey}
                      onPress={() => openImageViewer(index, "floor")}
                    />
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
                rooms.addGenericRoomReading(room.id, reading.id, body.reading);
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
                <Plus color="#FFF" height={16} width={16} className="mr-1.5" />
              )}
              <Text className="text-white font-medium text-sm">
                {isAdding ? "Adding..." : "Add Dehumidifier Reading"}
              </Text>
            </View>
          </Button>
        </Stack>
      </FormControl>
    </Box>
  );
};

export default RoomReadingItem;
