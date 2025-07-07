import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Clock,
  AlertCircle,
  Thermometer,
  Droplets,
} from "lucide-react-native";
import { useOfflineReadingsStore } from "@/lib/state/offline-readings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";

// Type assertions to fix ReactNode compatibility
const WifiComponent = Wifi as any;
const WifiOffComponent = WifiOff as any;
const CheckCircleComponent = CheckCircle as any;
const XCircleComponent = XCircle as any;
const RefreshCwComponent = RefreshCw as any;
const UploadComponent = Upload as any;
const ClockComponent = Clock as any;
const AlertCircleComponent = AlertCircle as any;
const ThermometerComponent = Thermometer as any;
const DropletsComponent = Droplets as any;

interface OfflineReadingsQueueProps {
  projectId: string;
}

export default function OfflineReadingsQueue({
  projectId,
}: OfflineReadingsQueueProps) {
  const { isOffline } = useNetworkStatus();
  const {
    readingsQueue,
    isProcessing,
    getPendingReadings,
    getFailedReadings,
    getCompletedReadings,
    retryReading,
    retryAllFailed,
    clearCompleted,
    clearFailed,
    removeFromQueue,
  } = useOfflineReadingsStore();

  // Filter readings for this project
  const projectReadings = readingsQueue.filter(
    (reading) => reading.projectId === projectId
  );
  const pendingReadings = getPendingReadings().filter(
    (reading) => reading.projectId === projectId
  );
  const failedReadings = getFailedReadings().filter(
    (reading) => reading.projectId === projectId
  );
  const completedReadings = getCompletedReadings().filter(
    (reading) => reading.projectId === projectId
  );

  const handleRetryAll = () => {
    retryAllFailed();
    toast.success("Retrying all failed readings");
  };

  const handleClearCompleted = () => {
    clearCompleted();
    toast.success("Cleared completed readings");
  };

  const handleClearFailed = () => {
    clearFailed();
    toast.success("Cleared failed readings");
  };

  const handleRetryReading = (id: string) => {
    retryReading(id);
    toast.success("Retrying reading");
  };

  const handleRemoveReading = (id: string) => {
    removeFromQueue(id);
    toast.success("Removed from queue");
  };

  if (projectReadings.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleComponent size={16} color="#10b981" />;
      case "failed":
        return <XCircleComponent size={16} color="#ef4444" />;
      case "uploading":
        return <UploadComponent size={16} color="#3b82f6" />;
      case "pending":
        return <ClockComponent size={16} color="#f59e0b" />;
      default:
        return <AlertCircleComponent size={16} color="#6b7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "failed":
        return "#ef4444";
      case "uploading":
        return "#3b82f6";
      case "pending":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "uploading":
        return "Uploading";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isOffline ? (
            <WifiOffComponent size={20} color="#ef4444" />
          ) : (
            <WifiComponent size={20} color="#10b981" />
          )}
          <Text style={styles.headerTitle}>
            {isOffline ? "Offline Readings" : "Readings Queue"}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>{pendingReadings.length} pending</Text>
          {failedReadings.length > 0 && (
            <Text style={[styles.statText, styles.failedText]}>
              {failedReadings.length} failed
            </Text>
          )}
        </View>
      </View>

      {/* Status Bar */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <WifiOffComponent size={16} color="#92400e" />
          <Text style={styles.offlineText}>
            You're offline. Readings will be uploaded when you're back online.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {failedReadings.length > 0 && !isOffline && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleRetryAll}
            disabled={isProcessing}
          >
            <RefreshCwComponent size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Retry All</Text>
          </TouchableOpacity>
        )}
        {completedReadings.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearCompleted}
          >
            <Text style={styles.actionButtonText}>Clear Completed</Text>
          </TouchableOpacity>
        )}
        {failedReadings.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearFailed}
          >
            <Text style={styles.actionButtonText}>Clear Failed</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Readings List */}
      <ScrollView
        style={styles.readingsList}
        showsVerticalScrollIndicator={false}
      >
        {projectReadings.map((reading) => (
          <View key={reading.id} style={styles.readingItem}>
            <View style={styles.readingIconContainer}>
              <ThermometerComponent size={20} color="#3b82f6" />
            </View>

            <View style={styles.readingInfo}>
              <View style={styles.readingHeader}>
                <View style={styles.statusContainer}>
                  {getStatusIcon(reading.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(reading.status) },
                    ]}
                  >
                    {getStatusText(reading.status)}
                  </Text>
                </View>
                <Text style={styles.readingTime}>
                  {new Date(reading.createdAt).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.readingValues}>
                <View style={styles.valueContainer}>
                  <ThermometerComponent size={14} color="#ef4444" />
                  <Text style={styles.valueText}>{reading.temperature}°C</Text>
                </View>
                <View style={styles.valueContainer}>
                  <DropletsComponent size={14} color="#3b82f6" />
                  <Text style={styles.valueText}>{reading.humidity}%</Text>
                </View>
              </View>

              {reading.error && (
                <Text style={styles.errorText} numberOfLines={2}>
                  {reading.error}
                </Text>
              )}

              {reading.retryCount > 0 && (
                <Text style={styles.retryText}>
                  Retry {reading.retryCount}/3
                </Text>
              )}
            </View>

            <View style={styles.readingActions}>
              {reading.status === "failed" && !isOffline && (
                <TouchableOpacity
                  style={styles.retryIconButton}
                  onPress={() => handleRetryReading(reading.id)}
                  disabled={isProcessing}
                >
                  <RefreshCwComponent size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveReading(reading.id)}
              >
                <XCircleComponent size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Processing Indicator */}
      {isProcessing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.processingText}>Processing readings...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  headerStats: {
    flexDirection: "row",
    gap: 8,
  },
  statText: {
    fontSize: 12,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  failedText: {
    color: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  offlineText: {
    fontSize: 14,
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
  },
  clearButton: {
    backgroundColor: "#6b7280",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  readingsList: {
    maxHeight: 300,
  },
  readingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  readingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  readingInfo: {
    flex: 1,
  },
  readingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  readingTime: {
    fontSize: 10,
    color: "#64748b",
  },
  readingValues: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    marginBottom: 2,
  },
  retryText: {
    fontSize: 10,
    color: "#f59e0b",
  },
  readingActions: {
    flexDirection: "row",
    gap: 8,
  },
  retryIconButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  processingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  processingText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
});
