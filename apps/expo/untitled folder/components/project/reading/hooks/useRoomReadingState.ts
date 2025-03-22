import { useState, useEffect } from "react";
import { v4 } from "react-native-uuid/dist/v4";
import { useGlobalSearchParams } from "expo-router";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";
import { userStore } from "@/lib/state/user";
import { roomsStore } from "@/lib/state/rooms";
import {
  ExtendedWallItem,
  ReadingType,
  ReadingsWithGenericReadings,
  Room,
} from "@/types/app";
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
  console.log("🚀 ~ room12:", room);
  // Create a type-safe version of the reading with all required properties
  const typedReading = reading as ReadingsWithGenericReadings & {
    wallName: string | null;
    floorName: string | null;
    extendedWalls: ExtendedWallItem[] | null;
  };

  // Basic component state
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date(reading.date));

  // Wall and floor name state
  const [showWallNameEdit, setShowWallNameEdit] = useState(false);
  const [showFloorNameEdit, setShowFloorNameEdit] = useState(false);
  const [wallName, setWallName] = useState(room.wallName || "");
  const [floorName, setFloorName] = useState(room.floorName || "");
  const [originalWallName, setOriginalWallName] = useState(room.wallName || "");
  const [originalFloorName, setOriginalFloorName] = useState(
    room.floorName || ""
  );
  const [isUpdatingWallName, setIsUpdatingWallName] = useState(false);
  const [isUpdatingFloorName, setIsUpdatingFloorName] = useState(false);
  const [extendedWallsStructure, setExtendedWallsStructure] = useState<
    ExtendedWallItem[]
  >(room.extendedWalls || []);

  useEffect(() => {
    if (isCollapsed) return;

    if (room) {
      // Only update if values have actually changed
      if (wallName !== (room.wallName || "")) {
        setWallName(room.wallName || "");
      }
      if (floorName !== (room.floorName || "")) {
        setFloorName(room.floorName || "");
      }
      if (originalWallName !== (room.wallName || "")) {
        setOriginalWallName(room.wallName || "");
      }
      if (originalFloorName !== (room.floorName || "")) {
        setOriginalFloorName(room.floorName || "");
      }
      if (
        JSON.stringify(extendedWallsStructure) !==
        JSON.stringify(room.extendedWalls || [])
      ) {
        setExtendedWallsStructure(room.extendedWalls || []);
      }
    }
  }, [room, isCollapsed]);

  // Separate effect for extendedWalls since it depends on typedReading
  useEffect(() => {
    if (isCollapsed) return;
    if (
      JSON.stringify(extendedWalls) !==
      JSON.stringify(typedReading.extendedWalls || [])
    ) {
      setExtendedWalls(typedReading.extendedWalls || []);
    }
  }, [typedReading.extendedWalls, isCollapsed]);

  // Extended walls state
  const [extendedWalls, setExtendedWalls] = useState<ExtendedWallItem[]>(
    typedReading.extendedWalls || []
  );
  const [showExtendedWallEdit, setShowExtendedWallEdit] = useState(false);
  const [currentEditingWall, setCurrentEditingWall] =
    useState<ExtendedWallItem | null>(null);
  const [isUpdatingExtendedWall, setIsUpdatingExtendedWall] = useState(false);

  // Image related state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [selectedImageType, setSelectedImageType] = useState<
    "generic" | "floor" | "wall" | string | null
  >(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<
    number | null
  >(null);
  const [roomImages, setRoomImages] = useState<{ [key: string]: string }>({});
  const [genericImages, setGenericImages] = useState<{ [key: string]: string }>(
    {}
  );
  const [extendedWallImages, setExtendedWallImages] = useState<{
    [key: string]: string[];
  }>({});

  // Store access
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();

  // Filtered images
  const wallImages = reading.RoomReadingImage?.filter(
    (img) => img.type === "wall"
  );
  const floorImages = reading.RoomReadingImage?.filter(
    (img) => img.type === "floor"
  );

  async function updateRoom(
    data: Database["public"]["Tables"]["Room"]["Update"]
  ) {
    try {
      const res = await supabaseServiceRole
        .from("Room")
        .update(data)
        .eq("publicId", room.publicId);
      if (res.error) {
        throw new Error(res.error.message);
      }

      // Refetch room data after successful update
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );
      const roomData = await response.json();
      rooms.setRooms(roomData.rooms);
    } catch {
      toast.error("Could not update room");
    }
  }

  // Load images when reading changes
  useEffect(() => {
    if (isCollapsed) return;
    // Load room reading images
    if (reading.RoomReadingImage) {
      const loadRoomImages = async () => {
        const imageKeys = reading.RoomReadingImage?.map((img) => img.imageKey);
        console.log("🚀 ~ loadRoomImages ~ imageKeys:", reading);
        if (
          imageKeys?.length === 0 ||
          imageKeys?.length == Object.keys(roomImages).length
        )
          return;
        const { data: urlData } = await supabaseServiceRole.storage
          .from("readings-images")
          .createSignedUrls(imageKeys || [], 3600);

        const urlMap = urlData?.reduce((acc, curr) => {
          if (curr.path && curr.signedUrl) {
            acc[curr.path] = curr.signedUrl;
          }
          return acc;
        }, {} as { [key: string]: string });
        console.log("🚀 ~ loadRoomImages ~ urlMap:", urlMap);

        setRoomImages(urlMap || {});

        // Process extended wall images
        const extendedWallMap: { [key: string]: string[] } = {};
        extendedWalls.forEach((wall) => {
          const wallImages =
            reading.RoomReadingImage?.filter((img) => img.type === wall.id) ||
            [];
          if (wallImages.length > 0) {
            extendedWallMap[wall.id] = wallImages
              .map((img) => img.imageKey)
              .filter((key) => urlMap?.[key])
              .map((key) => urlMap?.[key] || "");
          }
        });
        setExtendedWallImages(extendedWallMap);
      };
      loadRoomImages();
    }

    // Load generic reading images
    if (reading.GenericRoomReading) {
      const loadGenericImages = async () => {
        const imageKeys = reading.GenericRoomReading.flatMap(
          (grr) => grr.GenericRoomReadingImage?.map((img) => img.imageKey) || []
        );
        if (
          imageKeys.length === 0 ||
          imageKeys.length == Object.keys(genericImages).length
        )
          return;

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
  }, [reading, isCollapsed]);
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
  return {
    // Basic state
    isCollapsed,
    setIsCollapsed,
    showDatePicker,
    setShowDatePicker,
    date,
    setDate,
    updateRoom,
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
    extendedWallsStructure,
    setExtendedWallsStructure,
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
    updateRoomReading,
    // Store access
    supabaseSession,
    rooms,
    projectId,
  };
}
