import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react-native";
import { ReadingsWithGenericReadings } from "@/types/app";
import { getExtendedWallImages } from "../utils/imageHandling";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImageIndex: number | null;
  selectedImageType: "generic" | "floor" | "wall" | string | null;
  selectedGenericIndex: number | null;
  roomImages: { [key: string]: string };
  genericImages: { [key: string]: string };
  reading: ReadingsWithGenericReadings;
  onDeleteImage: (imageKey: string, type: 'wall' | 'floor' | 'generic' | string) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  isOpen,
  onClose,
  selectedImageIndex,
  selectedImageType,
  selectedGenericIndex,
  roomImages,
  genericImages,
  reading,
  onDeleteImage,
  onPrevImage,
  onNextImage,
}) => {
  // Filter wall and floor images
  const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
  const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");

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
                uri: selectedImageType === 'generic' 
                  ? genericImages[reading.GenericRoomReading.find(grr => 
                      grr.id === selectedGenericIndex
                    )?.GenericRoomReadingImage?.[selectedImageIndex]?.imageKey || '']
                  : selectedImageType === 'wall'
                  ? roomImages[wallImages?.[selectedImageIndex]?.imageKey || '']
                  : selectedImageType === 'floor'
                  ? roomImages[floorImages?.[selectedImageIndex]?.imageKey || '']
                  : roomImages[getExtendedWallImages(selectedImageType, reading.RoomReadingImage)
                      ?.[selectedImageIndex]?.imageKey || '']
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
            <View className="absolute top-12 right-4 flex-row gap-2 z-20">
              <Pressable 
                onPress={() => {
                  if (selectedImageIndex === null || !selectedImageType) return;
                  
                  if (selectedImageType === 'generic') {
                    const currentGenericReading = reading.GenericRoomReading?.find(genericReading => 
                      genericReading.id === selectedGenericIndex
                    );
                    if (currentGenericReading?.GenericRoomReadingImage?.[selectedImageIndex]) {
                      onDeleteImage(
                        currentGenericReading.GenericRoomReadingImage[selectedImageIndex].imageKey, 
                        'generic'
                      );
                    }
                  } else if (selectedImageType === 'wall' && wallImages?.[selectedImageIndex]) {
                    onDeleteImage(wallImages[selectedImageIndex].imageKey, 'wall');
                  } else if (selectedImageType === 'floor' && floorImages?.[selectedImageIndex]) {
                    onDeleteImage(floorImages[selectedImageIndex].imageKey, 'floor');
                  } else {
                    // Handle extended wall/floor images
                    const extendedImages = getExtendedWallImages(selectedImageType, reading.RoomReadingImage);
                    if (extendedImages && extendedImages.length > 0 && extendedImages[selectedImageIndex]) {
                      onDeleteImage(extendedImages[selectedImageIndex].imageKey, selectedImageType);
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
                {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {
                  selectedImageType === 'wall' ? wallImages?.length :
                  selectedImageType === 'floor' ? floorImages?.length :
                  selectedImageType === 'generic' && reading.GenericRoomReading ? reading.GenericRoomReading.find(genericReading => 
                    genericReading.id === selectedGenericIndex
                  )?.GenericRoomReadingImage?.length :
                  selectedImageType ? getExtendedWallImages(selectedImageType, reading.RoomReadingImage).length : 0
                }
              </Text>
            </View>
          </View>
        )}
      </DialogContent>
    </Dialog>
  );
}; 