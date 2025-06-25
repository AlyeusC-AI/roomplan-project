import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  X,
  Tag,
  Loader2,
  Plus,
  Pencil,
  Trash,
  Check,
  Search,
} from "lucide-react-native";
import {
  useGetTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useAddImageTags,
  useRemoveImageTags,
} from "@service-geek/api-client";
import { toast } from "sonner-native";

// Type assertion to fix ReactNode compatibility
const XIcon = X as any;
const TagIcon = Tag as any;
const PlusIcon = Plus as any;
const PencilIcon = Pencil as any;
const TrashIcon = Trash as any;
const CheckIcon = Check as any;
const SearchIcon = Search as any;

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

interface ImageTagsModalProps {
  visible: boolean;
  onClose: () => void;
  imageId: string;
  currentTags: any[];
  onTagsUpdated: () => void;
}

export default function ImageTagsModal({
  visible,
  onClose,
  imageId,
  currentTags,
  onTagsUpdated,
}: ImageTagsModalProps) {
  const { data: availableTags = [], isLoading } = useGetTags({ type: "IMAGE" });
  const { mutate: createTag, isPending: isCreatingTag } = useCreateTag();
  const { mutate: updateTag, isPending: isUpdatingTag } = useUpdateTag();
  const { mutate: deleteTag, isPending: isDeletingTag } = useDeleteTag();
  const { mutate: addImageTags, isPending: isAddingTags } = useAddImageTags();
  const { mutate: removeImageTags, isPending: isRemovingTags } =
    useRemoveImageTags();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editColor, setEditColor] = useState(COLOR_PALETTE[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize selected tags when modal opens
  React.useEffect(() => {
    if (visible) {
      setSelectedTags(currentTags.map((tag) => tag.name));
      setSearchQuery(""); // Reset search when modal opens
    }
  }, [visible, currentTags]);

  // Filter tags based on search query
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if search query doesn't match any existing tags
  const isSearchQueryNew =
    searchQuery.trim() &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === searchQuery.toLowerCase()
    );

  const handleSave = () => {
    if (!editValue.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    if (editId) {
      // Update existing tag
      updateTag(
        {
          id: editId,
          data: {
            name: editValue.trim(),
            color: editColor,
          },
        },
        {
          onSuccess: () => {
            toast.success("Tag updated successfully");
            setShowEditModal(false);
            setEditValue("");
            setEditId(null);
          },
          onError: () => {
            toast.error("Failed to update tag");
          },
        }
      );
    } else {
      // Create new tag
      createTag(
        {
          name: editValue.trim(),
          color: editColor,
          type: "IMAGE",
        },
        {
          onSuccess: () => {
            toast.success("Tag created successfully");
            setShowAddModal(false);
            setEditValue("");
          },
          onError: () => {
            toast.error("Failed to create tag");
          },
        }
      );
    }
  };

  const createTagFromSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    createTag(
      {
        name: searchQuery.trim(),
        color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
        type: "IMAGE",
      },
      {
        onSuccess: () => {
          toast.success("Tag created successfully");
          // Automatically select the newly created tag
          setSelectedTags((prev) => [...prev, searchQuery.trim()]);
          setSearchQuery("");
        },
        onError: () => {
          toast.error("Failed to create tag");
        },
      }
    );
  };

  const openAddModal = () => {
    setEditValue("");
    setEditColor(COLOR_PALETTE[0]);
    setEditId(null);
    setShowAddModal(true);
  };

  const openEditModal = (tag: any) => {
    setEditValue(tag.name);
    setEditColor(tag.color);
    setEditId(tag.id);
    setShowEditModal(true);
  };

  const handleDelete = (tag: any) => {
    Alert.alert(
      "Delete Tag",
      `Are you sure you want to delete "${tag.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTag(tag.id, {
              onSuccess: () => {
                toast.success("Tag deleted successfully");
              },
              onError: () => {
                toast.error("Failed to delete tag");
              },
            });
          },
        },
      ]
    );
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((name) => name !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAssignTags = () => {
    // if (selectedTags.length === 0) {
    //   toast.error("Please select at least one tag");
    //   return;
    // }

    // Get current tag names
    const currentTagNames = currentTags.map((tag) => tag.name);

    // Find tags to add and remove
    const tagsToAdd = selectedTags.filter(
      (tagName) => !currentTagNames.includes(tagName)
    );
    const tagsToRemove = currentTagNames.filter(
      (tagName) => !selectedTags.includes(tagName)
    );

    // Add new tags
    if (tagsToAdd.length > 0) {
      addImageTags(
        {
          imageId,
          tagNames: tagsToAdd,
        },
        {
          onSuccess: () => {
            if (tagsToRemove.length === 0) {
              toast.success("Tags added successfully");
              onTagsUpdated();
              onClose();
            }
          },
          onError: () => {
            toast.error("Failed to add tags");
          },
        }
      );
    }

    // Remove tags
    if (tagsToRemove.length > 0) {
      removeImageTags(
        {
          imageId,
          tagNames: tagsToRemove,
        },
        {
          onSuccess: () => {
            toast.success("Tags updated successfully");
            onTagsUpdated();
            onClose();
          },
          onError: () => {
            toast.error("Failed to remove tags");
          },
        }
      );
    }

    // If no changes needed
    if (tagsToAdd.length === 0 && tagsToRemove.length === 0) {
      onClose();
    }
  };

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

  const renderTagList = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e88e5" />
          <Text style={styles.loadingText}>Loading tags...</Text>
        </View>
      );
    }

    // Show search results or all tags
    const tagsToShow = searchQuery.trim() ? filteredTags : availableTags;

    if (tagsToShow.length === 0 && !searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tags available</Text>
          <Text style={styles.emptyStateSubtext}>
            Create tags to organize your images
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
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
          {tagsToShow.map((tag) => (
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
                {selectedTags.includes(tag.name) && (
                  <CheckIcon size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <View style={styles.tagActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(tag)}
                >
                  <PencilIcon size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(tag)}
                >
                  <TrashIcon size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Show create new tag option if search query doesn't match existing tags */}
          {isSearchQueryNew && (
            <View style={styles.tagItem}>
              <TouchableOpacity
                style={styles.createTagOption}
                onPress={createTagFromSearch}
                disabled={isCreatingTag}
              >
                <View
                  style={[
                    styles.tagColor,
                    { backgroundColor: COLOR_PALETTE[0] },
                  ]}
                />
                <Text style={styles.createTagOptionText}>
                  Create "{searchQuery.trim()}"
                </Text>
                {isCreatingTag ? (
                  <ActivityIndicator size={16} color="#1e88e5" />
                ) : (
                  <PlusIcon size={16} color="#1e88e5" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!searchQuery.trim() && (
          <TouchableOpacity style={styles.addNewButton} onPress={openAddModal}>
            <PlusIcon size={16} color="#1e88e5" />
            <Text style={styles.addNewButtonText}>Add New Tag</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <>
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
                <TagIcon size={24} color="#1e88e5" />
                <Text style={styles.modalTitle}>Manage Image Tags</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <XIcon size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Select tags to assign to this image
              </Text>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <SearchIcon
                    size={16}
                    color="#64748b"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#64748b"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearSearchButton}
                      onPress={() => setSearchQuery("")}
                    >
                      <XIcon size={16} color="#64748b" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {renderTagList()}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isAddingTags || isRemovingTags}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (isAddingTags || isRemovingTags || isLoading) &&
                    styles.confirmButtonDisabled,
                ]}
                onPress={handleAssignTags}
                disabled={isAddingTags || isRemovingTags || isLoading}
              >
                {isAddingTags || isRemovingTags ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Assign Tags</Text>
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
                {editId ? "Edit Tag" : "Add Tag"}
              </Text>
              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Tag name"
                style={styles.textInput}
              />
              {renderColorPicker()}
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
                  disabled={isCreatingTag || isUpdatingTag}
                >
                  {isCreatingTag || isUpdatingTag ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.nestedSaveButtonText}>
                      {editId ? "Save" : "Add"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  nestedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  nestedModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 350,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nestedModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  colorPickerContainer: {
    marginBottom: 16,
  },
  colorPickerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#1e293b",
  },
  colorCheckmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  colorCheckmarkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  nestedModalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  nestedCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  nestedCancelButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  nestedSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1e88e5",
  },
  nestedSaveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  clearSearchButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  createTagOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e88e5",
    borderStyle: "dashed",
    backgroundColor: "#f0f9ff",
    gap: 8,
  },
  createTagOptionText: {
    fontSize: 14,
    color: "#1e88e5",
    flex: 1,
    fontStyle: "italic",
  },
});
