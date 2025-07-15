import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image as ExpoImage } from "expo-image";

// Type assertion to fix ReactNode compatibility
const ExpoImageComponent = ExpoImage as any;
import {
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
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

interface OfflineUploadQueueProps {
  projectId: string;
}

export default function OfflineUploadQueue({
  projectId,
}: OfflineUploadQueueProps) {
  const { isOffline } = useNetworkStatus();
  const {
    uploadQueue,
    isProcessing,
    getPendingUploads,
    getFailedUploads,
    getCompletedUploads,
    retryUpload,
    retryAllFailed,
    clearCompleted,
    clearFailed,
    removeFromQueue,
  } = useOfflineUploadsStore();

  // Filter uploads for this project
  const projectUploads = uploadQueue.filter(
    (upload) => upload.projectId === projectId
  );
  const pendingUploads = getPendingUploads().filter(
    (upload) => upload.projectId === projectId
  );
  const failedUploads = getFailedUploads().filter(
    (upload) => upload.projectId === projectId
  );
  const completedUploads = getCompletedUploads().filter(
    (upload) => upload.projectId === projectId
  );

  const handleRetryAll = () => {
    retryAllFailed();
    toast.success("Retrying all failed uploads");
  };

  const handleClearCompleted = () => {
    clearCompleted();
    toast.success("Cleared completed uploads");
  };

  const handleClearFailed = () => {
    clearFailed();
    toast.success("Cleared failed uploads");
  };

  const handleRetryUpload = (id: string) => {
    retryUpload(id);
    toast.success("Retrying upload");
  };

  const handleRemoveUpload = (id: string) => {
    removeFromQueue(id);
    toast.success("Removed from queue");
  };

  if (projectUploads.length === 0) {
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
            {isOffline ? "Offline Uploads" : "Upload Queue"}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>{pendingUploads.length} pending</Text>
          {failedUploads.length > 0 && (
            <Text style={[styles.statText, styles.failedText]}>
              {failedUploads.length} failed
            </Text>
          )}
        </View>
      </View>

      {/* Status Bar */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <WifiOffComponent size={16} color="#fff" />
          <Text style={styles.offlineText}>
            You're offline. Images will be uploaded when you're back online.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {failedUploads.length > 0 && !isOffline && (
          <TouchableOpacity
            style={[styles.actionButton, styles.retryButton]}
            onPress={handleRetryAll}
            disabled={isProcessing}
          >
            <RefreshCwComponent size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Retry All</Text>
          </TouchableOpacity>
        )}
        {completedUploads.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearCompleted}
          >
            <Text style={styles.actionButtonText}>Clear Completed</Text>
          </TouchableOpacity>
        )}
        {failedUploads.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearFailed}
          >
            <Text style={styles.actionButtonText}>Clear Failed</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Upload List */}
      <ScrollView
        style={styles.uploadList}
        showsVerticalScrollIndicator={false}
      >
        {projectUploads.map((upload) => (
          <View key={upload.id} style={styles.uploadItem}>
            <View style={styles.uploadImageContainer}>
              <ExpoImageComponent
                source={{ uri: upload.imageUrl }}
                style={styles.uploadImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            </View>

            <View style={styles.uploadInfo}>
              <View style={styles.uploadHeader}>
                <View style={styles.statusContainer}>
                  {getStatusIcon(upload.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(upload.status) },
                    ]}
                  >
                    {getStatusText(upload.status)}
                  </Text>
                </View>
                <Text style={styles.uploadTime}>
                  {new Date(upload.createdAt).toLocaleTimeString()}
                </Text>
              </View>

              {upload.error && (
                <Text style={styles.errorText} numberOfLines={2}>
                  {upload.error}
                </Text>
              )}

              {upload.retryCount > 0 && (
                <Text style={styles.retryText}>
                  Retry {upload.retryCount}/3
                </Text>
              )}
            </View>

            <View style={styles.uploadActions}>
              {upload.status === "failed" && !isOffline && (
                <TouchableOpacity
                  style={styles.retryIconButton}
                  onPress={() => handleRetryUpload(upload.id)}
                  disabled={isProcessing}
                >
                  <RefreshCwComponent size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveUpload(upload.id)}
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
          <Text style={styles.processingText}>Processing uploads...</Text>
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
  uploadList: {
    maxHeight: 300,
  },
  uploadItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  uploadImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  uploadImage: {
    width: "100%",
    height: "100%",
  },
  uploadInfo: {
    flex: 1,
  },
  uploadHeader: {
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
  uploadTime: {
    fontSize: 10,
    color: "#64748b",
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
  uploadActions: {
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
