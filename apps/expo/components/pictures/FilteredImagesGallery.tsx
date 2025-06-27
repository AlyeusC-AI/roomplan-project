import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
} from "react-native";
import { OptimizedImage } from "@/lib/utils/imageModule";
import {
  ImageIcon,
  Calendar,
  CheckSquare,
  X,
  Filter,
} from "lucide-react-native";
import ModalImagesWithNotes from "./modalImagesWithNotes";
import { Image } from "@service-geek/api-client";

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
}

// Group images by date
const groupImagesByDate = (images: Image[]) => {
  const groups: { [key: string]: Image[] } = {};

  images.forEach((image) => {
    const date = new Date(image.createdAt);
    const dateKey = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(image);
  });

  return Object.entries(groups)
    .map(([dateKey, images]) => ({
      dateKey,
      displayDate: new Date(dateKey).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      images: images.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort(
      (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime()
    );
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
        <Filter size={16} color="#6b7280" />
        <Text style={styles.filterLabel}>Active Filters:</Text>

        <View style={styles.filterTags}>
          {activeFilters.roomFilter && (
            <TouchableOpacity
              style={styles.filterTag}
              onPress={() => onClearTagFilter?.("room")}
            >
              <Text style={styles.filterTagText}>
                Room: {getRoomName(activeFilters.roomFilter)}
              </Text>
              <X size={12} color="#1e40af" style={styles.tagXIcon} />
            </TouchableOpacity>
          )}
          {activeFilters.tagFilters?.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.filterTag}
              onPress={() => onClearTagFilter?.(tag)}
            >
              <Text style={styles.filterTagText}>{tag}</Text>
              <X size={12} color="#1e40af" style={styles.tagXIcon} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
          <X size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Floating Date Header
const FloatingDateHeader = ({
  displayDate,
  imageCount,
  isSelected,
  onToggleSelect,
  selectable,
}: {
  displayDate: string;
  imageCount: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  selectable: boolean;
}) => (
  <View style={styles.dateHeader}>
    <View style={styles.dateInfo}>
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
          {isSelected && <CheckSquare size={12} />}
        </TouchableOpacity>
      )}
      <Calendar size={14} color="#6b7280" />
      <Text style={styles.dateText}>{displayDate}</Text>
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
      disabled={selectable}
    />
    {selectable && isSelected && (
      <View style={styles.selectionOverlay}>
        <View style={styles.checkmark}>
          <CheckSquare size={20} />
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
  rooms,
}: FilteredImagesGalleryProps) {
  const [selectedKeys, setSelectedKeys] =
    useState<string[]>(initialSelectedKeys);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState<Image[]>(imagesProp);

  useEffect(() => {
    setSelectedKeys(initialSelectedKeys);
  }, [initialSelectedKeys]);

  useEffect(() => {
    setImages(imagesProp);
  }, [imagesProp]);

  const dateGroups = groupImagesByDate(images);
  const urlMap = images.reduce(
    (acc, image) => {
      acc[image.id] = image.url || "";
      return acc;
    },
    {} as { [key: string]: string }
  );

  const handleImagePress = (index: number) => {
    setActiveImageIndex(index);
    setModalVisible(true);
  };

  const toggleImageSelection = (imageKey: string) => {
    const newSelectedKeys = selectedKeys.includes(imageKey)
      ? selectedKeys.filter((key) => key !== imageKey)
      : [...selectedKeys, imageKey];

    setSelectedKeys(newSelectedKeys);
    onSelectionChange?.(newSelectedKeys);
  };

  const toggleDateGroupSelection = (groupImages: Image[]) => {
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

  const isDateGroupSelected = (groupImages: Image[]) => {
    return groupImages.every((img) => selectedKeys.includes(img.id));
  };

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIcon size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>No images found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterDisplay
        activeFilters={activeFilters}
        onClearFilters={onClearFilters}
        onClearTagFilter={onClearTagFilter}
        rooms={rooms}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {dateGroups.map(({ dateKey, displayDate, images: groupImages }) => {
          const isGroupSelected = isDateGroupSelected(groupImages);

          return (
            <View key={dateKey} style={styles.dateSection}>
              <FloatingDateHeader
                displayDate={displayDate}
                imageCount={groupImages.length}
                isSelected={isGroupSelected}
                onToggleSelect={() => toggleDateGroupSelection(groupImages)}
                selectable={selectable}
              />

              <View style={styles.imageGrid}>
                {groupImages.map((image, index) => (
                  <ImageItem
                    key={image.id}
                    image={image}
                    isSelected={selectedKeys.includes(image.id)}
                    onPress={() => handleImagePress(images.indexOf(image))}
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
        images={images}
        urlMap={urlMap}
        roomName="Filtered Images"
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        activeImageIndex={activeImageIndex}
        setActiveImageIndex={setActiveImageIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  filterLabel: {
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
  dateSection: {
    marginBottom: 8,
  },
  dateHeader: {
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
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateText: {
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
    backgroundColor: "#182e43",
    borderColor: "#182e43",
  },
  imageCountText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  imageItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: ITEM_MARGIN,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  imageItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: "100%",
    height: "100%",
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
    // backgroundColor: "#182e43" ,
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
    borderColor: "#182e43",
    borderRadius: 4,
  },
  tagXIcon: {
    marginLeft: 4,
  },
});
