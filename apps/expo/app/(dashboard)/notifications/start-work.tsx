import React from "react";
import { PlayCircle } from "lucide-react-native";
import NotificationScreen, { createStartWorkMessageTemplate } from "./NotificationScreen";

export default function StartWorkNotificationScreen() {
  return (
    <NotificationScreen
      type="start_work"
      title="Start Work"
      icon={<PlayCircle size={24} color="#0891b2" />}
      defaultMessageTemplate={createStartWorkMessageTemplate}
    />
  );
} 