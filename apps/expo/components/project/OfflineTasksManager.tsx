import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Upload,
  BookOpen,
  Edit3,
  WifiOff,
  Wifi,
  Image as ImageIcon,
  FileText,
} from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { useOfflineTasksStore, OfflineTask } from "@/lib/state/offline-tasks";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";
import { offlineNotesProcessor } from "@/lib/services/offline-notes-processor";

// Type assertion to fix ReactNode compatibility
const ExpoImageComponent = ExpoImage as any;
const ImageIconComponent = ImageIcon as any;
const FileTextComponent = FileText as any;

// Type assertions to fix ReactNode compatibility
const ClockComponent = Clock as any;
const CheckCircleComponent = CheckCircle as any;
const XCircleComponent = XCircle as any;
const PlayComponent = Play as any;
const RefreshCwComponent = RefreshCw as any;
const Trash2Component = Trash2 as any;
const AlertTriangleComponent = AlertTriangle as any;
const UploadComponent = Upload as any;
const BookOpenComponent = BookOpen as any;
const Edit3Component = Edit3 as any;
const WifiOffComponent = WifiOff as any;
const WifiComponent = Wifi as any;

interface OfflineTasksManagerProps {
  projectId?: string;
}

export default function OfflineTasksManager({
  projectId,
}: OfflineTasksManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OfflineTask | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOffline } = useNetworkStatus();

  const {
    tasks,
    isProcessing,
    getPendingTasks,
    getFailedTasks,
    getCompletedTasks,
    getTasksByProject,
    executeTask,
    executeAllPending,
    retryTask,
    retryAllFailed,
    removeTask,
    clearCompleted,
    clearFailed,
    syncWithExistingStores,
  } = useOfflineTasksStore();

  // Sync with existing stores on mount
  useEffect(() => {
    syncWithExistingStores();
  }, []);

  const filteredTasks = projectId ? getTasksByProject(projectId) : tasks;
  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending"
  );
  const failedTasks = filteredTasks.filter((task) => task.status === "failed");
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed"
  );

  const getTaskIcon = (type: OfflineTask["type"]) => {
    switch (type) {
      case "upload":
        return <UploadComponent size={16} color="#2563eb" />;
      case "reading":
        return <BookOpenComponent size={16} color="#059669" />;
      case "edit":
        return <Edit3Component size={16} color="#dc2626" />;
      case "note":
        return <FileTextComponent size={16} color="#7c3aed" />;
      case "note-edit":
        return <Edit3Component size={16} color="#dc2626" />;
      case "scope-edit":
        return <Edit3Component size={16} color="#0891b2" />;
      default:
        return <AlertTriangleComponent size={16} color="#f59e0b" />;
    }
  };

  const getStatusIcon = (status: OfflineTask["status"]) => {
    switch (status) {
      case "pending":
        return <ClockComponent size={16} color="#f59e0b" />;
      case "processing":
        return <PlayComponent size={16} color="#2563eb" />;
      case "completed":
        return <CheckCircleComponent size={16} color="#059669" />;
      case "failed":
        return <XCircleComponent size={16} color="#dc2626" />;
      default:
        return <AlertTriangleComponent size={16} color="#f59e0b" />;
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    try {
      await executeTask(taskId);
      toast.success(
        "Task executed successfully and will be cleared automatically"
      );
    } catch (error) {
      toast.error("Failed to execute task");
    }
  };

  const handleExecuteAll = async () => {
    if (isOffline) {
      toast.error("Cannot execute tasks while offline");
      return;
    }

    try {
      await executeAllPending();
      toast.success(
        "All pending tasks executed and will be cleared automatically"
      );
    } catch (error) {
      toast.error("Failed to execute some tasks");
    }
  };

  const handleRetryAll = () => {
    retryAllFailed();
    toast.success("All failed tasks queued for retry");
  };

  const handleRetryTask = (taskId: string) => {
    retryTask(taskId);
    toast.success("Task queued for retry");
  };

  const handleRemoveTask = (taskId: string) => {
    removeTask(taskId);
    toast.success("Task removed");
  };

  const handleImagePreview = (imagePath: string) => {
    setSelectedImage(imagePath);
    setShowImagePreview(true);
  };

  const TaskItem = ({ task }: { task: OfflineTask }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskHeader}>
        <View style={styles.taskIconContainer}>{getTaskIcon(task.type)}</View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <Text style={styles.taskDate}>
            {new Date(task.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.taskHeaderActions}>
          <View style={styles.taskStatus}>{getStatusIcon(task.status)}</View>
          <TouchableOpacity
            style={styles.headerRemoveButton}
            onPress={() => handleRemoveTask(task.id)}
          >
            <Trash2Component size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Preview for Upload Tasks */}
      {task.type === "upload" && task.metadata.imagePath && (
        <TouchableOpacity
          style={styles.imagePreviewContainer}
          onPress={() => handleImagePreview(task.metadata.imagePath!)}
          activeOpacity={0.8}
        >
          <ExpoImageComponent
            source={{ uri: task.metadata.imagePath }}
            style={styles.imagePreview}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={styles.imageOverlay}>
            <ImageIconComponent size={16} color="#fff" />
            <Text style={styles.imageOverlayText}>Tap to preview</Text>
          </View>
        </TouchableOpacity>
      )}

      {task.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{task.error}</Text>
        </View>
      )}

      <View style={styles.taskActions}>
        {task.status === "pending" && !isOffline && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleExecuteTask(task.id)}
            disabled={isProcessing}
          >
            <PlayComponent size={14} color="#2563eb" />
            <Text style={styles.actionButtonText}>Execute</Text>
          </TouchableOpacity>
        )}

        {task.status === "failed" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRetryTask(task.id)}
          >
            <RefreshCwComponent size={14} color="#f59e0b" />
            <Text style={styles.actionButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const totalTasks = filteredTasks.length;
  const hasPendingTasks = pendingTasks.length > 0;
  const hasFailedTasks = failedTasks.length > 0;

  if (totalTasks === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.offlineIndicator}>
              <WifiOffComponent size={16} color="#ef4444" />
              <Text style={styles.offlineText}>Offline Tasks</Text>
            </View>
            <Text style={styles.taskCount}>
              {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Quick summary */}
        <View style={styles.summary}>
          {hasPendingTasks && (
            <View style={styles.summaryItem}>
              <ClockComponent size={14} color="#f59e0b" />
              <Text style={styles.summaryText}>
                {pendingTasks.length} pending
              </Text>
            </View>
          )}

          {hasFailedTasks && (
            <View style={styles.summaryItem}>
              <XCircleComponent size={14} color="#dc2626" />
              <Text style={styles.summaryText}>
                {failedTasks.length} failed
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        {!isOffline && (hasPendingTasks || hasFailedTasks) && (
          <View style={styles.actionButtons}>
            {hasPendingTasks && (
              <TouchableOpacity
                style={[styles.actionButton, styles.executeAllButton]}
                onPress={handleExecuteAll}
                disabled={isProcessing}
              >
                <PlayComponent size={16} color="#fff" />
                <Text style={styles.executeAllText}>
                  {isProcessing ? "Processing..." : "Execute All"}
                </Text>
              </TouchableOpacity>
            )}

            {hasFailedTasks && (
              <TouchableOpacity
                style={[styles.actionButton, styles.retryAllButton]}
                onPress={handleRetryAll}
              >
                <RefreshCwComponent size={16} color="#fff" />
                <Text style={styles.retryAllText}>Retry All</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Full Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Offline Tasks</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <XCircleComponent size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Pending ({pendingTasks.length})
                </Text>
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </View>
            )}

            {/* Failed Tasks */}
            {failedTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Failed ({failedTasks.length})
                </Text>
                {failedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </View>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Completed ({completedTasks.length}) - Auto-clearing soon
                </Text>
                {completedTasks.slice(0, 5).map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
                {completedTasks.length > 5 && (
                  <Text style={styles.moreText}>
                    ... and {completedTasks.length - 5} more
                  </Text>
                )}
              </View>
            )}

            {totalTasks === 0 && (
              <View style={styles.emptyState}>
                <WifiComponent size={48} color="#94a3b8" />
                <Text style={styles.emptyStateText}>No offline tasks</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Image Preview</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowImagePreview(false)}
              >
                <XCircleComponent size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <ExpoImageComponent
                source={{ uri: selectedImage }}
                style={styles.fullImagePreview}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            )}
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
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    gap: 8,
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  taskCount: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "500",
  },
  summary: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryText: {
    fontSize: 12,
    color: "#64748b",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  executeAllButton: {
    backgroundColor: "#2563eb",
  },
  executeAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  retryAllButton: {
    backgroundColor: "#f59e0b",
  },
  retryAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#fef2f2",
  },
  removeButtonText: {
    color: "#dc2626",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
    gap: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#64748b",
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  taskIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 11,
    color: "#94a3b8",
  },
  taskStatus: {
    justifyContent: "center",
    alignItems: "center",
  },
  taskHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRemoveButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
  },
  taskActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  moreText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 12,
  },
  imagePreviewContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  imagePreview: {
    width: "100%",
    height: 120,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  imageModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  fullImagePreview: {
    width: "100%",
    height: 300,
  },
});
