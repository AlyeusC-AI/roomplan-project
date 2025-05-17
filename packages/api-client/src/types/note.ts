import { Image } from "./room";

export interface Note {
  id: string;
  body: string;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
  images?: Image[];
}

export interface CreateNoteDto {
  body: string;
  roomId: string;
}

export interface UpdateNoteDto {
  body?: string;
}
