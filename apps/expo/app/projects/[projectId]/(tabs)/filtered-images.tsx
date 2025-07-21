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

// Type assertions to fix ReactNode compatibility
const ArrowLeftIcon = ArrowLeft as any;
const FilterIcon = Filter as any;
import { Text } from "@/components/ui/text";
import FilteredImagesGallery from "@/components/pictures/FilteredImagesGallery";

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
import { Colors } from "@/constants/Colors";

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
  const [showFilters, setShowFilters] = useState(false);

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

  // Selection mode handlers
  const handleSelectionChange = (selectedKeys: string[]) => {
    const selectedImages = (images?.data || []).filter((photo: any) =>
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
            <ArrowLeftIcon size={24} color={Colors.light.primary} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>All Images</Text>
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
              onPress={() => setShowFilters(!showFilters)}
            >
              <FilterIcon size={20} color={Colors.light.primary} />
              {(selectedRoomFilter !== "all" ||
                selectedTagFilters.length > 0) && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {selectedTagFilters.length +
                      (selectedRoomFilter !== "all" ? 1 : 0)}
                  </Text>
                </View>
              )}
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
          images={images?.data || []}
          selectable={isSelectionMode}
          onSelectionChange={handleSelectionChange}
          initialSelectedKeys={selectedPhotos.map((p) => p.id)}
          rooms={rooms || []}
          tags={tags || []}
          refetch={refetch}
          showFilterControls={true}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onFilterChange={(filters) => {
            setSelectedRoomFilter(filters.roomFilter);
            setSelectedTagFilters(filters.tagFilters);
          }}
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
    backgroundColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.primary,
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
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
