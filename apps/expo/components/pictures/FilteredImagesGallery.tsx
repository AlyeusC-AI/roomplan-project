import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { OptimizedImage } from "@/lib/utils/imageModule";
import {
  ImageIcon,
  Calendar,
  CheckSquare,
  X,
  Filter,
  Home,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import ModalImagesWithNotes from "./modalImagesWithNotes";
import { Image } from "@service-geek/api-client";

// Type assertions to fix ReactNode compatibility
const SearchIcon = Search as any;
const TagIcon = Tag as any;
const FilterIcon = Filter as any;
const XIcon = X as any;
const CheckSquareIcon = CheckSquare as any;
const HomeIcon = Home as any;
const ImageIconComponent = ImageIcon as any;
const ChevronDownIcon = ChevronDown as any;
const ChevronUpIcon = ChevronUp as any;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEMS_PER_ROW = 3;
const PADDING_HORIZONTAL = 18;
const ITEM_MARGIN = 1;
const TOTAL_MARGINS = (ITEMS_PER_ROW - 1) * ITEM_MARGIN;
const ITEM_SIZE =
  (SCREEN_WIDTH - PADDING_HORIZONTAL * 2 - TOTAL_MARGINS) / ITEMS_PER_ROW;

interface FilteredImagesGalleryProps {
  images: Image[];
  selectable?: boolean;
  onSelectionChange?: (selectedKeys: string[]) => void;
  initialSelectedKeys?: string[];
  activeFilters?: {
    roomFilter?: string;
    tagFilters?: string[];
  };
  onClearFilters?: () => void;
  onClearTagFilter?: (tagToRemove: string) => void;
  rooms?: any[];
  tags?: any[];
  refetch: () => void;
  showFilterControls?: boolean;
  onFilterChange?: (filters: {
    roomFilter: string | "all";
    tagFilters: string[];
  }) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  hideRoomFilter?: boolean;
}

// Group images by room
const groupImagesByRoom = (images: Image[], rooms: any[] = []) => {
  const groups: { [key: string]: Image[] } = {};

  images.forEach((image) => {
    const roomId = image.roomId || "unassigned";
    const roomName =
      roomId === "unassigned"
        ? "Unassigned"
        : rooms.find((r) => r.id === roomId)?.name || roomId;

    if (!groups[roomId]) {
      groups[roomId] = [];
    }
    groups[roomId].push(image);
  });

  return Object.entries(groups)
    .map(([roomId, images]) => ({
      roomId,
      roomName:
        roomId === "unassigned"
          ? "Unassigned"
          : rooms.find((r) => r.id === roomId)?.name || roomId,
      images: images.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => {
      // Sort unassigned to the end
      if (a.roomId === "unassigned") return 1;
      if (b.roomId === "unassigned") return -1;
      // Sort by room name alphabetically
      return a.roomName.localeCompare(b.roomName);
    });
};

// Filter Display Component
const FilterDisplay = ({
  activeFilters,
  onClearFilters,
  onClearTagFilter,
  rooms,
}: {
  activeFilters?: {
    roomFilter?: string;
    tagFilters?: string[];
  };
  onClearFilters?: () => void;
  onClearTagFilter?: (tagToRemove: string) => void;
  rooms?: any[];
}) => {
  if (
    !activeFilters ||
    (!activeFilters.roomFilter &&
      (!activeFilters.tagFilters || activeFilters.tagFilters.length === 0))
  ) {
    return null;
  }

  const hasFilters =
    activeFilters.roomFilter ||
    (activeFilters.tagFilters && activeFilters.tagFilters.length > 0);

  if (!hasFilters) return null;

  // Get room name from room ID
  const getRoomName = (roomId: string) => {
    const room = rooms?.find((r) => r.id === roomId);
    return room?.name || roomId;
  };

  return (
    <View style={styles.filterDisplay}>
      <View style={styles.filterContent}>
        <FilterIcon size={16} color="#6b7280" />
        <Text style={styles.filterDisplayLabel}>Active Filters:</Text>

        <View style={styles.filterTags}>
          {activeFilters.roomFilter && (
            <TouchableOpacity
              style={styles.filterTag}
              onPress={() => onClearTagFilter?.("room")}
            >
              <Text style={styles.filterTagText}>
                Room: {getRoomName(activeFilters.roomFilter)}
              </Text>
              <XIcon size={12} color="#1e40af" style={styles.tagXIcon} />
            </TouchableOpacity>
          )}
          {activeFilters.tagFilters?.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.filterTag}
              onPress={() => onClearTagFilter?.(tag)}
            >
              <Text style={styles.filterTagText}>{tag}</Text>
              <XIcon size={12} color="#1e40af" style={styles.tagXIcon} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
          <XIcon size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Floating Room Header
const FloatingRoomHeader = ({
  roomName,
  imageCount,
  isSelected,
  onToggleSelect,
  selectable,
}: {
  roomName: string;
  imageCount: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  selectable: boolean;
}) => (
  <View style={styles.roomHeader}>
    <View style={styles.roomInfo}>
      {selectable && (
        <TouchableOpacity
          style={[
            styles.selectCircle,
            isSelected && styles.selectCircleActive,
            {
              backgroundColor: "white",
            },
          ]}
          onPress={onToggleSelect}
        >
          {isSelected && <CheckSquareIcon size={12} />}
        </TouchableOpacity>
      )}
      <HomeIcon size={14} color="#6b7280" />
      <Text style={styles.roomText}>{roomName}</Text>
    </View>
    <Text style={styles.imageCountText}>
      {imageCount} {imageCount === 1 ? "photo" : "photos"}
    </Text>
  </View>
);

// Enhanced Image Item with Better Selection Overlay
const ImageItem = ({
  image,
  isSelected,
  onPress,
  onSelect,
  selectable,
}: {
  image: Image;
  isSelected: boolean;
  onPress: () => void;
  onSelect: () => void;
  selectable: boolean;
}) => (
  <TouchableOpacity
    style={[styles.imageItem, isSelected && styles.imageItemSelected]}
    onPress={selectable ? onSelect : onPress}
    activeOpacity={0.9}
    delayPressIn={0}
  >
    <OptimizedImage
      uri={image.url || ""}
      style={styles.image}
      resizeMode="cover"
      isSelected={isSelected}
      imageKey={image.id}
      disabled={true}
    />
    {selectable && isSelected && (
      <View style={styles.selectionOverlay}>
        <View style={styles.checkmark}>
          <CheckSquareIcon size={20} />
        </View>
      </View>
    )}
    {isSelected && <View style={styles.selectedBorder} />}
  </TouchableOpacity>
);

export default function FilteredImagesGallery({
  images: imagesProp,
  selectable = false,
  onSelectionChange,
  initialSelectedKeys = [],
  activeFilters,
  onClearFilters,
  onClearTagFilter,
  rooms = [],
  tags = [],
  refetch,
  showFilterControls = false,
  onFilterChange,
  showFilters = false,
  onToggleFilters,
  hideRoomFilter = false,
}: FilteredImagesGalleryProps) {
  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(initialSelectedKeys);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<Image[]>(imagesProp);

  // Filter state for inline controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string | "all">(
    activeFilters?.roomFilter || "all"
  );
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>(
    activeFilters?.tagFilters || []
  );
  const [activeFilterTab, setActiveFilterTab] = useState<"room" | "tags">(
    hideRoomFilter ? "tags" : "room"
  );

  useEffect(() => {
    setSelectedKeys(initialSelectedKeys);
  }, [initialSelectedKeys]);

  useEffect(() => {
    setImages(imagesProp);
  }, [imagesProp]);

  // Update local filter state when props change
  useEffect(() => {
    if (activeFilters) {
      setSelectedRoomFilter(activeFilters.roomFilter || "all");
      setSelectedTagFilters(activeFilters.tagFilters || []);
    }
  }, [activeFilters]);

  // Calculate which tags are actually used by images and their counts
  const tagsWithCounts = useMemo(() => {
    if (!images || !tags) return [];

    const tagCounts: { [key: string]: number } = {};
    let untaggedCount = 0;

    images.forEach((image) => {
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
  }, [images, tags]);

  // Filter images based on search query, room filter, and tag filters
  const filteredImages = useMemo(() => {
    if (!images) return [];

    let filtered = images;

    // Apply room filter
    if (selectedRoomFilter !== "all") {
      filtered = filtered.filter(
        (image) => image.roomId === selectedRoomFilter
      );
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      const hasUntaggedFilter = selectedTagFilters.includes("Untagged");
      const hasOtherFilters = selectedTagFilters.some(
        (tag) => tag !== "Untagged"
      );

      filtered = filtered.filter((image) => {
        const hasTags = image.tags && image.tags.length > 0;
        const imageTagNames = hasTags
          ? image.tags.map((tag: any) => tag.name)
          : [];

        // If only "Untagged" is selected
        if (hasUntaggedFilter && !hasOtherFilters) {
          return !hasTags;
        }

        // If "Untagged" and other tags are selected
        if (hasUntaggedFilter && hasOtherFilters) {
          const otherSelectedTags = selectedTagFilters.filter(
            (tag) => tag !== "Untagged"
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

    return filtered;
  }, [images, searchQuery, selectedRoomFilter, selectedTagFilters, rooms]);

  const roomGroups = groupImagesByRoom(filteredImages, rooms);
  const urlMap = filteredImages.reduce(
    (acc, image) => {
      acc[image.id] = image.url || "";
      return acc;
    },
    {} as { [key: string]: string }
  );

  const handleImagePress = (imageId: string) => {
    console.log("🚀 ~ handleImagePress ~ imageId:", imageId);
    const index = filteredImages.findIndex((img) => img.id === imageId);
    if (index !== -1) {
      setActiveImageIndex(index);
    }
    setModalVisible(true);
  };

  const toggleImageSelection = (imageKey: string) => {
    console.log("🚀 ~ toggleImageSelection ~ imageKey:", imageKey);
    const newSelectedKeys = selectedKeys.includes(imageKey)
      ? selectedKeys.filter((key) => key !== imageKey)
      : [...selectedKeys, imageKey];

    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const toggleRoomGroupSelection = (groupImages: Image[]) => {
    const groupImageIds = groupImages.map((img) => img.id);
    const isGroupSelected = groupImageIds.every((id) =>
      selectedKeys.includes(id)
    );

    const newSelectedKeys = isGroupSelected
      ? selectedKeys.filter((key) => !groupImageIds.includes(key))
      : [
          ...selectedKeys,
          ...groupImageIds.filter((id) => !selectedKeys.includes(id)),
        ];

    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const isRoomGroupSelected = (groupImages: Image[]) => {
    return groupImages.every((img) => selectedKeys.includes(img.id));
  };

  // Filter control functions
  const toggleTagFilter = (tagName: string) => {
    const newTagFilters = selectedTagFilters.includes(tagName)
      ? selectedTagFilters.filter((tag) => tag !== tagName)
      : [...selectedTagFilters, tagName];

    setSelectedTagFilters(newTagFilters);
    onFilterChange?.({
      roomFilter: selectedRoomFilter,
      tagFilters: newTagFilters,
    });
  };

  const handleRoomFilterChange = (roomId: string | "all") => {
    setSelectedRoomFilter(roomId);
    onFilterChange?.({
      roomFilter: roomId,
      tagFilters: selectedTagFilters,
    });
  };

  const clearAllFilters = () => {
    setSelectedRoomFilter("all");
    setSelectedTagFilters([]);
    setSearchQuery("");
    onFilterChange?.({
      roomFilter: "all",
      tagFilters: [],
    });
  };

  const renderRoomFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>Filter by Room:</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: "all", name: "All Rooms" }, ...rooms]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedRoomFilter === item.id && styles.filterChipActive,
            ]}
            onPress={() => handleRoomFilterChange(item.id)}
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

  const hasActiveFilters =
    (!hideRoomFilter && selectedRoomFilter !== "all") ||
    selectedTagFilters.length > 0 ||
    searchQuery.trim();

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIconComponent size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>No images found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Controls */}
      {showFilterControls && (
        <>
          {/* Collapsible Filter Content */}
          {showFilters && (
            <>
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
                {!hideRoomFilter && (
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
                        activeFilterTab === "room" &&
                          styles.filterTabTextActive,
                      ]}
                    >
                      Rooms
                    </Text>
                  </TouchableOpacity>
                )}
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
                    {!hideRoomFilter && selectedRoomFilter !== "all" && (
                      <View style={styles.activeFilterChip}>
                        <Text style={styles.activeFilterText}>
                          Room:{" "}
                          {
                            rooms?.find((r) => r.id === selectedRoomFilter)
                              ?.name
                          }
                        </Text>
                      </View>
                    )}
                    {selectedTagFilters.map((tag) => (
                      <View key={tag} style={styles.activeFilterChip}>
                        <Text style={styles.activeFilterText}>Tag: {tag}</Text>
                      </View>
                    ))}
                    {searchQuery.trim() && (
                      <View style={styles.activeFilterChip}>
                        <Text style={styles.activeFilterText}>
                          Search: "{searchQuery}"
                        </Text>
                      </View>
                    )}
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
              {!hideRoomFilter && activeFilterTab === "room"
                ? renderRoomFilter()
                : renderTagFilter()}
            </>
          )}
        </>
      )}

      {/* Legacy Filter Display (for backward compatibility) */}
      {!showFilterControls && (
        <FilterDisplay
          activeFilters={activeFilters}
          onClearFilters={onClearFilters}
          onClearTagFilter={onClearTagFilter}
          rooms={rooms}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {roomGroups.map(({ roomId, roomName, images: groupImages }) => {
          const isGroupSelected = isRoomGroupSelected(groupImages);

          return (
            <View key={roomId} style={styles.roomSection}>
              {!hideRoomFilter && (
                <FloatingRoomHeader
                  roomName={roomName}
                  imageCount={groupImages.length}
                  isSelected={isGroupSelected}
                  onToggleSelect={() => toggleRoomGroupSelection(groupImages)}
                  selectable={selectable}
                />
              )}

              <View style={styles.imageGrid}>
                {groupImages.map((image, index) => (
                  <ImageItem
                    key={image.id}
                    image={image}
                    isSelected={selectedKeys.includes(image.id)}
                    onPress={() => handleImagePress(image.id)}
                    onSelect={() => toggleImageSelection(image.id)}
                    selectable={selectable}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <ModalImagesWithNotes
        images={filteredImages}
        roomName="Filtered Images"
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
        refetch={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
    backgroundColor: "#2563eb",
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
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  filterDisplay: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterDisplayLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 8,
  },
  filterTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
    flex: 1,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  filterTagText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f8fafc",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  roomSection: {
    marginBottom: 8,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  roomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  selectCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  selectCircleActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  imageCountText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 6,
    gap: 6,
    marginTop: 4
  },
  imageItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.25,
    margin: ITEM_MARGIN,
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
  },
  imageItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "rgba(59, 130, 246, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor: "#2563eb" ,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: "#2563eb",
    borderRadius: 4,
  },
  tagXIcon: {
    marginLeft: 4,
  },
});
