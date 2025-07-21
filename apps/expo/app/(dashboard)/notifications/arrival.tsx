import React from "react";
import { MapPin } from "lucide-react-native";
import NotificationScreen, {
  createArrivalMessageTemplate,
} from "./NotificationScreen";
import { Colors } from "@/constants/Colors";

export default function ArrivalNotificationScreen() {
  return (
    <NotificationScreen
      type="arrival"
      title="Arrival"
      icon={<MapPin size={24} color={Colors.light.primary} />}
      defaultMessageTemplate={createArrivalMessageTemplate}
    />
  );
}
