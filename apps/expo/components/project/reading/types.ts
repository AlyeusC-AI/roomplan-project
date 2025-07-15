import { Database } from "@/types/database";
import { ExtendedWallItem } from "@/types/app";

export type UpdateRoomReadingData = {
  temperature?: string;
  relativeHumidity?: string;
  gpp?: string;
  moistureContentWall?: string;
  moistureContentFloor?: string;
};

export type Room = {
  id: number;
  name: string;
  // Add other properties as needed
};

export type ReadingType = "standard" | "generic";

export type ReadingsWithGenericReadings =
  Database["public"]["Tables"]["RoomReading"]["Row"] & {
    GenericRoomReading: (Database["public"]["Tables"]["GenericRoomReading"]["Row"] & {
      GenericRoomReadingImage?: {
        id: number;
        imageKey: string;
      }[];
    })[];
    RoomReadingImage?: {
      id: number;
      imageKey: string;
      type: string;
    }[];
    extendedWalls?: ExtendedWallItem[] | null;
    wallName?: string | null;
    floorName?: string | null;
  };

export { ExtendedWallItem };
