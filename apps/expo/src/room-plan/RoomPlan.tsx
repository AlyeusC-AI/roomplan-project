import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";
import { ViewProps } from "react-native";

interface SubmitEvent {
  nativeEvent: {
    inputText: string;
  };
}

interface RoomPlanViewProps extends ViewProps {
  btnText: string;
  onSubmit(event: SubmitEvent): void;
}

const NativeView: React.ComponentType<RoomPlanViewProps> =
  requireNativeViewManager("RoomPlan");

export default function RoomPlanView(
  props: RoomPlanViewProps,
) {
  return <NativeView {...props} />;
}
