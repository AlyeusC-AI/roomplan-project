import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { api } from "./api";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: string;
  chatId?: string;
  messageType?: string;
  senderId?: string;
  projectId?: string;
  [key: string]: any;
}

class PushNotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotifications() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("chat-messages", {
        name: "Chat Messages",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        })
      ).data;
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    if (token) {
      this.expoPushToken = token;
      await this.updatePushTokenOnServer(token);
    }

    return token;
  }

  async updatePushTokenOnServer(token: string) {
    try {
      await api.post("/notifications/push-token", {
        expoPushToken: token,
      });
      console.log("Push token updated on server");
    } catch (error) {
      console.error("Failed to update push token on server:", error);
    }
  }

  async removePushTokenFromServer() {
    try {
      await api.post("/notifications/push-token/remove", {
        expoPushToken: this.expoPushToken,
      });
      console.log("Push token removed from server");
    } catch (error) {
      console.error("Failed to remove push token from server:", error);
    }
  }

  async getExpoPushToken() {
    return this.expoPushToken;
  }

  async addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  async addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  async removeNotificationSubscription(
    subscription: Notifications.Subscription
  ) {
    subscription.remove();
  }

  async getBadgeCountAsync() {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCountAsync(count: number) {
    return await Notifications.setBadgeCountAsync(count);
  }

  async clearAllNotificationsAsync() {
    return await Notifications.dismissAllNotificationsAsync();
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: trigger || null,
    });
  }
}

export const pushNotificationService = new PushNotificationService();
