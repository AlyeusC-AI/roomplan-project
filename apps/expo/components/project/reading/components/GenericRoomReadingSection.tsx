import React, { useEffect, useState } from "react";
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
  const [gpp, setGpp] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<string | null>(null);
  const [humidity, setHumidity] = useState<string | null>(null);
  const calculateGPP = (
    temperature: string | null,
    humidity: string | null
  ) => {
    console.log("🚀 ~ temperature:");
    console.log("🚀 ~ humidity:", humidity, temperature);
    if (!temperature || !humidity) return null;
    const temp = Number(temperature);
    const hum = Number(humidity);
    if (isNaN(temp) || isNaN(hum)) return null;
    const gpp = (hum / 100) * 7000 * (1 / 7000 + (2 / 7000) * (temp - 32));
    setGpp(gpp);
    console.log("🚀 ~ gpp:", gpp);

    return gpp;
  };

  // Calculate initial gpp
  useEffect(() => {
    setTemperature(reading.temperature);
    setHumidity(reading.humidity);
    const initialGPP = calculateGPP(reading.temperature, reading.humidity);
    if (initialGPP !== null) {
      onUpdateReading(reading.publicId, "generic", {
        gpp: initialGPP.toFixed(2),
      });
    }
  }, [reading]);

  useEffect(() => {
    const gpp = calculateGPP(temperature, humidity);
    if (gpp !== null) {
      console.log("🚀 ~ gpp:", gpp);
      onUpdateReading(reading.publicId, "generic", {
        gpp: gpp.toFixed(2),
      });
    }
  }, [temperature, humidity]);

  return (
    <Box
      w="full"
      key={reading.publicId}
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

        {reading.GenericRoomReadingImage &&
          reading.GenericRoomReadingImage.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
              {reading.GenericRoomReadingImage.map(
                (img: any, imgIndex: number) => (
                  <Pressable
                    key={img.imageKey}
                    onPress={() => onImagePress(imgIndex, reading.id)}
                  >
                    <Image
                      source={{ uri: genericImages[img.imageKey] }}
                      style={{ width: 80, height: 80, borderRadius: 6 }}
                    />
                  </Pressable>
                )
              )}
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
            onChange={(temperature) => {
              console.log("🚀 ~ temperaturaaaae:", temperature, reading);
              // const gpp = calculateGPP(temperature, reading.humidity);
              setTemperature(temperature);
              onUpdateReading(reading.publicId, "generic", {
                temperature,
                gpp: gpp ? gpp.toFixed(2) : null,
              });
            }}
          />
        </View>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Relative Humidity
          </FormControl.Label>
          <RoomReadingInput
            value={reading.humidity || ""}
            rightText="%"
            placeholder="Enter humidity"
            onChange={(humidity) => {
              // const gpp = calculateGPP(reading.temperature, humidity);
              setHumidity(humidity);
              onUpdateReading(reading.publicId, "generic", {
                humidity,
                gpp: gpp ? gpp.toFixed(2) : null,
              });
            }}
          />
        </View>

        <View>
          <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">
            Grains Per Pound
          </FormControl.Label>
          <RoomReadingInput
            value={gpp ? gpp.toFixed(2) : ""}
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
