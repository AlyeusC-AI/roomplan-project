import { User } from "./auth";
import { Wall } from "./reading";
import { Equipment, EquipmentProject } from "./equipment";

type ImageType = "ROOM" | "FILE" | "NOTE";
export interface AreaAffected {
  id: string;
  createdAt: string;
  updatedAt: string;
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cabinetryRemoved?: string;
  isVisible: boolean;
  extraFields?: Record<string, any>;
}
export interface RoomAreaAffected extends Room {
  floorAffected: AreaAffected;
  wallsAffected: AreaAffected;
  ceilingAffected: AreaAffected;
}

export interface Room {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  images: Image[];
  walls: Wall[];
  equipmentsUsed: EquipmentProject[];

  humidity?: number;
  dehuReading?: number;
  temperature?: number;
  length?: number;
  width?: number;
  height?: number;
  totalSqft?: number;
  windows?: number;
  doors?: number;
  roomPlanSVG?: string;
  scannedFileKey?: string;
  cubiTicketId?: string;
  cubiModelId?: string;
  cubiRoomPlan?: string;
  floorRoomId?: string;
  wallsRoomId?: string;
  ceilingRoomId?: string;
}

export interface Image {
  id: string;
  url: string;
  roomId?: string;
  projectId: string;
  showInReport: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  noteId?: string;
  comments: Comment[];
  name?: string;
  description?: string;
  type?: ImageType;
}

export interface Comment {
  id: string;
  content: string;
  imageId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CreateRoomDto {
  name: string;
  projectId: string;
}

export interface UpdateRoomDto {
  name?: string;
  equipmentUsed?: {
    id: string;
    quantity: number;
  }[];
  length?: number;
  width?: number;
  height?: number;
  totalSqft?: number;
  windows?: number;
  doors?: number;
  humidity?: number;
  dehuReading?: number;
  temperature?: number;
  roomPlanSVG?: string;
  scannedFileKey?: string;
  cubiTicketId?: string;
  cubiModelId?: string;
  cubiRoomPlan?: string;
}

export interface UpdateAreaAffectedDto {
  material?: string;
  totalAreaRemoved?: string;
  totalAreaMicrobialApplied?: string;
  cabinetryRemoved?: string;
  isVisible?: boolean;
  extraFields?: Record<string, any>;
}

export interface ImageFilters {
  showInReport?: boolean;
  hasComments?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  projectId?: string;
  roomIds?: string[];
  searchTerm?: string;
  ids?: string[];
  type: ImageType;
}

export interface ImageSortOptions {
  field: "createdAt" | "order" | "url";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface ImageStats {
  totalImages: number;
  imagesInReport: number;
  imagesWithComments: number;
  imagesByRoom: { roomId: string; roomName: string; count: number }[];
}

export interface AddImageDto {
  url: string;
  showInReport?: boolean;
  order?: number;
  projectId: string;
  roomId?: string;
  noteId?: string;
  name?: string;
  description?: string;
  type?: ImageType;
}

export interface AddCommentDto {
  content: string;
  userId: string;
}
