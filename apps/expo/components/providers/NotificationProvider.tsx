import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { pushNotificationService, NotificationData } from "@/lib/notifications";
import { useCurrentUser } from "@service-geek/api-client";

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications when user is authenticated
    if (currentUser) {
      registerForPushNotifications();
    }

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        // Handle notification received while app is in foreground
        handleNotificationReceived(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
        // Handle notification tap
        handleNotificationResponse(response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [currentUser]);

  const registerForPushNotifications = async () => {
    try {
      await pushNotificationService.registerForPushNotifications();
    } catch (error) {
      console.error("Failed to register for push notifications:", error);
    }
  };

  const handleNotificationReceived = (
    notification: Notifications.Notification
  ) => {
    // Handle notification received while app is in foreground
    // You can show a custom in-app notification here
    console.log("Notification received in foreground:", notification);
  };

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    const data = response.notification.request.content.data as NotificationData;

    if (data.type === "chat_message" && data.chatId) {
      // Navigate to the specific chat
      router.push(`/chats/${data.chatId}`);
    }

    // Clear the notification badge
    pushNotificationService.setBadgeCountAsync(0);
  };

  return <>{children}</>;
}
