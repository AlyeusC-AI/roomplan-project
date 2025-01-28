import { registerWebModule, NativeModule } from "expo";

import { RoomPlanModuleEvents } from "./RoomPlan.types";

class RoomPlanModule extends NativeModule<RoomPlanModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }
}

export default registerWebModule(RoomPlanModule);
