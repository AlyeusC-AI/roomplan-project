import React from "react";
import { View, Text, TouchableOpacity, Alert, Pressable, Image } from "react-native";
import { ExtendedWallItem } from "@/types/app";
import { Camera, Trash2 } from "lucide-react-native";
import { RoomReadingInput } from "./RoomReadingInput";

interface ExtendedWallSectionProps {
  wall: ExtendedWallItem;
  onEdit: (wall: ExtendedWallItem) => void;
  onDelete: (id: string) => void;
  onPickImage: (id: string) => void;
  onValueChange: (id: string, value: string) => void;
  images: { key: string; uri: string }[];
  onImagePress: (index: number, id: string) => void;
}

export const ExtendedWallSection: React.FC<ExtendedWallSectionProps> = ({
  wall,
  onEdit,
  onDelete,
  onPickImage,
  onValueChange,
  images,
  onImagePress,
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
          onPress: () => onDelete(wall.id)
        }
      ]
    );
  };

  return (
    <View key={wall.id} className="mt-2">
      <View className="flex-row items-center justify-between mb-0.5">
        <TouchableOpacity onPress={() => onEdit(wall)}>
          <Text className="text-gray-600 font-medium text-sm">{wall.name}</Text>
        </TouchableOpacity>
        <View className="flex-row">
          <TouchableOpacity onPress={() => onPickImage(wall.id)} className="p-0.5 mr-2">
            <Camera color="#1d4ed8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Trash2 color="#dc2626" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <RoomReadingInput
        value={wall.value || ""}
        placeholder="Enter moisture content percentage"
        rightText="%"
        onChange={(value) => onValueChange(wall.id, value)}
      />
      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
          {images.map((img, index) => (
            <Pressable 
              key={img.key}
              onPress={() => onImagePress(index, wall.id)}
            >
              <Image
                source={{ uri: img.uri }}
                style={{ width: 80, height: 80, borderRadius: 6 }}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}; 