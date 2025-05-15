export interface Room {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
  roomId: string;
  projectId: string;
  showInReport: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  imageId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  projectId: string;
}

export interface UpdateRoomDto {
  name?: string;
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
}

export interface AddCommentDto {
  content: string;
  userId: string;
}
