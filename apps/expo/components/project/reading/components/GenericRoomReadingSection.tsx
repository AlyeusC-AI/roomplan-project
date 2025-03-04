import React from "react";
import { View, Text, TouchableOpacity, Pressable, Image } from "react-native";
import { Box, FormControl, Heading, Stack } from "native-base";
import { Camera } from "lucide-react-native";
import { RoomReadingInput } from "./RoomReadingInput";
import { ReadingType } from "@/types/app";

interface GenericRoomReadingProps {
  index: number;
  reading: any; // Generic room reading object
  onUpdateReading: (
    readingId: string,
    type: ReadingType,
    data: any
  ) => Promise<void>;
  onPickImage: (genericReadingId: number) => void;
  genericImages: { [key: string]: string };
  onImagePress: (index: number, genericId: number) => void;
}

export const GenericRoomReadingSection: React.FC<GenericRoomReadingProps> = ({
  index,
  reading,
  onUpdateReading,
  onPickImage,
  genericImages,
  onImagePress,
}) => {
  return (
    <Box w="full" key={reading.publicId} className="mb-3 bg-gray-50 rounded-lg p-3">
      <Stack mx="2" className="gap-y-2">
        <View className="flex-row justify-between items-center">
          <View>
            <Heading size="sm" mb="0.5" className="text-gray-700 font-semibold text-sm">
              Dehumidifier Reading {index + 1}
            </Heading>
            <FormControl.Label className="text-gray-700 font-medium text-sm">
              Reading Value
            </FormControl.Label>
          </View>
          <TouchableOpacity 
            onPress={() => onPickImage(reading.id)} 
            className="p-0.5"
          >
            <Camera color="#1d4ed8" size={20} />
          </TouchableOpacity>
        </View>

        <RoomReadingInput
          value={reading.value || ""}
          rightText="Each"
          placeholder="Enter dehumidifier reading"
          onChange={(value) =>
            onUpdateReading(reading.publicId, "generic", {
              value,
            })
          }
        />
        
        {reading.GenericRoomReadingImage && reading.GenericRoomReadingImage.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
            {reading.GenericRoomReadingImage.map((img: any, imgIndex: number) => (
              <Pressable 
                key={img.imageKey}
                onPress={() => onImagePress(imgIndex, reading.id)}
              >
                <Image
                  source={{ uri: genericImages[img.imageKey] }}
                  style={{ width: 80, height: 80, borderRadius: 6 }}
                />
              </Pressable>
            ))}
          </View>
        )}

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Temperature
          </FormControl.Label>
          <RoomReadingInput
            value={reading.temperature || ""}
            rightText="°F"
            placeholder="Enter temperature"
            onChange={(temperature) =>
              onUpdateReading(reading.publicId, "generic", {
                temperature,
              })
            }
          />
        </View>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Relative Humidity
          </FormControl.Label>
          <RoomReadingInput
            value={reading.humidity || ""}
            rightText="RH"
            placeholder="Enter humidity"
            onChange={(relativeHumidity) =>
              onUpdateReading(reading.publicId, "generic", {
                humidity: relativeHumidity,
              })
            }
          />
        </View>
      </Stack>
    </Box>
  );
}; 