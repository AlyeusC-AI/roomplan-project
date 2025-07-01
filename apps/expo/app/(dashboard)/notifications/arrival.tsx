import React from "react";
import { MapPin } from "lucide-react-native";
import NotificationScreen, { createArrivalMessageTemplate } from "./NotificationScreen";

export default function ArrivalNotificationScreen() {
  return (
    <NotificationScreen
      type="arrival"
      title="Arrival"
      icon={<MapPin size={24} color="#2563eb"  />}
      defaultMessageTemplate={createArrivalMessageTemplate}
    />
  );
} 