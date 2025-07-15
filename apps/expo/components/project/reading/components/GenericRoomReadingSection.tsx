import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { HStack } from "native-base";
import { Box, FormControl, Heading, Stack } from "native-base";
import { Camera } from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const CameraComponent = Camera as any;
import { RoomReadingInput } from "./RoomReadingInput";
import { ReadingType } from "@/types/app";
import { OptimizedImage } from "@/lib/utils/imageModule";
import {
  GenericRoomReading,
  Room,
  RoomReading,
  useUpdateGenericRoomReading,
  calculateGPP,
} from "@service-geek/api-client";
import { useOfflineUpdateGenericRoomReading } from "@/lib/hooks/useOfflineReadings";
import { useOfflineGenericReadingsStore } from "@/lib/state/offline-generic-readings";

interface GenericRoomReadingProps {
  genericRoomReading: GenericRoomReading; // Generic room reading object
  index: number;
  pickImage: (
    type: "wall" | "generic",
    wallId: string,
    updateImages: (type: "generic" | "wall", id: string, images: any[]) => void
  ) => void;
  onImagePress: (index: number, id: string) => void;
  handleAddExtendedWall: (type: "WALL" | "FLOOR" | "CEILING") => void;
  roomReading: RoomReading;
}

export const GenericRoomReadingSection: React.FC<GenericRoomReadingProps> = ({
  genericRoomReading,
  index,
  pickImage,
  onImagePress,
  roomReading,
}) => {
  const { mutate: updateGenericRoomReading } =
    useOfflineUpdateGenericRoomReading();
  const { getEditForReading } = useOfflineGenericReadingsStore();

  // Get offline edit for this generic reading
  const offlineEdit = getEditForReading(genericRoomReading.id);

  // Merge online reading with offline edits
  const mergedGenericReading = {
    ...genericRoomReading,
    ...(offlineEdit && {
      value: offlineEdit.value ?? genericRoomReading.value,
      humidity: offlineEdit.humidity ?? genericRoomReading.humidity,
      temperature: offlineEdit.temperature ?? genericRoomReading.temperature,
      images: offlineEdit.images ?? genericRoomReading.images,
    }),
  };
  const onPickImage = async () => {
    await pickImage(
      "generic",
      mergedGenericReading.id,
      async (type, id, images) => {
        const updatedGenericRoomReading = mergedGenericReading;
        await updateGenericRoomReading({
          id: updatedGenericRoomReading.id,
          data: {
            images: [...(updatedGenericRoomReading.images || []), ...images],
          },
        });
      }
    );
  };
  return (
    <Box
      w="full"
      key={genericRoomReading.id}
      className="mb-3 bg-gray-50 rounded-lg py-2"
    >
      <Stack mx="2" className="gap-y-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Heading
              size="sm"
              mb="0.5"
              className="text-gray-700 font-semibold text-sm"
            >
              Dehumidifier Reading {index + 1}
            </Heading>
            <FormControl.Label className="text-gray-700 font-medium text-sm">
              Reading Value
            </FormControl.Label>
          </View>
          <TouchableOpacity onPress={onPickImage} className="p-0.5">
            <CameraComponent color="#1d4ed8" size={20} />
          </TouchableOpacity>
        </View>

        <View className="relative">
          <RoomReadingInput
            value={mergedGenericReading.value || ""}
            rightText="Each"
            placeholder="Enter dehumidifier reading"
            onChange={(value) =>
              updateGenericRoomReading({
                id: mergedGenericReading.id,
                data: {
                  value,
                },
              })
            }
          />
          {offlineEdit && (
            <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3" />
          )}
        </View>

        {mergedGenericReading.images &&
          mergedGenericReading.images.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
              {mergedGenericReading.images.map(
                (img: string, imgIndex: number) => (
                  <OptimizedImage
                    uri={img}
                    style={{ width: 80, height: 80, borderRadius: 6 }}
                    key={img}
                    onPress={() =>
                      onImagePress(imgIndex, mergedGenericReading.id)
                    }
                  />
                )
              )}
            </View>
          )}

        <HStack space={4} alignItems="flex-end">
          <View style={{ flex: 1 }}>
            <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
              Temperature
            </FormControl.Label>
            <View className="relative">
              <RoomReadingInput
                value={mergedGenericReading.temperature?.toString() || ""}
                rightText="°F"
                placeholder="Enter temperature"
                onChange={(temperature) => {
                  updateGenericRoomReading({
                    id: mergedGenericReading.id,
                    data: {
                      temperature: Number(temperature),
                    },
                  });
                }}
              />
              {offlineEdit && (
                <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3" />
              )}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
              Relative Humidity
            </FormControl.Label>
            <View className="relative">
              <RoomReadingInput
                value={mergedGenericReading.humidity?.toString() || ""}
                rightText="%"
                placeholder="Enter humidity"
                onChange={(humidity) => {
                  updateGenericRoomReading({
                    id: mergedGenericReading.id,
                    data: {
                      humidity: Number(humidity),
                    },
                  });
                }}
              />
              {offlineEdit && (
                <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3" />
              )}
            </View>
          </View>
        </HStack>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Grains Per Pound
          </FormControl.Label>
          <RoomReadingInput
            value={
              calculateGPP(
                mergedGenericReading.temperature,
                mergedGenericReading.humidity
              )?.toString() || ""
            }
            rightText="gpp"
            placeholder="Grains Per Pound"
            disabled
            onChange={() => {}}
          />
        </View>
      </Stack>
    </Box>
  );
};
