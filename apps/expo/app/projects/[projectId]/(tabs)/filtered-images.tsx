import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Filter } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import FilteredImagesGallery from "@/components/pictures/FilteredImagesGallery";
import FilterModal from "@/components/pictures/FilterModal";
import SelectionMode from "@/components/pictures/SelectionMode";
import BulkActionsModal from "@/components/pictures/BulkActionsModal";
import SaveToPhoneModal from "@/components/pictures/SaveToPhoneModal";
import {
  useGetRooms,
  useSearchImages,
  useBulkUpdateImages,
  useBulkRemoveImages,
  useGetTags,
  useAddImageTags,
} from "@service-geek/api-client";
import { toast } from "sonner-native";

export default function FilteredImagesScreen() {
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const router = useRouter();

  // Filter state
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | "all">(
    "all"
  );
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Selection mode state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"room" | "tags">("room");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAssigningRoom, setIsAssigningRoom] = useState(false);
  const [isAssigningTags, setIsAssigningTags] = useState(false);

  // Save to phone state
  const [showSaveToPhoneModal, setShowSaveToPhoneModal] = useState(false);

  // Data hooks
  const { data: rooms } = useGetRooms(projectId);
  const { data: tags } = useGetTags({ type: "IMAGE" });
  const { data: images, refetch } = useSearchImages(
    projectId,
    { type: "ROOM" },
    { direction: "asc", field: "order" },
    { page: 1, limit: 100 }
  );

  const { mutate: bulkUpdateImages } = useBulkUpdateImages();
  const { mutate: bulkRemoveImages } = useBulkRemoveImages();
  const { mutateAsync: addImageTags } = useAddImageTags();

  // Filter photos based on room and tag filters
  const filteredPhotos = useMemo(() => {
    if (!images?.data) return [];

    let filtered = images.data;

    // Apply room filter
    if (selectedRoomFilter !== "all") {
      filtered = filtered.filter(
        (photo) => photo.roomId === selectedRoomFilter
      );
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      const hasUntaggedFilter = selectedTagFilters.includes("untagged");
      const hasOtherFilters = selectedTagFilters.some(
        (tag) => tag !== "untagged"
      );

      filtered = filtered.filter((photo) => {
        const hasTags = photo.tags && photo.tags.length > 0;
        const photoTagNames = hasTags
          ? photo.tags.map((tag: any) => tag.name)
          : [];

        // If only "untagged" is selected
        if (hasUntaggedFilter && !hasOtherFilters) {
          return !hasTags;
        }

        // If "untagged" and other tags are selected
        if (hasUntaggedFilter && hasOtherFilters) {
          const otherSelectedTags = selectedTagFilters.filter(
            (tag) => tag !== "untagged"
          );
          return (
            !hasTags ||
            otherSelectedTags.some((tag) => photoTagNames.includes(tag))
          );
        }

        // If only other tags are selected
        return selectedTagFilters.some((tag) => photoTagNames.includes(tag));
      });
    }

    return filtered;
  }, [images?.data, selectedRoomFilter, selectedTagFilters]);

  // Check if filters are active
  const hasActiveFilters =
    selectedRoomFilter !== "all" || selectedTagFilters.length > 0;

  // Selection mode handlers
  const handleSelectionChange = (selectedKeys: string[]) => {
    const selectedImages = filteredPhotos.filter((photo) =>
      selectedKeys.includes(photo.id)
    );
    setSelectedPhotos(selectedImages);
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
    setIsSelectionMode(false);
  };

  const handleAssignRoom = async (roomId: string) => {
    try {
      setIsAssigningRoom(true);
      await bulkUpdateImages({
        projectId,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
        updates: { roomId },
      });
      toast.success("Room assigned successfully");
      clearSelection();
      setShowBulkActionsModal(false);
      refetch();
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Failed to assign room");
    } finally {
      setIsAssigningRoom(false);
    }
  };

  const handleAssignTags = async (tagNames: string[]) => {
    try {
      setIsAssigningTags(true);
      // Add tags to all selected images
      const promises = selectedPhotos.map(
        async (photo) =>
          await addImageTags({
            imageId: photo.id,
            tagNames,
          })
      );

      await Promise.all(promises);
      await refetch();
      toast.success("Tags assigned successfully");
      clearSelection();
      setShowBulkActionsModal(false);
    } catch (error) {
      console.error("Error assigning tags:", error);
      toast.error("Failed to assign tags");
    } finally {
      setIsAssigningTags(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await bulkRemoveImages({
        projectId,
        filters: {
          type: "ROOM",
          ids: selectedPhotos.map((p) => p.id),
        },
      });
      toast.success("Images deleted successfully");
      clearSelection();
      refetch();
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveToPhone = () => {
    setShowSaveToPhoneModal(true);
  };

  const handleSaveToPhoneComplete = () => {
    // Optionally clear selection after saving
    // clearSelection();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#182e43" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {hasActiveFilters ? "Filtered Images" : "All Images"}
            </Text>
            {hasActiveFilters && (
              <Text style={styles.headerSubtitle}>
                {filteredPhotos.length}{" "}
                {filteredPhotos.length === 1 ? "image" : "images"}
              </Text>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isSelectionMode && styles.actionButtonActive,
              ]}
              onPress={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  setSelectedPhotos([]);
                }
              }}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isSelectionMode && styles.actionButtonTextActive,
                ]}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#182e43" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selection Mode UI */}
        {isSelectionMode && selectedPhotos.length > 0 && (
          <SelectionMode
            selectedPhotos={selectedPhotos}
            onClearSelection={clearSelection}
            onAssignRoom={() => {
              setBulkActionType("room");
              setShowBulkActionsModal(true);
            }}
            onAssignTags={() => {
              setBulkActionType("tags");
              setShowBulkActionsModal(true);
            }}
            onDelete={handleDelete}
            onSaveToPhone={handleSaveToPhone}
            isDeleting={isDeleting}
            isAssigningRoom={isAssigningRoom}
          />
        )}

        {/* Images Gallery */}
        <FilteredImagesGallery
          images={filteredPhotos}
          selectable={isSelectionMode}
          onSelectionChange={handleSelectionChange}
          initialSelectedKeys={selectedPhotos.map((p) => p.id)}
          activeFilters={{
            roomFilter:
              selectedRoomFilter !== "all" ? selectedRoomFilter : undefined,
            tagFilters:
              selectedTagFilters.length > 0 ? selectedTagFilters : undefined,
          }}
          onClearFilters={() => {
            setSelectedRoomFilter("all");
            setSelectedTagFilters([]);
          }}
          onClearTagFilter={(tagToRemove) => {
            if (tagToRemove === "room") {
              setSelectedRoomFilter("all");
            } else {
              setSelectedTagFilters((prev) =>
                prev.filter((tag) => tag !== tagToRemove)
              );
            }
          }}
          rooms={rooms || []}
          refetch={refetch}
        />

        {/* Filter Modal */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          selectedRoomFilter={selectedRoomFilter}
          setSelectedRoomFilter={setSelectedRoomFilter}
          selectedTagFilters={selectedTagFilters}
          setSelectedTagFilters={setSelectedTagFilters}
          rooms={rooms || []}
          tags={tags || []}
          photos={images?.data || []}
        />

        {/* Bulk Actions Modal */}
        <BulkActionsModal
          visible={showBulkActionsModal}
          onClose={() => setShowBulkActionsModal(false)}
          action={bulkActionType}
          selectedPhotos={selectedPhotos}
          onAssignRoom={handleAssignRoom}
          onAssignTags={handleAssignTags}
          isAssigningRoom={isAssigningRoom}
          isAssigningTags={isAssigningTags}
        />

        {/* Save to Phone Modal */}
        <SaveToPhoneModal
          visible={showSaveToPhoneModal}
          onClose={() => setShowSaveToPhoneModal(false)}
          selectedPhotos={selectedPhotos}
          onComplete={handleSaveToPhoneComplete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionButtonActive: {
    backgroundColor: "#182e43",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#182e43",
  },
  actionButtonTextActive: {
    color: "#fff",
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
});
