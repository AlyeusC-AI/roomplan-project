import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { Box, FormControl, Heading, Stack } from "native-base";
import { Camera } from "lucide-react-native";
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
  const { mutate: updateGenericRoomReading } = useUpdateGenericRoomReading();
  const onPickImage = async () => {
    await pickImage(
      "generic",
      genericRoomReading.id,
      async (type, id, images) => {
        const updatedGenericRoomReading = genericRoomReading;
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
      className="mb-3 bg-gray-50 rounded-lg p-3"
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
            <Camera color="#1d4ed8" size={20} />
          </TouchableOpacity>
        </View>

        <RoomReadingInput
          value={genericRoomReading.value || ""}
          rightText="Each"
          placeholder="Enter dehumidifier reading"
          onChange={(value) =>
            updateGenericRoomReading({
              id: genericRoomReading.id,
              data: {
                value,
              },
            })
          }
        />

        {genericRoomReading.images && genericRoomReading.images.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
            {genericRoomReading.images.map((img: string, imgIndex: number) => (
              <OptimizedImage
                uri={img}
                style={{ width: 80, height: 80, borderRadius: 6 }}
                key={img}
                onPress={() => onImagePress(imgIndex, genericRoomReading.id)}
              />
            ))}
          </View>
        )}

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Temperature
          </FormControl.Label>
          <RoomReadingInput
            value={genericRoomReading.temperature?.toString() || ""}
            rightText="°F"
            placeholder="Enter temperature"
            onChange={(temperature) => {
              updateGenericRoomReading({
                id: genericRoomReading.id,
                data: {
                  temperature: Number(temperature),
                },
              });
            }}
          />
        </View>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Relative Humidity
          </FormControl.Label>
          <RoomReadingInput
            value={genericRoomReading.humidity?.toString() || ""}
            rightText="%"
            placeholder="Enter humidity"
            onChange={(humidity) => {
              updateGenericRoomReading({
                id: genericRoomReading.id,
                data: {
                  humidity: Number(humidity),
                },
              });
            }}
          />
        </View>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Grains Per Pound
          </FormControl.Label>
          <RoomReadingInput
            value={
              calculateGPP(
                genericRoomReading.temperature,
                genericRoomReading.humidity
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
