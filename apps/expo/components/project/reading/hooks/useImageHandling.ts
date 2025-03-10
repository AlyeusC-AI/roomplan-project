import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import { ReadingsWithGenericReadings } from "@/types/app";
import { 
  captureImageWithCamera, 
  pickImageFromGallery, 
  processAndUploadImage, 
  showImagePickerOptions, 
  confirmImageDeletion, 
  deleteImage,
  getExtendedWallImages
} from "../utils/imageHandling";

export function useImageHandling(
  reading: ReadingsWithGenericReadings,
  fetchRooms: () => Promise<void>
) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<"generic" | "floor" | "wall" | string | null>(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<number | null>(null);

  // Handle image navigation
  const handlePrevImage = () => {
    if (selectedImageIndex === null || !selectedImageType) return;
    
    const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
    const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");
    
    if (selectedImageType === 'wall' && wallImages) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? wallImages.length - 1 : selectedImageIndex - 1
      );
    } else if (selectedImageType === 'floor' && floorImages) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? floorImages.length - 1 : selectedImageIndex - 1
      );
    } else if (selectedImageType === 'generic') {
      const currentGenericReading = reading.GenericRoomReading?.find(grr => 
        grr.GenericRoomReadingImage?.[selectedImageIndex]
      );
      if (currentGenericReading?.GenericRoomReadingImage) {
        setSelectedImageIndex(
          selectedImageIndex === 0 
            ? currentGenericReading.GenericRoomReadingImage.length - 1 
            : selectedImageIndex - 1
        );
      }
    } else {
      // For extended walls/floors
      const extendedImages = getExtendedWallImages(selectedImageType, reading.RoomReadingImage);
      if (extendedImages && extendedImages.length > 0) {
        setSelectedImageIndex(
          selectedImageIndex === 0 ? extendedImages.length - 1 : selectedImageIndex - 1
        );
      }
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null || !selectedImageType) return;
    
    const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
    const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");
    
    if (selectedImageType === 'wall' && wallImages) {
      setSelectedImageIndex(
        selectedImageIndex === wallImages.length - 1 ? 0 : selectedImageIndex + 1
      );
    } else if (selectedImageType === 'floor' && floorImages) {
      setSelectedImageIndex(
        selectedImageIndex === floorImages.length - 1 ? 0 : selectedImageIndex + 1
      );
    } else if (selectedImageType === 'generic') {
      const currentGenericReading = reading.GenericRoomReading?.find(grr => 
        grr.GenericRoomReadingImage?.[selectedImageIndex]
      );
      if (currentGenericReading?.GenericRoomReadingImage) {
        setSelectedImageIndex(
          selectedImageIndex === currentGenericReading.GenericRoomReadingImage.length - 1 
            ? 0 
            : selectedImageIndex + 1
        );
      }
    } else {
      // For extended walls/floors
      const extendedImages = getExtendedWallImages(selectedImageType, reading.RoomReadingImage);
      if (extendedImages && extendedImages.length > 0) {
        setSelectedImageIndex(
          selectedImageIndex === extendedImages.length - 1 ? 0 : selectedImageIndex + 1
        );
      }
    }
  };

  const handleDeleteImage = (imageKey: string, type: 'wall' | 'floor' | 'generic' | string) => {
    confirmImageDeletion(imageKey, type, async () => {
      const success = await deleteImage(imageKey, type);
      
      if (success) {
        // Refresh data
        await fetchRooms();
        
        // Update modal state
        if (selectedImageIndex !== null) {
          const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
          const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");
          
          if (type === 'wall' && wallImages) {
            if (wallImages.length <= 1) {
              setSelectedImageIndex(null);
              setSelectedImageType(null);
            } else {
              setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            }
          } else if (type === 'floor' && floorImages) {
            if (floorImages.length <= 1) {
              setSelectedImageIndex(null);
              setSelectedImageType(null);
            } else {
              setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            }
          } else if (type === 'generic') {
            const currentGenericReading = reading.GenericRoomReading?.find(grr => 
              grr.GenericRoomReadingImage?.[selectedImageIndex]
            );
            if (currentGenericReading?.GenericRoomReadingImage) {
              if (currentGenericReading.GenericRoomReadingImage.length <= 1) {
                setSelectedImageIndex(null);
                setSelectedImageType(null);
              } else {
                setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
              }
            }
          } else if (selectedImageType && selectedImageType !== 'wall' && selectedImageType !== 'floor' && selectedImageType !== 'generic') {
            // For extended walls/floors - need to guard against undefined
            const extendedImages = getExtendedWallImages(selectedImageType, reading.RoomReadingImage);
            if (extendedImages && extendedImages.length > 0) {
              if (extendedImages.length <= 1) {
                setSelectedImageIndex(null);
                setSelectedImageType(null);
              } else {
                setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
              }
            }
          }
        }
      }
    });
  };

  const pickImage = (type: 'room' | 'generic', genericReadingId?: number, roomType?: "floor" | "wall" | string) => {
    const captureWithCamera = () => {
      captureImageWithCamera((photo) => {
        handleImageSelected(photo, type, genericReadingId, roomType);
      });
    };

    const pickFromGallery = () => {
      pickImageFromGallery((photo) => {
        handleImageSelected(photo, type, genericReadingId, roomType);
      });
    };

    showImagePickerOptions(captureWithCamera, pickFromGallery);
  };

  const handleImageSelected = async (
    photo: ImagePicker.ImagePickerAsset,
    type: 'room' | 'generic',
    genericReadingId?: number,
    roomType?: "floor" | "wall" | string
  ) => {
    try {
      await processAndUploadImage(
        photo, 
        reading, 
        type, 
        genericReadingId, 
        roomType,
        async () => {
          // Refresh data
          await fetchRooms();
        }
      );
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    }
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
    setSelectedImageType(null);
    setSelectedGenericIndex(null);
  };

  const openImageViewer = (index: number, type: "generic" | "floor" | "wall" | string, genericId?: number) => {
    setSelectedImageIndex(index);
    setSelectedImageType(type);
    if (genericId) {
      setSelectedGenericIndex(genericId);
    }
  };

  return {
    selectedImageIndex,
    selectedImageType,
    selectedGenericIndex,
    handlePrevImage,
    handleNextImage,
    handleDeleteImage,
    pickImage,
    closeImageViewer,
    openImageViewer
  };
} 