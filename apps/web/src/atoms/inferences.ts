// import { create } from "zustand";

// interface State {
//   genericReadings: GenericRoomReading[];
//   readings: RoomReading[];
// }

// interface Actions {
//   setReadings: (
//     readings: RoomReading[],
//     genericReadings: GenericRoomReading[]
//   ) => void;
//   addReading: (inference: RoomReading) => void;
// }

// export const inferencesStore = create<State & Actions>((set) => ({
//   readings: [],
//   genericReadings: [],
//   setReadings: (readings, genericReadings) =>
//     set({ readings, genericReadings }),
//   addReading: (reading) =>
//     set((state) => ({ readings: [...state.readings, reading] })),
// }));
