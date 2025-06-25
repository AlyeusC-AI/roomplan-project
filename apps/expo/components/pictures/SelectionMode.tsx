import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import { X, FolderInput, Tag, Trash2, Download } from "lucide-react-native";

interface SelectionModeProps {
  selectedPhotos: any[];
  onClearSelection: () => void;
  onAssignRoom: () => void;
  onAssignTags: () => void;
  onDelete: () => void;
  onSaveToPhone: () => void;
  isDeleting?: boolean;
  isAssigningRoom?: boolean;
}

export default function SelectionMode({
  selectedPhotos,
  onClearSelection,
  onAssignRoom,
  onAssignTags,
  onDelete,
  onSaveToPhone,
  isDeleting = false,
  isAssigningRoom = false,
}: SelectionModeProps) {
  const handleDeletePress = () => {
    Alert.alert(
      "Delete Images",
      `Are you sure you want to delete ${selectedPhotos.length} image${selectedPhotos.length > 1 ? "s" : ""}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{selectedPhotos.length}</Text>
          </View>
          <Text style={styles.title}>{selectedPhotos.length} selected</Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAssignRoom}
            disabled={isAssigningRoom}
          >
            <FolderInput size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onAssignTags}>
            <Tag size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onSaveToPhone}>
            <Download size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            disabled={isDeleting}
          >
            <Trash2 size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClearSelection}
            disabled={isDeleting || isAssigningRoom}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#192d43",
    borderBottomWidth: 1,
    borderBottomColor: "#0f1a2a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
