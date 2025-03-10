import { ViewProps, requireNativeComponent } from "react-native";
import * as React from "react";

interface NativeRoomPlanViewProps extends ViewProps {
  onCaptureStopped?: (event: any) => void;
  onCaptureStarted?: (event: any) => void;
}

export const RoomPlanNativeView =
  requireNativeComponent<NativeRoomPlanViewProps>("RoomPlanView");

export default function RoomPlanView(props: NativeRoomPlanViewProps) {
  return <RoomPlanNativeView {...props} />;
}
