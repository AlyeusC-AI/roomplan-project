import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react-native";
import { RoomReading, Room } from "@service-geek/api-client";
interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImageIndex: number | null;
  selectedImageType: "generic" | "floor" | "wall" | string | null;
  selectedGenericIndex: string | null;
  roomImages: { [key: string]: string };
  genericImages: { [key: string]: string };
  reading: RoomReading;
  onDeleteImage: (
    imageKey: string,
    type: "wall" | "floor" | "generic" | string
  ) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  room: Room;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  selectedImageIndex,
  selectedImageType,
  selectedGenericIndex,

  reading,
  onDeleteImage,
  onPrevImage,
  onNextImage,
  room,
}) => {
  const wallImages = reading.wallReadings?.find(
    (reading) => reading.id === selectedImageType
  )?.images;
  console.log("🚀 ~ asasaswallImages:", selectedImageType, wallImages);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="p-0 bg-black w-screen h-screen">
        {selectedImageIndex !== null && selectedImageType && (
          <View className="flex-1 relative">
            <Image
              source={{
                uri:
                  selectedImageType === "generic"
                    ? reading.genericRoomReading?.find(
                        (grr) => grr.id === selectedGenericIndex
                      )?.images?.[selectedImageIndex]
                    : wallImages?.[selectedImageIndex],
              }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
            <View className="absolute top-12 right-4 flex-row gap-2 z-20">
              <Pressable
                onPress={() => {
                  if (selectedImageIndex === null || !selectedImageType) return;

                  if (selectedImageType === "generic") {
                    const currentGenericReading =
                      reading.genericRoomReading?.find(
                        (genericReading) =>
                          genericReading.id === selectedGenericIndex
                      );
                    if (currentGenericReading?.images?.[selectedImageIndex]) {
                      onDeleteImage(
                        currentGenericReading.images[selectedImageIndex],
                        "generic"
                      );
                    }
                  } else {
                    // Handle extended wall/floor images
                    const extendedImages = reading.wallReadings?.find(
                      (reading) => reading.id === selectedImageType
                    )?.images;
                    if (
                      extendedImages &&
                      extendedImages.length > 0 &&
                      extendedImages[selectedImageIndex]
                    ) {
                      onDeleteImage(
                        extendedImages[selectedImageIndex],
                        selectedImageType
                      );
                    }
                  }
                }}
                className="bg-black/50 rounded-full p-2"
              >
                <Trash2 color="white" size={24} />
              </Pressable>
              <Pressable
                onPress={onClose}
                className="bg-black/50 rounded-full p-2"
              >
                <X color="white" size={24} />
              </Pressable>
            </View>
            {/* Carousel navigation controls */}
            <View className="absolute inset-y-0 flex-row justify-between items-center px-4 w-full z-10">
              <Pressable
                onPress={onPrevImage}
                className="bg-black/50 rounded-full p-2"
              >
                <ChevronLeft color="white" size={24} />
              </Pressable>
              <Pressable
                onPress={onNextImage}
                className="bg-black/50 rounded-full p-2"
              >
                <ChevronRight color="white" size={24} />
              </Pressable>
            </View>
            <View className="absolute bottom-4 w-full flex-row justify-center z-10">
              <Text className="text-white text-sm">
                {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} /{" "}
                {selectedImageType === "generic" && reading.genericRoomReading
                  ? reading.genericRoomReading.find(
                      (genericReading) =>
                        genericReading.id === selectedGenericIndex
                    )?.images?.length
                  : selectedImageType
                    ? reading.wallReadings?.find(
                        (reading) => reading.id === selectedImageType
                      )?.images?.length
                    : 0}
              </Text>
            </View>
          </View>
        )}
      </DialogContent>
    </Dialog>
  );
};
