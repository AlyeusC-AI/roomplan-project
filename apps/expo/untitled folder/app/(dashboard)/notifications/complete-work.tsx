import React from "react";
import { CheckCircle } from "lucide-react-native";
import NotificationScreen, { createCompleteWorkMessageTemplate } from "./NotificationScreen";

export default function CompleteWorkNotificationScreen() {
  return (
    <NotificationScreen
      type="complete_work"
      title="Complete Work"
      icon={<CheckCircle size={24} color="#16a34a" />}
      defaultMessageTemplate={createCompleteWorkMessageTemplate}
    />
  );
} 