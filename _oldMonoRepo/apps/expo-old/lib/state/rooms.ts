import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface State {
  rooms: RoomWithReadings[];
  logs: string[];
}

interface Actions {
  setRooms: (rooms: RoomWithReadings[]) => void;
  addLog: (message: string) => void;
  addRoom: (project: RoomWithReadings) => void;
  updateRoom: (room: Partial<RoomWithReadings>) => void;
  updateRoomReading: (
    roomId: number,
    readingId: number,
    data: Partial<RoomReading>
  ) => void;
  updateGenericRoomReading: (
    roomId: number,
    readingId: number,
    grrId: string,
    data: Partial<GenericRoomReading>
  ) => void;
  removeReading: (roomId: number, readingId: number) => void;
  addReading: (roomId: number, data: RoomReading) => void;
  addGenericRoomReading: (
    roomId: number,
    readingId: number,
    data: GenericRoomReading
  ) => void;
}

// Define the store with persistence and partialize
export const roomsStore = create<State & Actions>()(
  persist(
    (set) => ({
      // State
      rooms: [],
      logs: [],

      // Actions
      // Add a fish to the count
      setRooms: (rooms) => set(() => ({ rooms })),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      updateRoom: (room) => {
        set((state) => {
          const index = state.rooms.findIndex(
            (r) => r.publicId === room.publicId
          );
          if (index === -1) return state;
          const newRooms = [...state.rooms];
          newRooms[index] = { ...newRooms[index], ...room };
          return { rooms: newRooms };
        });
      },
      updateRoomReading: (roomId, readingId, data) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
          if (roomIndex === -1) return state;
          const readingIndex = state.rooms[roomIndex].RoomReading.findIndex(
            (r) => r.id === readingId
          );
          if (readingIndex === -1) return state;
          const newRooms = [...state.rooms];
          newRooms[roomIndex].RoomReading[readingIndex] = {
            ...newRooms[roomIndex].RoomReading[readingIndex],
            ...data,
          };
          return { rooms: newRooms };
        });
      },
      updateGenericRoomReading: (roomId, readingId, grrId, data) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
          if (roomIndex === -1) return state;

          const rIndex = state.rooms[roomIndex].RoomReading.findIndex(
            (r) => r.id === readingId
          );
          if (rIndex === -1) return state;
          const grrId = state.rooms[roomIndex].RoomReading[
            rIndex
          ].GenericRoomReading.findIndex((grr) => grr.id === grrId);
          if (grrId === -1) return state;
          const newRooms = [...state.rooms];
          newRooms[roomIndex].RoomReading[rIndex].GenericRoomReading[grrId] = {
            ...newRooms[roomIndex].RoomReading[rIndex].GenericRoomReading[
              grrId
            ],
            ...data,
          };
          return { rooms: newRooms };
        });
      },
      removeReading: (roomId, readingId) => {
        set((state) => {
          const roomIndex = state.rooms.findIndex((r) => r.id === roomId);
          if (roomIndex === -1) return state;
          const readingIndex = state.rooms[roomIndex].RoomReading.findIndex(
            (r) => r.id === readingId
          );
          if (readingIndex === -1) return state;
          const newRooms = [...state.rooms];
          newRooms[roomIndex].RoomReading.splice(readingIndex, 1);
          return { rooms: newRooms };
        });
      },
      addReading: (roomId, data) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  RoomReading: [
                    ...room.RoomReading,
                    { ...data, GenericRoomReading: [] },
                  ],
                }
              : room
          ),
        })),
      addGenericRoomReading: (roomId, readingId, data) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  RoomReading: room.RoomReading.map((reading) =>
                    reading.id === readingId
                      ? {
                          ...reading,
                          GenericRoomReading: [
                            ...reading.GenericRoomReading,
                            data,
                          ],
                        }
                      : reading
                  ),
                }
              : room
          ),
        })),

      // Add a log entry (not persisted)
      addLog: (message) => set((state) => ({ logs: [...state.logs, message] })),
    }),
    {
      // Persist configuration
      name: "room-storage", // The key used for storage

      //optional: Persist only the `fishes` state
      //  It is used to selectively persist specific keys from the state instead of storing the entire state object.
      partialize: (state) => ({ rooms: state.rooms }),

      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
