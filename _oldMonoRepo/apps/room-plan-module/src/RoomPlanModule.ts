import { NativeModule, requireNativeModule } from 'expo';

declare class RoomPlanModule extends NativeModule {
  isSupported(): boolean;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RoomPlanModule>('RoomPlanModule');
