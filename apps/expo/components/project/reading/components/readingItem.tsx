import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Heading, Modal, Stack } from "native-base";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const Trash2Component = Trash2 as any;
const PlusComponent = Plus as any;
import { v4 } from "react-native-uuid/dist/v4";
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { ExtendedWallItem, ReadingType } from "@/types/app";
import { toast } from "sonner-native";

// Import refactored components
import { RoomReadingInput } from "./RoomReadingInput";
import { ExtendedWallSection } from "./ExtendedWallSection";
import { GenericRoomReadingSection } from "./GenericRoomReadingSection";

import { OptimizedImage } from "@/lib/utils/OptimizedImage";
import {
  calculateGPP,
  Room,
  RoomReading,
  useCreateGenericRoomReading,
  useDeleteWall,
  useUpdateRoom,
  Wall,
  WallReading,
} from "@service-geek/api-client";
import {
  useOfflineUpdateRoomReading,
  useOfflineDeleteRoomReading,
} from "@/lib/hooks/useOfflineReadings";
import { useDebounce } from "@/utils/debounce";

const RoomReadingItem = ({
  room,
  reading,
  pickImage,
  openImageViewer,
  setWall,
  projectId,
}: {
  room: Room;
  reading: RoomReading;
  pickImage: (
    type: "wall" | "generic",
    wallId: string,
    updateImages: (type: "generic" | "wall", id: string, images: any[]) => void
  ) => void;
  openImageViewer: (
    index: number,
    type: "generic" | "floor" | "wall" | string,
    genericId?: string
  ) => void;
  setWall: (wall: Partial<Wall>) => void;
  projectId?: string;
}) => {
  const { mutate: updateRoomReading } = useOfflineUpdateRoomReading(projectId);
  const { mutate: deleteWall } = useDeleteWall();
  const { mutate: deleteRoomReading, isPending: isDeleting } =
    useOfflineDeleteRoomReading(projectId);
  const { mutate: addGenericRoomReading, isPending: isAdding } =
    useCreateGenericRoomReading();
  const [tempRoomReading, setTempRoomReading] = useState<RoomReading>(reading);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  console.log("🚀 ~ tempRoomReading:", tempRoomReading.humidity);
  useEffect(() => {
    setTempRoomReading(reading);
  }, [reading]);

  const debouncedRoomReading = useDebounce(tempRoomReading, 1000);
  // console.log("🚀 ~ debouncedRoomReading:", debouncedRoomReading);

  const save = async () => {
    await updateRoomReading({
      id: reading.id,
      data: {
        date: debouncedRoomReading.date,
        temperature: debouncedRoomReading.temperature,
        humidity: debouncedRoomReading.humidity,
        // wallReadings: debouncedRoomReading.wallReadings,
      },
    });
  };
  useEffect(() => {
    const now = Date.now();
    // Only update if we're not already updating and enough time has passed since last update
    if (!isUpdating && now - lastUpdateTime > 1000) {
      setIsUpdating(true);
      updateRoomReading({
        id: reading.id,
        data: {
          date: debouncedRoomReading.date,
          temperature: debouncedRoomReading.temperature,
          humidity: debouncedRoomReading.humidity,
          // wallReadings: debouncedRoomReading.wallReadings,
        },
      })
        .then(() => {
          setIsUpdating(false);
          setLastUpdateTime(Date.now());
        })
        .catch(() => {
          setIsUpdating(false);
        });
    }
  }, [
    debouncedRoomReading.humidity,
    debouncedRoomReading.temperature,
    // debouncedRoomReading.wallReadings,
    debouncedRoomReading.date,
  ]);

  const walls = room.walls?.filter((w) => w.type === "WALL");
  const floors = room.walls?.filter((w) => w.type === "FLOOR");

  // Handlers for extended walls/floors
  const handleAddExtendedWall = (type: "WALL" | "FLOOR" | "CEILING") => {
    setWall({
      name:
        type === "WALL"
          ? `Wall ${walls.length + 1}`
          : `Floor ${floors.length + 1}`,
      type,
      roomId: room.id,
    });
  };

  const handleEditExtendedWall = (wall: Wall) => {
    setWall(wall);
    // const isWallReading = tempRoomReading.wallReadings?.find(
    //   (w) => w.id === wallReading.id
    // );

    // setTempRoomReading({
    //   ...tempRoomReading,
    //   //@ts-ignore
    //   wallReadings: isWallReading
    //     ? tempRoomReading.wallReadings?.map((w) =>
    //         w.id === wallReading.id
    //           ? {
    //               ...w,
    //               images: {
    //                 ...w.images,
    //                 ...wallReading.images,
    //               },
    //             }
    //           : w
    //       )
    //     : [...(tempRoomReading.wallReadings || []), wallReading],
    // });
  };

  const deleteReading = async (readingId: string) => {
    try {
      await deleteRoomReading(readingId);
    } catch (error) {
      console.log("🚀 ~ deleteReading ~ error:", error);
      // toast.error("Could not delete reading");
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
          onPress: async () => deleteReading(reading.id),
        },
      ]
    );
  };

  return (
    <Pressable onPress={() => {}} style={{ flex: 1 }}>
      <Box
        key={reading.id}
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
              <Trash2Component
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

        {/* Main Form */}
        <FormControl>
          <Stack mx="2" className="gap-y-2">
            {/* Temperature Input */}
            <View>
              <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                Temperature
              </FormControl.Label>
              <RoomReadingInput
                value={tempRoomReading.temperature?.toString() || ""}
                placeholder="Temperature"
                rightText="°F"
                onChange={(value) => {
                  setTempRoomReading((prev) => ({
                    ...prev,
                    temperature: Number(value),
                  }));
                }}
              />
            </View>

            {/* Relative Humidity Input */}
            <View>
              <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                Relative Humidity
              </FormControl.Label>
              <RoomReadingInput
                value={tempRoomReading.humidity?.toString() || ""}
                placeholder="Relative Humidity"
                rightText="%"
                onChange={(value) => {
                  setTempRoomReading((prev) => ({
                    ...prev,
                    humidity: Number(value),
                  }));
                }}
              />
            </View>

            {/* Grains Per Pound Input */}
            <View>
              <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
                Grains Per Pound
              </FormControl.Label>
              <RoomReadingInput
                value={
                  calculateGPP(
                    tempRoomReading.temperature,
                    tempRoomReading.humidity
                  )?.toString() || ""
                }
                placeholder="Grains Per Pound"
                rightText="gpp"
                disabled
                onChange={() => {}}
              />
            </View>

            <View className="gap-y-2">
              {/* Extended Walls Section */}
              {walls.map((wall) => (
                <ExtendedWallSection
                  key={wall.id}
                  wall={wall}
                  roomReading={tempRoomReading}
                  wallReading={tempRoomReading.wallReadings?.find(
                    (w) => w.wallId === wall.id
                  )}
                  onEdit={handleEditExtendedWall}
                  pickImage={pickImage}
                  handleAddExtendedWall={handleAddExtendedWall}
                  onImagePress={(index, id) => openImageViewer(index, id)}
                />
              ))}
            </View>
            <View className="gap-y-2">
              {/* Extended Floors Section */}
              {floors.map((floor) => (
                <ExtendedWallSection
                  key={floor.id}
                  wall={floor}
                  roomReading={tempRoomReading}
                  wallReading={tempRoomReading.wallReadings?.find(
                    (w) => w.wallId === floor.id
                  )}
                  onEdit={handleEditExtendedWall}
                  handleAddExtendedWall={handleAddExtendedWall}
                  pickImage={pickImage}
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
            {reading.genericRoomReading?.map((grr: any, index: number) => (
              <GenericRoomReadingSection
                key={grr.id}
                genericRoomReading={grr}
                pickImage={pickImage}
                index={index}
                handleAddExtendedWall={handleAddExtendedWall}
                roomReading={tempRoomReading}
                onImagePress={(imgIndex, genericId) =>
                  openImageViewer(imgIndex, "generic", genericId)
                }
              />
            ))}

            {/* Empty state for generic readings */}
            {reading.genericRoomReading?.length === 0 && (
              <View className="flex items-center justify-center py-4">
                <Text className="text-gray-400 font-medium text-sm">
                  No dehumidifier readings yet
                </Text>
              </View>
            )}

            {/* Add Dehumidifier Reading Button */}
            <Button
              onPress={async () => {
                try {
                  await addGenericRoomReading({
                    roomReadingId: reading.id,
                    value: "",
                    humidity: 0,
                    temperature: 0,
                    images: [],
                  });
                } catch (err) {
                  console.error("Failed to add dehumidifer reading:", err);
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
                  <PlusComponent
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
    </Pressable>
  );
};

export default RoomReadingItem;
