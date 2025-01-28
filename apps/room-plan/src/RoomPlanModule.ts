import { NativeModule, requireNativeModule } from "expo";

import { RoomPlanModuleEvents } from "./RoomPlan.types";

declare class RoomPlanModule extends NativeModule<RoomPlanModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RoomPlanModule>("RoomPlan");
