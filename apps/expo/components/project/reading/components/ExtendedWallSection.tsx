import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  Image,
} from "react-native";
import { ExtendedWallItem } from "@/types/app";
import { Camera, Plus, Trash2 } from "lucide-react-native";
import { RoomReadingInput } from "./RoomReadingInput";
import { OptimizedImage } from "@/lib/utils/OptimizedImage";
import { WallReading, Wall } from "@service-geek/api-client";

interface ExtendedWallSectionProps {
  wallReading?: WallReading;
  wall: Wall;
  onEdit: (wall: Wall) => void;
  onDelete: (id: string) => void;
  onPickImage: (id: string) => void;
  onValueChange: (id: string, value: string, wallId: string) => void;
  onImagePress: (index: number, id: string, wallId: string) => void;
  handleAddExtendedWall: (type: "WALL" | "FLOOR" | "CEILING") => void;
}

export const ExtendedWallSection: React.FC<ExtendedWallSectionProps> = ({
  wallReading,
  wall,
  onEdit,
  onDelete,
  onPickImage,
  onValueChange,

  onImagePress,
  handleAddExtendedWall,
}) => {
  const confirmDelete = () => {
    Alert.alert(
      "Delete Measurement",
      "Are you sure you want to delete this measurement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(wall.id),
        },
      ]
    );
  };
  // useEffect(() => {
  //   if (!wallReading) {
  //     onEdit({
  //       reading: 0,
  //       images: [],
  //       wallId: wall.id,
  //     });
  //   }
  // }, [wallReading]);

  const images = wallReading?.images || [];
  console.log("🚀 ~ images:", images);

  return (
    <View key={wall.id} className="mt-2">
      <View className="flex-row items-center justify-between mb-0.5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => onEdit(wall || {})}>
            <Text className="text-gray-600 font-medium text-sm">
              {wall.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleAddExtendedWall(wall.type)}
            className="ml-2"
          >
            <Plus color="#1d4ed8" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => onPickImage(wallReading?.id || "")}
            className="p-0.5 mr-2"
          >
            <Camera color="#1d4ed8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Trash2 color="#dc2626" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <RoomReadingInput
        value={wallReading?.reading.toString() || ""}
        placeholder="Enter moisture content percentage"
        rightText="%"
        onChange={(value) =>
          onValueChange(wallReading?.id || "", value, wall.id)
        }
      />
      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
          {images.map((img, index) => (
            <Pressable
              key={img}
              onPress={() =>
                onImagePress(index, wallReading?.id || "", wall.id)
              }
            >
              <OptimizedImage
                uri={img}
                style={{ width: 80, height: 80, borderRadius: 6 }}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
