import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { ExtendedWallItem } from "@/types/app";
import { Camera, Plus, Trash2 } from "lucide-react-native";
import { RoomReadingInput } from "./RoomReadingInput";
import { OptimizedImage } from "@/lib/utils/OptimizedImage";
import {
  WallReading,
  Wall,
  useUpdateWallReading,
  useDeleteWall,
  useCreateWallReading,
  RoomReading,
} from "@service-geek/api-client";

interface ExtendedWallSectionProps {
  wallReading?: WallReading;
  wall: Wall;
  onEdit: (wall: Wall) => void;
  pickImage: (
    type: "wall" | "generic",
    wallId: string,
    updateImages: (type: "generic" | "wall", id: string, images: any[]) => void
  ) => void;
  onImagePress: (index: number, id: string, wallId: string) => void;
  handleAddExtendedWall: (type: "WALL" | "FLOOR" | "CEILING") => void;
  roomReading: RoomReading;
}

export const ExtendedWallSection: React.FC<ExtendedWallSectionProps> = ({
  wallReading,
  wall,
  onEdit,
  pickImage,
  onImagePress,
  handleAddExtendedWall,
  roomReading,
}) => {
  const { mutate: updateWallReading, isPending: isUpdating } =
    useUpdateWallReading();
  const { mutate: addWallReading, isPending: isAdding } =
    useCreateWallReading();
  const { mutate: deleteWallReading, isPending: isDeleting } = useDeleteWall();

  const isLoading = isUpdating || isAdding;

  const onChange = async (value: string) => {
    if (wallReading) {
      await updateWallReading({
        id: wallReading.id,
        data: {
          reading: Number(value),
        },
      });
    } else {
      await addWallReading({
        reading: Number(value),
        wallId: wall.id,
        images: [],
        roomReadingId: roomReading?.id,
      });
    }
  };
  const confirmDelete = () => {
    Alert.alert(
      "Delete Measurement",
      "Are you sure you want to delete this measurement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWallReading(wall?.id || ""),
        },
      ]
    );
  };
  const onPickImage = async () => {
    await pickImage("wall", wall.id, async (type, id, images) => {
      const updatedWall = wallReading;
      if (updatedWall) {
        await updateWallReading({
          id: updatedWall.id,
          data: {
            images: [...(updatedWall.images || []), ...images],
          },
        });
      } else {
        await addWallReading({
          reading: 0,
          images: images,
          wallId: wall.id,
          roomReadingId: roomReading?.id,
        });
      }
    });
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
  console.log("🚀 ~ imagasadasdasdes:", images);

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
            onPress={() => onPickImage()}
            className="p-0.5 mr-2"
            disabled={isLoading}
          >
            <Camera color="#1d4ed8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} disabled={isLoading}>
            <Trash2 color="#dc2626" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="relative">
        <RoomReadingInput
          value={wallReading?.reading.toString() || ""}
          placeholder="Enter moisture content percentage"
          rightText="%"
          onChange={(value) => onChange(value)}
          disabled={isLoading}
        />
        {isLoading && (
          <View className="absolute right-2 top-1/2 -translate-y-1/2">
            <ActivityIndicator size="small" color="#1d4ed8" />
          </View>
        )}
      </View>

      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
          {images.map((img, index) => (
            <OptimizedImage
              uri={img}
              style={{ width: 80, height: 80, borderRadius: 6 }}
              onPress={() =>
                onImagePress(index, wallReading?.id || "", wall.id)
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};
