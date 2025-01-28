import * as React from "react";

import { RoomPlanViewProps } from "./RoomPlan.types";

export default function RoomPlanView(props: RoomPlanViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
