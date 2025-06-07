// Reexport the native module. On web, it will be resolved to RoomPlanModule.web.ts
// and on native platforms to RoomPlanModule.ts
import RoomPlanModule from './RoomPlanModule';

export function isSupported(): boolean {
  return RoomPlanModule.isSupported();
}

export default RoomPlanModule;