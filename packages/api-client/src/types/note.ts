import { Image } from "./room";

export interface Note {
  id: string;
  title?: string;
  body: string;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
  images?: Image[];
}

export interface CreateNoteDto {
  title?: string;
  body: string;
  roomId: string;
}

export interface UpdateNoteDto {
  title?: string;
  body?: string;
}
