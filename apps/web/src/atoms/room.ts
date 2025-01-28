import { RoomDataWithoutInferences } from "@servicegeek/db/queries/project/getProjectDetections";
import produce from "immer";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// export const defaultRoomState = []
// const roomState = atom<RoomDataWithoutInferences[]>({
//   key: 'RoomState',
//   default: defaultRoomState,
// })

// export default roomState

interface State {
  rooms: RoomDataWithoutInferences[];
}

interface Actions {
  setRooms: (rooms: RoomDataWithoutInferences[]) => void;
  addRoom: (room: RoomDataWithoutInferences) => void;
  removeRoom: (room: RoomDataWithoutInferences) => void;
  updateRoomName: (room: RoomDataWithoutInferences, name: string) => void;
  removeRoomNote: (roomPublicId: string, notePublicId: string) => void;
  updateRoomNote: (
    roomPublicId: string,
    notePublicId: string,
    notesAuditTrail: string,
    updatedAt: string
  ) => void;
  addRoomNote: (roomPublicId: string, note: any) => void;
  updateAllRooms: (rooms: RoomDataWithoutInferences[]) => void;
  updateAreasAffected: (
    roomPublicId: string,
    areasAffected: AffectedAreaData,
    type: AreaAffectedType
  ) => void;
  updateRoom: (roomId: string, data: DimensionData) => void;
}

export const roomStore = create<State & Actions>((set) => ({
  rooms: [],
  setRooms: (rooms: RoomDataWithoutInferences[]) => set({ rooms }),
  addRoom: (room: RoomDataWithoutInferences) =>
    set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (room: RoomDataWithoutInferences) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.publicId !== room.publicId),
    })),
  updateRoomName: (room: RoomDataWithoutInferences, name: string) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === room.publicId
      );
      const newState = [...state.rooms];
      newState[roomIndex] = {
        ...newState[roomIndex],
        name: name.trim(),
      };
      return { rooms: newState };
    }),
  removeRoomNote: (roomPublicId: string, notePublicId: string) =>
    set(
      produce((draft) => {
        const roomIndex = draft.findIndex(
          (r: RoomDataWithoutInferences) => r.publicId === roomPublicId
        );
        if (roomIndex < 0 || !draft[roomIndex]) return draft;

        const noteIndex = draft[roomIndex].notes?.findIndex(
          (n: any) => n.publicId === notePublicId
        );
        if (noteIndex === undefined || noteIndex < 0) return draft;
        draft[roomIndex].notes?.splice(noteIndex, 1);
        return draft;
      })
    ),
  updateRoomNote: (
    roomPublicId: string,
    notePublicId: string,
    notesAuditTrail: string,
    updatedAt: string
  ) =>
    set(
      produce((draft) => {
        const roomIndex = draft.findIndex(
          (r: RoomDataWithoutInferences) => r.publicId === roomPublicId
        );
        if (roomIndex < 0 || !draft[roomIndex]) return draft;

        const noteIndex = draft[roomIndex].notes?.findIndex(
          (n: any) => n.publicId === notePublicId
        );
        if (noteIndex === undefined || noteIndex < 0) return draft;
        draft[roomIndex].notes[noteIndex].updatedAt = updatedAt;
        draft[roomIndex].notes[noteIndex].notesAuditTrail = notesAuditTrail;
        return draft;
      })
    ),
  addRoomNote: (roomPublicId: string, note: any) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === roomPublicId
      );
      const newState = [...state.rooms];
      newState[roomIndex] = {
        ...newState[roomIndex],
        notes: [note, ...(newState[roomIndex].notes || [])],
      };
      return { rooms: newState };
    }),
  updateAllRooms: (rooms: RoomDataWithoutInferences[]) => set({ rooms }),
  updateAreasAffected: (
    roomPublicId: string,
    areasAffected: AffectedAreaData,
    type: AreaAffectedType
  ) =>
    set(
      produce((draft) => {
        const roomIndex = draft.findIndex((r) => r.publicId === roomPublicId);
        const affectedAreaIndex = draft[roomIndex].areasAffected.findIndex(
          (t) => t.type === type
        );
        if (affectedAreaIndex === -1) {
          draft[roomIndex].areasAffected.push({
            type,
            ...areasAffected,
            publicId: uuidv4(),
            isDeleted: false,
          });
        } else {
          draft[roomIndex].areasAffected[affectedAreaIndex] = {
            ...draft[roomIndex].areasAffected[affectedAreaIndex],
            ...areasAffected,
          };
        }
        return draft;
      })
    ),
  updateRoom: (roomId: string, data: DimensionData) =>
    set(
      produce((draft) => {
        const roomIndex = draft.findIndex((r) => r.publicId === roomId);
        draft[roomIndex] = { ...draft[roomIndex], ...data };
        return draft;
      })
    ),
}));
