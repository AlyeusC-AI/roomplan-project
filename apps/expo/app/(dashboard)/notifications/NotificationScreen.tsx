import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import {
  ArrowLeft,
  Check,
  Clock,
  AlertTriangle,
  MapPin,
  PlayCircle,
  CheckCircle,
} from "lucide-react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import {
  useActiveOrganization,
  useGetProjectById,
} from "@service-geek/api-client";

export type NotificationType = "arrival" | "start_work" | "complete_work";

interface NotificationScreenProps {
  type: NotificationType;
  title: string;
  icon: React.ReactNode;
  defaultMessageTemplate: (
    projectName: string,
    phoneNumber: string,
    arrivalTime?: number
  ) => string;
  additionalFields?: React.ReactNode;
  additionalData?: Record<string, any>;
}

export default function NotificationScreen({
  type,
  title,
  icon,
  defaultMessageTemplate,
  additionalFields,
  additionalData = {},
}: NotificationScreenProps) {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [arrivalTime, setArrivalTime] = useState(30);
  const [status, setStatus] = useState<"heading" | "late">("heading");
  const MAX_CHARS = 300;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const org = useActiveOrganization();
  const { data: projects } = useGetProjectById(
    (params.projectId as string) || ""
  );

  // Extract project details from params
  // const projectId = params.projectId ? Number(params.projectId) : null;
  const eventId = params.eventId as string;
  const project = projects?.data;
  const projectId = project?.id;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    // Initialize default message
    if (org) {
      const defaultMessage = defaultMessageTemplate(
        org?.name,
        org?.phoneNumber || "(your phone number)",
        type === "arrival" ? arrivalTime : undefined
      );
      setMessage(defaultMessage);
      setCharCount(defaultMessage.length);
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [org]);

  // Update message when arrival time changes (only for arrival notifications)
  useEffect(() => {
    if (type === "arrival" && project && message.includes("minutes")) {
      const updatedMessage = message.replace(
        /\d+ minutes/,
        `${arrivalTime} minutes`
      );
      setMessage(updatedMessage);
      setCharCount(updatedMessage.length);
    }
  }, [arrivalTime]);

  // Update message when status changes (only for arrival notifications)
  useEffect(() => {
    if (type === "arrival" && project && message) {
      let updatedMessage = message;

      if (status === "late" && !message.includes("running late")) {
        updatedMessage = message.replace(
          "heading your way",
          "running late but will be there"
        );
      } else if (status === "heading" && message.includes("running late")) {
        updatedMessage = message.replace(
          "running late but will be there",
          "heading your way"
        );
      }

      setMessage(updatedMessage);
      setCharCount(updatedMessage.length);
    }
  }, [status]);

  const handleMessageChange = (text: string) => {
    setMessage(text);
    setCharCount(text.length);
  };

  const handleSendNotification = async () => {
    if (!projectId) {
      Alert.alert("Error", "Project information is missing");
      return;
    }

    if (!message) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (!project?.clientPhoneNumber) {
      Alert.alert("Error", "Client phone number is missing");
      return;
    }

    try {
      setLoading(true);

      // Send SMS via Twilio
      const twilioAccountSid = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
      const twilioPhoneNumber = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        Alert.alert("Error", "Twilio configuration is missing");
        setLoading(false);
        return;
      }

      // Format the phone number (ensure it has country code)
      const formattedPhoneNumber = formatPhoneNumber(
        project?.clientPhoneNumber || ""
      );
      console.log(
        "🚀 ~ handleSendNotification ~ formattedPhoneNumber:",
        formattedPhoneNumber
      );

      // Create the Twilio message
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(
              `${twilioAccountSid}:${twilioAuthToken}`
            )}`,
          },
          body: new URLSearchParams({
            To: formattedPhoneNumber,
            From: twilioPhoneNumber,
            Body: message,
          }).toString(),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save notification record to your database if needed
        const notificationData = {
          projectId,
          eventId,
          message,
          notificationType: type,
          phoneNumber: formattedPhoneNumber,
          ...(type === "arrival" && { arrivalTime, status }),
          ...additionalData,
        };

        // await saveNotificationRecord(notificationData);

        Alert.alert("Success", `${title} notification sent successfully`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Error", "An error occurred while sending the notification");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format phone number
  const formatPhoneNumber = (phoneNumber: string): string => {
    console.log("🚀 ~ formatPhoneNumber ~ phoneNumber:", phoneNumber);
    // Remove any non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, "");

    // Ensure it has the US country code if needed
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    } else if (digitsOnly.startsWith("1") && digitsOnly.length === 11) {
      return `+${digitsOnly}`;
    } else if (digitsOnly.startsWith("+")) {
      return digitsOnly;
    }

    // Default to adding +1 if no country code is detected
    return `+1${digitsOnly}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title} Notification</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Details</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>{icon}</View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoTitle}>{title}</Text>
                  <Text style={styles.infoDescription}>
                    This will send a notification to the client
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrival-specific fields */}
            {type === "arrival" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.statusOptions}>
                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === "heading" && styles.statusOptionSelected,
                    ]}
                    onPress={() => setStatus("heading")}
                  >
                    <View
                      style={[
                        styles.statusIconContainer,
                        status === "heading" &&
                          styles.statusIconContainerSelected,
                      ]}
                    >
                      <Clock
                        size={18}
                        color={status === "heading" ? "#fff" : "#64748b"}
                      />
                    </View>
                    <View style={styles.statusTextContainer}>
                      <Text
                        style={[
                          styles.statusText,
                          status === "heading" && styles.statusTextSelected,
                        ]}
                      >
                        Heading Your Way
                      </Text>
                      <Text style={styles.statusDescription}>
                        On time and en route
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusOption,
                      status === "late" && styles.statusOptionSelected,
                    ]}
                    onPress={() => setStatus("late")}
                  >
                    <View
                      style={[
                        styles.statusIconContainer,
                        status === "late" && styles.statusIconContainerSelected,
                      ]}
                    >
                      <AlertTriangle
                        size={18}
                        color={status === "late" ? "#fff" : "#64748b"}
                      />
                    </View>
                    <View style={styles.statusTextContainer}>
                      <Text
                        style={[
                          styles.statusText,
                          status === "late" && styles.statusTextSelected,
                        ]}
                      >
                        Running Late
                      </Text>
                      <Text style={styles.statusDescription}>
                        Delayed but on the way
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.arrivalTimeContainer}>
                  <Text style={styles.arrivalTimeLabel}>
                    Estimated arrival in:
                  </Text>
                  <View style={styles.arrivalTimeControls}>
                    <TouchableOpacity
                      style={styles.arrivalTimeButton}
                      onPress={() =>
                        setArrivalTime(Math.max(5, arrivalTime - 5))
                      }
                    >
                      <Text style={styles.arrivalTimeButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.arrivalTimeValue}>
                      <Text style={styles.arrivalTimeValueText}>
                        {arrivalTime} min
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.arrivalTimeButton}
                      onPress={() =>
                        setArrivalTime(Math.min(120, arrivalTime + 5))
                      }
                    >
                      <Text style={styles.arrivalTimeButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Additional custom fields if provided */}
            {additionalFields}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SMS Message</Text>
              <TextInput
                style={styles.messageInput}
                multiline
                value={message}
                onChangeText={handleMessageChange}
                maxLength={MAX_CHARS}
                placeholder="Enter your message here"
              />
              <Text style={styles.charCount}>
                {charCount}/{MAX_CHARS}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleSendNotification}
            style={styles.sendButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check color="#fff" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.sendButtonText}>Send Notification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper functions to create default message templates
export const createArrivalMessageTemplate = (
  projectName: string,
  phoneNumber: string,
  arrivalTime: number = 30
) => {
  return `Hello, this is ${projectName}. We are heading your way and will be there in about ${arrivalTime} minutes. Feel free to reach us at ${phoneNumber}`;
};

export const createStartWorkMessageTemplate = (
  projectName: string,
  phoneNumber: string
) => {
  return `Hello, this is ${projectName}. We have arrived and are starting work now. If you have any questions, please contact us at ${phoneNumber}`;
};

export const createCompleteWorkMessageTemplate = (
  projectName: string,
  phoneNumber: string
) => {
  return `Hello, this is ${projectName}. We have completed the work at your location. If you have any questions or need anything else, please contact us at ${phoneNumber}. Thank you for your business!`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  statusOptions: {
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusOptionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  statusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusIconContainerSelected: {
    backgroundColor: "#3b82f6",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
  },
  statusTextSelected: {
    color: "#1e40af",
  },
  statusDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  arrivalTimeContainer: {
    marginTop: 8,
  },
  arrivalTimeLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  arrivalTimeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  arrivalTimeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  arrivalTimeButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#334155",
  },
  arrivalTimeValue: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  arrivalTimeValueText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
  },
  messageInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    fontSize: 16,
    color: "#334155",
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
    marginTop: 4,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
