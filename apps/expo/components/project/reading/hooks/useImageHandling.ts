import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { toast } from "sonner-native";
import {
  captureImageWithCamera,
  pickImageFromGallery,
  showImagePickerOptions,
  confirmImageDeletion,
} from "../utils/imageHandling";
import {
  RoomReading,
  useUpdateGenericRoomReading,
} from "@service-geek/api-client";
import { uploadImage } from "@/lib/imagekit";
import {
  useUpdateRoomReading,
  useUpdateWallReading,
} from "@service-geek/api-client";
export function useImageHandling(reading: RoomReading) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [selectedImageType, setSelectedImageType] = useState<
    "generic" | string | null
  >(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<
    string | null
  >(null);
  const { mutate: updateRoomReading } = useUpdateRoomReading();
  const { mutate: updateWallReading } = useUpdateWallReading();
  const { mutate: updateGenericReading } = useUpdateGenericRoomReading();

  // Handle image navigation
  const handlePrevImage = () => {
    if (selectedImageIndex === null || !selectedImageType) return;
    else if (selectedImageType === "generic") {
      const currentGenericReading = reading.genericRoomReading?.find(
        (grr) => grr.images?.[selectedImageIndex]
      );
      if (currentGenericReading?.images) {
        setSelectedImageIndex(
          selectedImageIndex === 0
            ? currentGenericReading.images.length - 1
            : selectedImageIndex - 1
        );
      }
    } else {
      // For extended walls/floors
      const extendedImages = reading.wallReadings?.find(
        (wa) => wa.id === selectedImageType
      )?.images;
      if (extendedImages && extendedImages.length > 0) {
        setSelectedImageIndex(
          selectedImageIndex === 0
            ? extendedImages.length - 1
            : selectedImageIndex - 1
        );
      }
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null || !selectedImageType) return;

    if (selectedImageType === "generic") {
      const currentGenericReading = reading.genericRoomReading?.find(
        (grr) => grr.images?.[selectedImageIndex]
      );
      if (currentGenericReading?.images) {
        setSelectedImageIndex(
          selectedImageIndex === currentGenericReading.images.length - 1
            ? 0
            : selectedImageIndex + 1
        );
      }
    } else {
      // For extended walls/floors
      const extendedImages = reading.wallReadings?.find(
        (wa) => wa.id === selectedImageType
      )?.images;
      if (extendedImages && extendedImages.length > 0) {
        setSelectedImageIndex(
          selectedImageIndex === extendedImages.length - 1
            ? 0
            : selectedImageIndex + 1
        );
      }
    }
  };

  const handleDeleteImage = (type: "generic" | string) => {
    confirmImageDeletion(async () => {
      if (type === "generic") {
        const currentGenericReading = reading.genericRoomReading?.find(
          (grr) => grr.images?.[selectedImageIndex || 0]
        );
        if (currentGenericReading?.images) {
          currentGenericReading.images.splice(selectedImageIndex || 0, 1);
        }
        updateGenericReading({
          id: currentGenericReading?.id || "",
          data: {
            images: currentGenericReading?.images || [],
          },
        });
      } else {
        const currentWallReading = reading.wallReadings?.find(
          (wa) => wa.id === selectedImageType
        );
        if (currentWallReading?.images) {
          currentWallReading.images.splice(selectedImageIndex || 0, 1);
        }
        updateWallReading({
          id: currentWallReading?.id || "",
          data: {
            images: currentWallReading?.images || [],
          },
        });
      }

      // Update modal state
      if (selectedImageIndex !== null) {
        if (type === "generic") {
          const currentGenericReading = reading.genericRoomReading?.find(
            (grr) => grr.images?.[selectedImageIndex]
          );
          if (currentGenericReading?.images) {
            if (currentGenericReading.images.length <= 1) {
              setSelectedImageIndex(null);
              setSelectedImageType(null);
            } else {
              setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            }
          }
        } else if (selectedImageType && selectedImageType !== "generic") {
          // For extended walls/floors - need to guard against undefined
          const extendedImages = reading.wallReadings?.find(
            (wa) => wa.id === selectedImageType
          )?.images;
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
    });
  };

  const pickImage = (
    type: "wall" | "generic",
    wallId: string,
    updateImages: (type: "generic" | "wall", id: string, images: any[]) => void
  ) => {
    const captureWithCamera = () => {
      captureImageWithCamera((photo) => {
        console.log("🚀 ~ captureImageWithCamera ~ photo:", photo);
        uploadImage(photo, {
          name: `${reading.id}-${type}-${wallId}-${photo.fileName}`,
          folder: "room-readings",
        }).then((image) => {
          updateImages(type, wallId, [image.url]);
        });
      });
    };

    const pickFromGallery = () => {
      pickImageFromGallery((photo) => {
        uploadImage(photo, {
          name: `${reading.id}-${type}-${wallId}-${photo.fileName}`,
          folder: "room-readings",
        }).then((image) => {
          updateImages(type, wallId, [image.url]);
        });
      });
    };

    showImagePickerOptions(captureWithCamera, pickFromGallery);
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
    setSelectedImageType(null);
    setSelectedGenericIndex(null);
  };

  const openImageViewer = (
    index: number,
    type: "generic" | "floor" | "wall" | string,
    genericId?: string
  ) => {
    console.log("🚀 ~ useImageHandling ~ index:", index);

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
    openImageViewer,
  };
}
