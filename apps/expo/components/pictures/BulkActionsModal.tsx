import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  X,
  FolderInput,
  Tag,
  Loader2,
  Plus,
  Pencil,
  Trash,
} from "lucide-react-native";
import { useGetRooms, useGetTags } from "@service-geek/api-client";
import { useGlobalSearchParams } from "expo-router";
import {
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
} from "@service-geek/api-client";

// Type assertion to fix ReactNode compatibility
const XIcon = X as any;
const FolderInputIcon = FolderInput as any;
const TagIcon = Tag as any;
const PlusIcon = Plus as any;
const PencilIcon = Pencil as any;
const TrashIcon = Trash as any;

// Predefined color palette - 12 carefully chosen colors
const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6B7280", // Gray
  "#059669", // Emerald
  "#DC2626", // Rose
];

interface BulkActionsModalProps {
  visible: boolean;
  onClose: () => void;
  action: "room" | "tags";
  selectedPhotos: any[];
  onAssignRoom?: (roomId: string) => void;
  onAssignTags?: (tagNames: string[]) => void;
  isAssigningRoom?: boolean;
  isAssigningTags?: boolean;
}

export default function BulkActionsModal({
  visible,
  onClose,
  action,
  selectedPhotos,
  onAssignRoom,
  onAssignTags,
  isAssigningRoom = false,
  isAssigningTags = false,
}: BulkActionsModalProps) {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState(COLOR_PALETTE[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [isRoom, setIsRoom] = useState(false);

  // Fetch data using hooks
  const { data: rooms = [], isLoading: loadingRooms } = useGetRooms(
    projectId as string
  );
  const { data: tags = [], isLoading: loadingTags } = useGetTags({
    type: "IMAGE",
  });

  const { mutate: createTag } = useCreateTag();
  const { mutate: updateTag } = useUpdateTag();
  const { mutate: deleteTag } = useDeleteTag();
  const { mutate: createRoom } = useCreateRoom();
  const { mutate: updateRoom } = useUpdateRoom();
  const { mutate: deleteRoom } = useDeleteRoom();

  // Debug logging
  console.log("BulkActionsModal - action:", action);
  console.log("BulkActionsModal - rooms:", rooms);
  console.log("BulkActionsModal - tags:", tags);
  console.log("BulkActionsModal - visible:", visible);
  console.log("BulkActionsModal - projectId:", projectId);

  const handleAssignRoom = () => {
    if (selectedRoom && onAssignRoom) {
      onAssignRoom(selectedRoom);
    }
  };

  const handleAssignTags = () => {
    if (selectedTags.length > 0 && onAssignTags) {
      onAssignTags(selectedTags);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const getTitle = () => {
    if (action === "room") {
      return `Assign Room to ${selectedPhotos.length} Image${selectedPhotos.length > 1 ? "s" : ""}`;
    } else {
      return `Assign Tags to ${selectedPhotos.length} Image${selectedPhotos.length > 1 ? "s" : ""}`;
    }
  };

  const getDescription = () => {
    if (action === "room") {
      return "Select a room to assign to the selected images";
    } else {
      return "Select tags to assign to the selected images";
    }
  };

  const isLoading = action === "room" ? loadingRooms : loadingTags;

  const openAddModal = (room: boolean) => {
    setIsRoom(room);
    setEditValue("");
    setEditColor(COLOR_PALETTE[0]);
    setEditId(null);
    setShowAddModal(true);
  };
  const openEditModal = (item: any, room: boolean) => {
    setIsRoom(room);
    setEditValue(item.name);
    setEditColor(item.color || COLOR_PALETTE[0]);
    setEditId(item.id);
    setShowEditModal(true);
  };
  const handleSave = () => {
    if (isRoom) {
      if (editId) updateRoom({ id: editId, data: { name: editValue } });
      else createRoom({ name: editValue, projectId });
    } else {
      if (editId)
        updateTag({ id: editId, data: { name: editValue, color: editColor } });
      else createTag({ name: editValue, color: editColor, type: "IMAGE" });
    }
    setShowAddModal(false);
    setShowEditModal(false);
  };
  const handleDelete = (item: any, room: boolean) => {
    Alert.alert(
      `Delete ${room ? "Room" : "Tag"}`,
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (room) deleteRoom(item.id);
            else deleteTag(item.id);
          },
        },
      ]
    );
  };

  // Type guard helpers
  const isTag = (
    item: any
  ): item is { id: string; name: string; color: string } => !!item.color;
  const isRoomType = (item: any): item is { id: string; name: string } =>
    !item.color;

  const renderColorPicker = () => {
    return (
      <View style={styles.colorPickerContainer}>
        <Text style={styles.colorPickerLabel}>Choose a color:</Text>
        <View style={styles.colorGrid}>
          {COLOR_PALETTE.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                editColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setEditColor(color)}
            >
              {editColor === color && (
                <View style={styles.colorCheckmark}>
                  <Text style={styles.colorCheckmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRoomList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      );
    }

    if (rooms.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No rooms available</Text>
          <Text style={styles.emptyStateSubtext}>
            Create a room to get started
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddModal(true)}
          >
            <PlusIcon size={16} color="#1e88e5" />
            <Text style={styles.addButtonText}>Add Room</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.optionsContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.roomList}>
          {rooms.map((room) => (
            <View key={room.id} style={styles.roomItem}>
              <TouchableOpacity
                style={[
                  styles.roomOption,
                  selectedRoom === room.id && styles.selectedRoomOption,
                ]}
                onPress={() => setSelectedRoom(room.id)}
              >
                <FolderInputIcon
                  size={20}
                  color={selectedRoom === room.id ? "#fff" : "#1e88e5"}
                />
                <Text
                  style={[
                    styles.roomOptionText,
                    selectedRoom === room.id && styles.selectedRoomOptionText,
                  ]}
                >
                  {room.name}
                </Text>
              </TouchableOpacity>
              <View style={styles.roomActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(room, true)}
                >
                  <PencilIcon size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(room, true)}
                >
                  <TrashIcon size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => openAddModal(true)}
        >
          <PlusIcon size={16} color="#1e88e5" />
          <Text style={styles.addNewButtonText}>Add New Room</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderTagList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Loading tags...</Text>
        </View>
      );
    }

    if (tags.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tags available</Text>
          <Text style={styles.emptyStateSubtext}>
            Create tags to organize your images
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openAddModal(false)}
          >
            <PlusIcon size={16} color="#1e88e5" />
            <Text style={styles.addButtonText}>Add Tag</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.optionsContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.tagList}>
          {tags.map((tag) => (
            <View key={tag.id} style={styles.tagItem}>
              <TouchableOpacity
                style={[
                  styles.tagOption,
                  selectedTags.includes(tag.name) && styles.selectedTagOption,
                ]}
                onPress={() => toggleTag(tag.name)}
              >
                <View
                  style={[styles.tagColor, { backgroundColor: tag.color }]}
                />
                <Text
                  style={[
                    styles.tagOptionText,
                    selectedTags.includes(tag.name) &&
                      styles.selectedTagOptionText,
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
              <View style={styles.tagActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(tag, false)}
                >
                  <PencilIcon size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(tag, false)}
                >
                  <TrashIcon size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={styles.addNewButton}
          onPress={() => openAddModal(false)}
        >
          <PlusIcon size={16} color="#1e88e5" />
          <Text style={styles.addNewButtonText}>Add New Tag</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              {action === "room" ? (
                <FolderInputIcon size={24} color="#1e88e5" />
              ) : (
                <TagIcon size={24} color="#1e88e5" />
              )}
              <Text style={styles.modalTitle}>{getTitle()}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>{getDescription()}</Text>
            {action === "room" ? renderRoomList() : renderTagList()}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isAssigningRoom || isAssigningTags}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                ((action === "room" && !selectedRoom) ||
                  (action === "tags" && selectedTags.length === 0) ||
                  isAssigningRoom ||
                  isAssigningTags ||
                  isLoading) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={action === "room" ? handleAssignRoom : handleAssignTags}
              disabled={
                (action === "room" && !selectedRoom) ||
                (action === "tags" && selectedTags.length === 0) ||
                isAssigningRoom ||
                isAssigningTags ||
                isLoading
              }
            >
              {isAssigningRoom || isAssigningTags ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {action === "room" ? "Assign Room" : "Assign Tags"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
      >
        <View style={styles.nestedModalOverlay}>
          <View style={styles.nestedModalContent}>
            <Text style={styles.nestedModalTitle}>
              {isRoom
                ? editId
                  ? "Edit Room"
                  : "Add Room"
                : editId
                  ? "Edit Tag"
                  : "Add Tag"}
            </Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              placeholder={isRoom ? "Room name" : "Tag name"}
              style={styles.textInput}
            />
            {!isRoom && renderColorPicker()}
            <View style={styles.nestedModalFooter}>
              <TouchableOpacity
                style={styles.nestedCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
              >
                <Text style={styles.nestedCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nestedSaveButton}
                onPress={handleSave}
              >
                <Text style={styles.nestedSaveButtonText}>
                  {editId ? "Save" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    height: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalBody: {
    padding: 16,
    flex: 1,
    minHeight: 0,
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  optionsContainer: {
    flex: 1,
    minHeight: 0,
  },
  roomList: {
    gap: 8,
  },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    gap: 8,
  },
  selectedRoomOption: {
    backgroundColor: "#1e88e5",
    borderColor: "#1e88e5",
  },
  roomOptionText: {
    fontSize: 16,
    color: "#1e293b",
    flex: 1,
  },
  selectedRoomOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  roomActions: {
    flexDirection: "row",
    gap: 4,
  },
  tagList: {
    gap: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    gap: 8,
  },
  selectedTagOption: {
    backgroundColor: "#1e88e5",
    borderColor: "#1e88e5",
  },
  tagColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  tagOptionText: {
    fontSize: 14,
    color: "#1e293b",
    flex: 1,
  },
  selectedTagOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  tagActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e88e5",
    borderStyle: "dashed",
    marginTop: 16,
    gap: 8,
  },
  addNewButtonText: {
    fontSize: 14,
    color: "#1e88e5",
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
    marginTop: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 8,
  },
  nestedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  nestedModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: "90%",
  },
  nestedModalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#1e293b",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  nestedModalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  nestedCancelButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },
  nestedCancelButtonText: {
    color: "#1e293b",
    fontWeight: "600",
  },
  nestedSaveButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },
  nestedSaveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColorOption: {
    borderColor: "#1e88e5",
    borderWidth: 3,
    shadowColor: "#1e88e5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheckmark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  colorCheckmarkText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
