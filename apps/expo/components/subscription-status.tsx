import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { AlertCircle, Clock } from "lucide-react-native";
import { Progress } from "./ui/progress";
import { api } from "@/lib/api";

interface SubscriptionInfo {
  status: string;
  plan: {
    name: string;
    price: number;
    interval: string;
  } | null;
  currentPeriodEnd: string | null;
  freeTrialEndsAt: string | null;
  maxUsersForSubscription: number;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionStatus() {
  const [subscriptionInfo, setSubscriptionInfo] =
    useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionInfo();
    const interval = setInterval(fetchSubscriptionInfo, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await api.get("/api/subscription-info");
      const data = response.data;
      console.log("🚀 ~ fetchSubscriptionInfo ~ data:", data);
      setSubscriptionInfo(data);

      if (data.status !== "active" && data.status !== "trialing") {
        setShowWarningModal(true);
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      active: { label: "Active", color: "#22c55e" },
      trialing: { label: "Trial", color: "#3b82f6" },
      past_due: { label: "Past Due", color: "#ef4444" },
      canceled: { label: "Canceled", color: "#ef4444" },
      never: { label: "No Subscription", color: "#ef4444" },
    };

    const statusConfig = statusMap[status] || {
      label: status,
      color: "#6b7280",
    };
    return (
      <View style={[styles.badge, { backgroundColor: statusConfig.color }]}>
        <Text style={styles.badgeText}>{statusConfig.label}</Text>
      </View>
    );
  };

  const getTrialProgress = () => {
    if (!subscriptionInfo?.freeTrialEndsAt) return null;

    const trialEnd = new Date(subscriptionInfo.freeTrialEndsAt);
    const now = new Date();
    const totalTrialDays = 14;
    const daysLeft = Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const progress = ((totalTrialDays - daysLeft) / totalTrialDays) * 100;

    return (
      <View style={styles.trialProgress}>
        <View style={styles.trialHeader}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.trialText}>{daysLeft}d left</Text>
        </View>
        <Progress value={progress} style={styles.progressBar} />
      </View>
    );
  };

  const handleManageSubscription = () => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_BASE_URL}/settings/billing`);
  };

  //   if (loading || !subscriptionInfo) return null;

  const isTrial = subscriptionInfo?.status === "trialing";
  const isExpiring = subscriptionInfo?.cancelAtPeriodEnd;
  const isInactive =
    subscriptionInfo?.status !== "active" &&
    subscriptionInfo?.status !== "trialing";
  const showWarning = isTrial || isExpiring || isInactive;

  if (!showWarning) return null;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.planName}>
            {subscriptionInfo?.plan?.name || "No Plan"}
          </Text>
          {subscriptionInfo && getStatusBadge(subscriptionInfo.status)}
        </View>

        <View
          style={[
            styles.warning,
            isInactive ? styles.warningCritical : styles.warningNormal,
          ]}
        >
          <AlertCircle size={16} color={isInactive ? "#fff" : "#ef4444"} />
          <Text
            style={[
              styles.warningText,
              isInactive && styles.warningTextCritical,
            ]}
          >
            {isInactive
              ? "Subscription inactive - Please upgrade"
              : isTrial
                ? "Trial ending"
                : "Subscription ending"}
          </Text>
        </View>

        {getTrialProgress()}

        <TouchableOpacity
          style={[styles.button, isInactive && styles.buttonCritical]}
          onPress={handleManageSubscription}
        >
          <Text
            style={[styles.buttonText, isInactive && styles.buttonTextCritical]}
          >
            {isInactive ? "Upgrade Now" : isTrial ? "Upgrade" : "Manage Plan"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Subscription Status</Text>
            <Text style={styles.modalText}>
              {isInactive
                ? "Your subscription is inactive. Please upgrade to continue using the app."
                : isTrial
                  ? "Your trial period is ending soon. Upgrade to continue using all features."
                  : "Your subscription is ending soon. Please renew to continue using the app."}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleManageSubscription}
              >
                <Text style={styles.modalButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
              {(subscriptionInfo?.status === "active" ||
                subscriptionInfo?.status === "trialing") && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setShowWarningModal(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningNormal: {
    backgroundColor: "#fee2e2",
  },
  warningCritical: {
    backgroundColor: "#ef4444",
  },
  warningText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#ef4444",
  },
  warningTextCritical: {
    color: "#fff",
  },
  trialProgress: {
    marginBottom: 16,
  },
  trialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  trialText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  buttonCritical: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  buttonTextCritical: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1f2937",
  },
  modalText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#2563eb",
    marginRight: 8,
  },
  modalButtonSecondary: {
    backgroundColor: "#f3f4f6",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  modalButtonTextSecondary: {
    color: "#1f2937",
    fontWeight: "500",
  },
});
