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

// Type assertions to fix ReactNode compatibility
const PlusComponent = Plus as any;
const CameraComponent = Camera as any;
const Trash2Component = Trash2 as any;
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
import {
  useOfflineCreateWallReading,
  useOfflineUpdateWallReading,
} from "@/lib/hooks/useOfflineReadings";
import { useOfflineWallReadingsStore } from "@/lib/state/offline-wall-readings";

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
    useOfflineUpdateWallReading();
  const { mutate: addWallReading, isPending: isAdding } =
    useOfflineCreateWallReading();
  const { mutate: deleteWallReading, isPending: isDeleting } = useDeleteWall();
  const { getEditsForWall, getNewReadingsForWall } =
    useOfflineWallReadingsStore();

  // Get offline edit for this wall reading
  const offlineEdits = wallReading
    ? getEditsForWall(wallReading.id || wall.id)
    : getNewReadingsForWall(wall.id);
  const offlineEdit = offlineEdits.find(
    (edit) => edit.roomReadingId === roomReading.id
  );
  console.log("🚀 ~ offlineEditsssss:", wallReading, offlineEdit);

  // Merge online reading with offline edits
  const mergedWallReading = offlineEdit
    ? {
        ...(wallReading || {}),
        ...(offlineEdit && {
          reading: offlineEdit.reading ?? wallReading?.reading,
          images: offlineEdit.images ?? wallReading?.images,
        }),
      }
    : null;
  console.log("🚀 ~ mergedWallReading:", mergedWallReading);

  const isLoading = isUpdating || isAdding;

  const onChange = async (value: string) => {
    if (mergedWallReading?.id) {
      await updateWallReading({
        id: mergedWallReading.id,
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
      const updatedWall = mergedWallReading;
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

  const images = mergedWallReading?.images || [];
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
            <PlusComponent color="#1d4ed8" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            onPress={() => onPickImage()}
            className="p-0.5 mr-2"
            disabled={isLoading}
          >
            <CameraComponent color="#1d4ed8" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete} disabled={isLoading}>
            <Trash2Component color="#dc2626" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="relative">
        <RoomReadingInput
          value={mergedWallReading?.reading.toString() || ""}
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
        {offlineEdit && (
          <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-3 h-3" />
        )}
      </View>

      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-1 mb-1">
          {images.map((img, index) => (
            <OptimizedImage
              uri={img}
              style={{ width: 80, height: 80, borderRadius: 6 }}
              onPress={() =>
                onImagePress(index, mergedWallReading?.id || "", wall.id)
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};
