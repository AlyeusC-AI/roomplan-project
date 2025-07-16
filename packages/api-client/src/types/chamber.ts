import { Room } from "./room";

export interface Chamber {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  roomChambers: RoomChamber[];
}

export interface RoomChamber {
  id: string;
  roomId: string;
  chamberId: string;
  isEffected: boolean;
  room: Room;
}

export interface CreateChamberDto {
  name: string;
  projectId: string;
}

export interface UpdateChamberDto {
  name?: string;
}
