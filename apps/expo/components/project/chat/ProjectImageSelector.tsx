import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Text } from "@/components/ui/text";
import {
  X,
  Search,
  Image as ImageIcon,
  Check,
  Send,
  Tag,
} from "lucide-react-native";
import {
  useSearchImages,
  useGetRooms,
  useGetTags,
} from "@service-geek/api-client";

// Type assertions to fix ReactNode compatibility
const XIcon = X as any;
const SearchIcon = Search as any;
const ImageIconComponent = ImageIcon as any;
const CheckIcon = Check as any;
const SendIcon = Send as any;
const TagIcon = Tag as any;

interface ProjectImageSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (images: any[]) => void;
  projectId: string;
}

export default function ProjectImageSelector({
  visible,
  onClose,
  onSelectImage,
  projectId,
}: ProjectImageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | "all">(
    "all"
  );
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [filteredImages, setFilteredImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [activeFilterTab, setActiveFilterTab] = useState<"room" | "tags">(
    "room"
  );

  const { data: images, isLoading } = useSearchImages(
    projectId,
    {
      type: "ROOM",
    },
    {
      direction: "desc",
      field: "createdAt",
    },
    { page: 1, limit: 100 }
  );

  const { data: rooms } = useGetRooms(projectId);
  const { data: tags } = useGetTags({ type: "IMAGE" });

  // Calculate which tags are actually used by images and their counts
  const tagsWithCounts = useMemo(() => {
    if (!images?.data || !tags) return [];

    const tagCounts: { [key: string]: number } = {};
    let untaggedCount = 0;

    images.data.forEach((image) => {
      if (image.tags && image.tags.length > 0) {
        image.tags.forEach((tag: any) => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        });
      } else {
        untaggedCount++;
      }
    });

    // Create array with tags that have images and their counts
    const tagsWithImages = tags
      .filter((tag) => tagCounts[tag.name] > 0)
      .map((tag) => ({
        ...tag,
        count: tagCounts[tag.name],
      }));

    // Add untagged option if there are untagged images
    if (untaggedCount > 0) {
      tagsWithImages.unshift({
        id: "untagged",
        name: "Untagged",
        count: untaggedCount,
        type: "IMAGE" as const,
        organizationId: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return tagsWithImages;
  }, [images?.data, tags]);

  // Filter images based on search query, room filter, and tag filters
  useEffect(() => {
    if (!images?.data) {
      setFilteredImages([]);
      return;
    }

    let filtered = images.data;

    // Apply room filter
    if (selectedRoomFilter !== "all") {
      filtered = filtered.filter(
        (image) => image.roomId === selectedRoomFilter
      );
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      const hasUntaggedFilter = selectedTagFilters.includes("untagged");
      const hasOtherFilters = selectedTagFilters.some(
        (tag) => tag !== "untagged"
      );

      filtered = filtered.filter((image) => {
        const hasTags = image.tags && image.tags.length > 0;
        const imageTagNames = hasTags
          ? image.tags.map((tag: any) => tag.name)
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
            otherSelectedTags.some((tag) => imageTagNames.includes(tag))
          );
        }

        // If only other tags are selected
        return selectedTagFilters.some((tag) => imageTagNames.includes(tag));
      });
    }

    // Apply search filter (search in room names and image metadata)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((image) => {
        const room = rooms?.find((r) => r.id === image.roomId);
        const roomName = room?.name?.toLowerCase() || "";
        const fileName = image.url?.split("/").pop()?.toLowerCase() || "";

        return roomName.includes(query) || fileName.includes(query);
      });
    }

    setFilteredImages(filtered);
  }, [
    images?.data,
    searchQuery,
    selectedRoomFilter,
    selectedTagFilters,
    rooms,
  ]);

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSendSelectedImages = () => {
    const selectedImageObjects = filteredImages.filter((image) =>
      selectedImages.has(image.id)
    );

    const imageFiles = selectedImageObjects.map((image) => ({
      uri: image.url,
      type: "image/jpeg",
      name: image.url.split("/").pop() || `project_image_${Date.now()}.jpg`,
      size: 0, // We don't have file size for project images
    }));

    onSelectImage(imageFiles);
    setSelectedImages(new Set()); // Clear selection
    onClose();
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const toggleTagFilter = (tagName: string) => {
    setSelectedTagFilters((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedRoomFilter("all");
    setSelectedTagFilters([]);
  };

  const renderImageItem = ({ item }: { item: any }) => {
    const room = rooms?.find((r) => r.id === item.roomId);
    const isSelected = selectedImages.has(item.id);

    return (
      <TouchableOpacity
        style={[styles.imageItem, isSelected && styles.imageItemSelected]}
        onPress={() => toggleImageSelection(item.id)}
      >
        <Image source={{ uri: item.url }} style={styles.imageThumbnail} />

        {/* Selection overlay */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={styles.checkIconContainer}>
              <CheckIcon size={16} color="#fff" />
            </View>
          </View>
        )}

        <View style={styles.imageInfo}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room?.name || "Unknown Room"}
          </Text>
          <Text style={styles.imageDate} numberOfLines={1}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {/* Show tags if any */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag: any, index: number) => (
                <View key={tag.id} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderRoomFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Room:</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: "all", name: "All Rooms" }, ...(rooms || [])]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedRoomFilter === item.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedRoomFilter(item.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRoomFilter === item.id && styles.filterChipTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const renderTagFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Tags:</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tagsWithCounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedTagFilters.includes(item.name) && styles.filterChipActive,
            ]}
            onPress={() => toggleTagFilter(item.name)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedTagFilters.includes(item.name) &&
                  styles.filterChipTextActive,
              ]}
            >
              {item.name} ({item.count})
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  const selectedCount = selectedImages.size;
  const hasActiveFilters =
    selectedRoomFilter !== "all" || selectedTagFilters.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <ImageIconComponent size={24} color="#182e43" />
              <Text style={styles.headerTitle}>
                Select Project Images{" "}
                {selectedCount > 0 && `(${selectedCount})`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <SearchIcon size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search images..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeFilterTab === "room" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilterTab("room")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilterTab === "room" && styles.filterTabTextActive,
                ]}
              >
                Rooms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeFilterTab === "tags" && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilterTab("tags")}
            >
              <TagIcon
                size={16}
                color={activeFilterTab === "tags" ? "#fff" : "#64748b"}
              />
              <Text
                style={[
                  styles.filterTabText,
                  activeFilterTab === "tags" && styles.filterTabTextActive,
                ]}
              >
                Tags
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Filter Display */}
          {hasActiveFilters && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
              <View style={styles.activeFiltersList}>
                {selectedRoomFilter !== "all" && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>
                      Room:{" "}
                      {rooms?.find((r) => r.id === selectedRoomFilter)?.name}
                    </Text>
                  </View>
                )}
                {selectedTagFilters.map((tag) => (
                  <View key={tag} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>Tag: {tag}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Filter Content */}
          {activeFilterTab === "room" ? renderRoomFilter() : renderTagFilter()}

          {/* Selection Actions */}
          {selectedCount > 0 && (
            <View style={styles.selectionActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearSelection}
              >
                <Text style={styles.clearButtonText}>Clear Selection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendSelectedImages}
              >
                <SendIcon size={16} color="#fff" />
                <Text style={styles.sendButtonText}>
                  Send {selectedCount} Image{selectedCount !== 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Images Grid */}
          <View style={styles.imagesContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#182e43" />
                <Text style={styles.loadingText}>Loading images...</Text>
              </View>
            ) : filteredImages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ImageIconComponent size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>
                  {searchQuery || hasActiveFilters
                    ? "No images found matching your criteria"
                    : "No images in this project yet"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredImages}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.imagesGrid}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 8,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: "#182e43",
  },
  filterTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginLeft: 4,
  },
  filterTabTextActive: {
    color: "#fff",
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activeFiltersLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  activeFiltersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  activeFilterChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  activeFilterText: {
    fontSize: 11,
    color: "#1d4ed8",
    fontWeight: "500",
  },
  clearFiltersButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  clearFiltersText: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "500",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  filterList: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#182e43",
    borderColor: "#182e43",
  },
  filterChipText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#182e43",
  },
  sendButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  imagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  imagesGrid: {
    paddingBottom: 20,
  },
  imageItem: {
    flex: 1,
    margin: 4,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
  },
  imageItemSelected: {
    borderColor: "#182e43",
    borderWidth: 2,
  },
  imageThumbnail: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  selectionOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#182e43",
    justifyContent: "center",
    alignItems: "center",
  },
  imageInfo: {
    padding: 8,
  },
  roomName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  imageDate: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  tagChip: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "#e0e7ff",
  },
  tagText: {
    fontSize: 8,
    color: "#3730a3",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 8,
    color: "#64748b",
    fontWeight: "500",
  },
});
