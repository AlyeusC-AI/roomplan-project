import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Check, Tag } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface TagFilterTabProps {
  tags: any[];
  photos: any[];
  selectedTagFilters: string[];
  setSelectedTagFilters: (filters: string[]) => void;
}

export default function TagFilterTab({
  tags,
  photos,
  selectedTagFilters,
  setSelectedTagFilters,
}: TagFilterTabProps) {
  // Extract all unique tags from photos (same logic as web)
  const allTags = useMemo(() => {
    if (!photos) return [];

    const tagMap = new Map<string, { tag: any; count: number }>();

    photos.forEach((photo) => {
      if (photo.tags && photo.tags.length > 0) {
        photo.tags.forEach((tag: any) => {
          const existing = tagMap.get(tag.name);
          if (existing) {
            existing.count += 1;
          } else {
            tagMap.set(tag.name, { tag, count: 1 });
          }
        });
      }
    });

    return Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count) // Sort by frequency
      .map((item) => item.tag);
  }, [photos]);

  const handleTagFilterToggle = (tagName: string) => {
    setSelectedTagFilters((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const clearAllTagFilters = () => {
    setSelectedTagFilters([]);
  };

  const getTagCount = (tagName: string) => {
    return photos.filter(
      (p) => p.tags && p.tags.some((t: any) => t.name === tagName)
    ).length;
  };

  const getUntaggedCount = () => {
    return photos.filter((p) => !p.tags || p.tags.length === 0).length;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Filter by Tags</Text>
        <Text style={styles.sectionDescription}>
          Select tags to filter photos
        </Text>

        {/* Clear All Button */}
        {selectedTagFilters.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={clearAllTagFilters}
          >
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}

        {/* All Photos Option */}
        <TouchableOpacity
          style={[
            styles.tagOption,
            selectedTagFilters.length === 0 && styles.selectedTagOption,
          ]}
          onPress={clearAllTagFilters}
        >
          <View style={styles.tagOptionContent}>
            <Tag
              size={16}
              color={
                selectedTagFilters.length === 0 ? "#fff" : Colors.light.primary
              }
            />
            <Text
              style={[
                styles.tagOptionText,
                selectedTagFilters.length === 0 && styles.selectedTagOptionText,
              ]}
            >
              All Photos
            </Text>
            <Text
              style={[
                styles.tagOptionCount,
                selectedTagFilters.length === 0 &&
                  styles.selectedTagOptionCount,
              ]}
            >
              ({photos.length})
            </Text>
          </View>
          {selectedTagFilters.length === 0 && <Check size={20} color="#fff" />}
        </TouchableOpacity>

        {/* Untagged Option */}
        <TouchableOpacity
          style={[
            styles.tagOption,
            selectedTagFilters.includes("untagged") && styles.selectedTagOption,
          ]}
          onPress={() => handleTagFilterToggle("untagged")}
        >
          <View style={styles.tagOptionContent}>
            <Tag
              size={16}
              color={
                selectedTagFilters.includes("untagged") ? "#fff" : "#64748b"
              }
            />
            <Text
              style={[
                styles.tagOptionText,
                selectedTagFilters.includes("untagged") &&
                  styles.selectedTagOptionText,
              ]}
            >
              Untagged
            </Text>
            <Text
              style={[
                styles.tagOptionCount,
                selectedTagFilters.includes("untagged") &&
                  styles.selectedTagOptionCount,
              ]}
            >
              ({getUntaggedCount()})
            </Text>
          </View>
          {selectedTagFilters.includes("untagged") && (
            <Check size={20} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Tag Options */}
        {allTags.map((tag) => {
          const isSelected = selectedTagFilters.includes(tag.name);
          const count = getTagCount(tag.name);

          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagOption,
                isSelected && styles.selectedTagOption,
                tag.color &&
                  isSelected && {
                    backgroundColor: tag.color,
                    borderColor: tag.color,
                  },
              ]}
              onPress={() => handleTagFilterToggle(tag.name)}
            >
              <View style={styles.tagOptionContent}>
                <View
                  style={[
                    styles.tagColor,
                    tag.color && { backgroundColor: tag.color },
                    isSelected && { backgroundColor: "#fff" },
                  ]}
                />
                <Text
                  style={[
                    styles.tagOptionText,
                    isSelected && styles.selectedTagOptionText,
                    tag.color && isSelected && { color: "#fff" },
                  ]}
                >
                  {tag.name}
                </Text>
                <Text
                  style={[
                    styles.tagOptionCount,
                    isSelected && styles.selectedTagOptionCount,
                    tag.color && isSelected && { color: "#e2e8f0" },
                  ]}
                >
                  ({count})
                </Text>
              </View>
              {isSelected && (
                <Check size={20} color={tag.color ? "#fff" : "#fff"} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Selected Tags Summary */}
        {selectedTagFilters.length > 0 && (
          <View style={styles.selectedTagsContainer}>
            <Text style={styles.selectedTagsTitle}>Showing photos with:</Text>
            <View style={styles.selectedTagsList}>
              {selectedTagFilters.map((tagName) => (
                <View key={tagName} style={styles.selectedTagBadge}>
                  <Text style={styles.selectedTagBadgeText}>
                    {tagName === "untagged" ? "Untagged" : tagName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleTagFilterToggle(tagName)}
                    style={styles.removeTagButton}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  clearAllButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  clearAllButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  tagOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedTagOption: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tagOptionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tagColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6b7280",
    marginRight: 8,
  },
  tagOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginRight: 4,
  },
  selectedTagOptionText: {
    color: "#fff",
  },
  tagOptionCount: {
    fontSize: 14,
    color: "#64748b",
  },
  selectedTagOptionCount: {
    color: "#e2e8f0",
  },
  selectedTagsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTagBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  removeTagButton: {
    marginLeft: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
