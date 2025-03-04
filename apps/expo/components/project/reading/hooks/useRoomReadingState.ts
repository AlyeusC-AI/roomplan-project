import { useState, useEffect } from "react";
import { v4 } from "react-native-uuid/dist/v4";
import { useGlobalSearchParams } from "expo-router";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";
import { userStore } from "@/lib/state/user";
import { roomsStore } from "@/lib/state/rooms";
import { ExtendedWallItem, ReadingType, ReadingsWithGenericReadings, Room } from "@/types/app";
import { Database } from "@/types/database";
import { toast } from "sonner-native";

export function useRoomReadingState(
  room: Room, 
  reading: ReadingsWithGenericReadings, 
  addReading: (
    data: Database["public"]["Tables"]["GenericRoomReading"]["Insert"],
    type: ReadingType
  ) => Promise<any>
) {
  // Create a type-safe version of the reading with all required properties
  const typedReading = reading as ReadingsWithGenericReadings & {
    wallName: string | null;
    floorName: string | null;
    extendedWalls: ExtendedWallItem[] | null;
  };

  // Basic component state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(new Date(reading.date));

  // Wall and floor name state
  const [showWallNameEdit, setShowWallNameEdit] = useState(false);
  const [showFloorNameEdit, setShowFloorNameEdit] = useState(false);
  const [wallName, setWallName] = useState(typedReading.wallName || "");
  const [floorName, setFloorName] = useState(typedReading.floorName || "");
  const [originalWallName, setOriginalWallName] = useState(typedReading.wallName || "");
  const [originalFloorName, setOriginalFloorName] = useState(typedReading.floorName || "");
  const [isUpdatingWallName, setIsUpdatingWallName] = useState(false);
  const [isUpdatingFloorName, setIsUpdatingFloorName] = useState(false);

  // Extended walls state
  const [extendedWalls, setExtendedWalls] = useState<ExtendedWallItem[]>(typedReading.extendedWalls || []);
  const [showExtendedWallEdit, setShowExtendedWallEdit] = useState(false);
  const [currentEditingWall, setCurrentEditingWall] = useState<ExtendedWallItem | null>(null);
  const [isUpdatingExtendedWall, setIsUpdatingExtendedWall] = useState(false);

  // Image related state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<"generic" | "floor" | "wall" | string | null>(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<number | null>(null);
  const [roomImages, setRoomImages] = useState<{ [key: string]: string }>({});
  const [genericImages, setGenericImages] = useState<{ [key: string]: string }>({});
  const [extendedWallImages, setExtendedWallImages] = useState<{ [key: string]: string[] }>({});

  // Store access
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();

  // Filtered images 
  const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
  const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");

  // Define the updateRoomReading function to access projectId and other variables
  async function updateRoomReading(
    readingId: string,
    type: ReadingType,
    data:
      | (Database["public"]["Tables"]["RoomReading"]["Update"] & { 
          wallName?: string; 
          floorName?: string;
          extendedWalls?: ExtendedWallItem[];
        })
      | Database["public"]["Tables"]["GenericRoomReading"]["Update"]
  ) {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            readingData: data,
            readingId,
            type,
          }),
        }
      );

      if (type === "standard") {
        // Use type assertion for the data
        rooms.updateRoomReading(room.id, reading.id, data as any);
      }
    } catch {
      toast.error("Could not update reading");
    }
  }

  const deleteReading = async (readingId: string, type: ReadingType) => {
    try {
      setIsDeleting(true);
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            type,
            readingId,
          }),
        }
      );
      rooms.removeReading(room.id, reading.id);
    } catch {
      toast.error("Could not delete reading");
    } finally {
      setIsDeleting(false);
    }
  };

  // Load images when reading changes
  useEffect(() => {
    // Load room reading images
    if (reading.RoomReadingImage) {
      const loadRoomImages = async () => {
        const imageKeys = reading.RoomReadingImage?.map(img => img.imageKey);
        const { data: urlData } = await supabaseServiceRole.storage
          .from("readings-images")
          .createSignedUrls(imageKeys || [], 3600);

        const urlMap = urlData?.reduce((acc, curr) => {
          if (curr.path && curr.signedUrl) {
            acc[curr.path] = curr.signedUrl;
          }
          return acc;
        }, {} as { [key: string]: string });

        setRoomImages(urlMap || {});
        
        // Process extended wall images
        const extendedWallMap: { [key: string]: string[] } = {};
        extendedWalls.forEach(wall => {
          const wallImages = reading.RoomReadingImage?.filter(img => img.type === wall.id) || [];
          if (wallImages.length > 0) {
            extendedWallMap[wall.id] = wallImages.map(img => img.imageKey)
              .filter(key => urlMap?.[key])
              .map(key => urlMap?.[key] || '');
          }
        });
        setExtendedWallImages(extendedWallMap);
      };
      loadRoomImages();
    }

    // Load generic reading images
    if (reading.GenericRoomReading) {
      const loadGenericImages = async () => {
        const imageKeys = reading.GenericRoomReading.flatMap(grr => 
          grr.GenericRoomReadingImage?.map(img => img.imageKey) || []
        );
        
        const { data: urlData } = await supabaseServiceRole.storage
          .from("readings-images")
          .createSignedUrls(imageKeys, 3600);

        const urlMap = urlData?.reduce((acc, curr) => {
          if (curr.path && curr.signedUrl) {
            acc[curr.path] = curr.signedUrl;
          }
          return acc;
        }, {} as { [key: string]: string });

        setGenericImages(urlMap || {});
      };
      loadGenericImages();
    }
  }, [reading, extendedWalls]);

  return {
    // Basic state
    isCollapsed,
    setIsCollapsed,
    showDatePicker,
    setShowDatePicker,
    isDeleting,
    setIsDeleting,
    isAdding,
    setIsAdding,
    date,
    setDate,
    
    // Wall and floor name state
    showWallNameEdit,
    setShowWallNameEdit,
    showFloorNameEdit,
    setShowFloorNameEdit,
    wallName,
    setWallName,
    floorName,
    setFloorName,
    originalWallName,
    setOriginalWallName,
    originalFloorName,
    setOriginalFloorName,
    isUpdatingWallName,
    setIsUpdatingWallName,
    isUpdatingFloorName,
    setIsUpdatingFloorName,

    // Extended walls state
    extendedWalls,
    setExtendedWalls,
    showExtendedWallEdit,
    setShowExtendedWallEdit,
    currentEditingWall,
    setCurrentEditingWall,
    isUpdatingExtendedWall,
    setIsUpdatingExtendedWall,

    // Image related state
    selectedImageIndex,
    setSelectedImageIndex,
    selectedImageType,
    setSelectedImageType,
    selectedGenericIndex,
    setSelectedGenericIndex,
    roomImages,
    genericImages,
    extendedWallImages,
    wallImages,
    floorImages,

    // Functions
    updateRoomReading,
    deleteReading,
    
    // Store access
    supabaseSession,
    rooms,
    projectId,
  };
} 