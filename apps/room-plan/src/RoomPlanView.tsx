import { requireNativeView } from "expo";
import * as React from "react";

import { RoomPlanViewProps } from "./RoomPlan.types";

const NativeView: React.ComponentType<RoomPlanViewProps> =
  requireNativeView("RoomPlan");

export default function RoomPlanView(props: RoomPlanViewProps) {
  return <NativeView {...props} />;
}
