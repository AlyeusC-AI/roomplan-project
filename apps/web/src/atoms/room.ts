import { create } from "zustand";



interface State {
  rooms: RoomWithReadings[];
}

type VerifyKindaPartial<T, KP> = Partial<T> & {
  [K in keyof KP]-?: K extends keyof T ? T[K] : never;
};

interface Actions {
  setRooms: (rooms: RoomWithReadings[]) => void;
  addRoom: (room: RoomWithReadings) => void;
  removeRoom: (room: RoomWithReadings) => void;
  updateRoomName: (room: RoomWithReadings, name: string) => void;
  removeRoomNote: (roomPublicId: string, notePublicId: string) => void;
  updateRoomNote: <KP>(
    roomPublicId: string,
    notePublicId: string,
    note: VerifyKindaPartial<Note, KP>
  ) => void;
  addRoomNote: (roomPublicId: string, note: Note) => void;
  updateAllRooms: (rooms: RoomWithReadings[]) => void;
  updateAreasAffected: <KP>(
    roomPublicId: string,
    areasAffected: VerifyKindaPartial<AreaAffected, KP>,
    type: AreaAffectedType
  ) => void;
  updateRoom: (roomId: string, data: Partial<Room>) => void;
  addReading: (roomId: string, reading: RoomReading) => void;
  removeReading: (roomId: string, readingId: string) => void;
  addGenericReading: (roomId: string, reading: GenericRoomReading) => void;
  removeGenericReading: (roomId: string, readingId: string) => void;
  updateGenericReading: (
    roomId: string,
    readingId: string,
    data: Partial<GenericRoomReading>
  ) => void;
  updateReading: (
    roomId: string,
    readingId: string,
    data: Partial<RoomReading>
  ) => void;
}

export const roomStore = create<State & Actions>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (room) =>
    set((state) => ({
      rooms: state.rooms.filter((r) => r.publicId !== room.publicId),
    })),
  updateRoomName: (room, name: string) =>
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
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === roomPublicId
      );
      console.log("🚀 ~ set ~ roomIndex:", roomIndex);
      if (roomIndex < 0 || !state.rooms[roomIndex]) return state;

      const noteIndex = state.rooms[roomIndex].Notes?.findIndex(
        (n) => n.publicId === notePublicId
      );

      if (noteIndex === undefined || noteIndex < 0) return state;
      return {
        ...state,
        rooms: state.rooms.map((r, i) =>
          i === roomIndex
            ? {
                ...r,
                Notes: r.Notes?.filter((n) => n.publicId !== notePublicId),
              }
            : r
        ),
      };
    }),
  updateRoomNote: (roomPublicId, notePublicId, note) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === roomPublicId
      );
      if (roomIndex < 0 || !state.rooms[roomIndex]) return state;

      const noteIndex = state.rooms[roomIndex].Notes?.findIndex(
        (n) => n.publicId === notePublicId
      );
      if (noteIndex === undefined || noteIndex < 0) return state;
      state.rooms[roomIndex].Notes[noteIndex] = {
        ...state.rooms[roomIndex].Notes[noteIndex],
        ...note,
      };
      return state;
    }),
  addRoomNote: (roomPublicId, note) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === roomPublicId
      );
      const newState = [...state.rooms];
      newState[roomIndex] = {
        ...newState[roomIndex],
        Notes: [note, ...(newState[roomIndex].Notes || [])],
      };
      return { rooms: newState };
    }),
  updateAllRooms: (rooms) => set({ rooms }),
  updateAreasAffected: <KP>(
    roomPublicId: string,
    areasAffected: VerifyKindaPartial<AreaAffected, KP>,
    type: AreaAffectedType
  ) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex(
        (r) => r.publicId === roomPublicId
      );

      // Return unchanged state if room not found
      if (roomIndex === -1) return state;

      const room = state.rooms[roomIndex];
      const areaAffected = room.AreaAffected || [];
      const affectedAreaIndex = areaAffected.findIndex((t) => t.type === type);

      // Create new rooms array with updated area affected
      const updatedRooms = [...state.rooms];
      const updatedRoom = { ...room };

      const newAreaAffected: AreaAffected = {
        ...areasAffected,
        type,
      } as AreaAffected;

      if (affectedAreaIndex === -1) {
        // Add new area affected
        updatedRoom.AreaAffected = [...areaAffected, newAreaAffected];
      } else {
        // Update existing area affected
        updatedRoom.AreaAffected = areaAffected.map((area, index) =>
          index === affectedAreaIndex ? { ...area, ...newAreaAffected } : area
        );
      }

      updatedRooms[roomIndex] = updatedRoom;

      return { rooms: updatedRooms };
    }),
  updateRoom: (roomId, data) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...data };
      return state;
    }),
  addReading: (roomId, reading) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex].RoomReading.push({
        ...reading,
        GenericRoomReading: [],
      });
      return state;
    }),
  removeReading: (roomId, readingId) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex].RoomReading = state.rooms[
        roomIndex
      ].RoomReading.filter((r) => r.publicId !== readingId);
      return state;
    }),
  addGenericReading: (roomId, reading) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      const readingIndex = state.rooms[roomIndex].RoomReading.findIndex(
        (r) => r.id === reading.roomReadingId
      );
      state.rooms[roomIndex].RoomReading[readingIndex].GenericRoomReading.push(
        reading
      );
      return state;
    }),
  removeGenericReading: (roomId, readingId) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex].RoomReading = state.rooms[
        roomIndex
      ].RoomReading.map((r) => ({
        ...r,
        GenericRoomReading: r.GenericRoomReading.filter(
          (g) => g.publicId !== readingId
        ),
      }));
      return state;
    }),
  updateGenericReading: (roomId, readingId, data) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex].RoomReading = state.rooms[
        roomIndex
      ].RoomReading.map((r) => ({
        ...r,
        GenericRoomReading: r.GenericRoomReading.map((g) =>
          g.publicId === readingId ? { ...g, ...data } : g
        ),
      }));
      return state;
    }),
  updateReading: (roomId, readingId, data) =>
    set((state) => {
      const roomIndex = state.rooms.findIndex((r) => r.publicId === roomId);
      state.rooms[roomIndex].RoomReading = state.rooms[
        roomIndex
      ].RoomReading.map((r) =>
        r.publicId === readingId ? { ...r, ...data } : r
      );
      return state;
    }),
}));
