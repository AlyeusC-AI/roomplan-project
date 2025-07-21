import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Filter, X } from "lucide-react-native";
import RoomFilterTab from "./RoomFilterTab";
import TagFilterTab from "./TagFilterTab";
import { Colors } from "@/constants/Colors";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedRoomFilter: string | "all";
  setSelectedRoomFilter: (filter: string | "all") => void;
  selectedTagFilters: string[];
  setSelectedTagFilters: (filters: string[]) => void;
  rooms: any[];
  tags: any[];
  photos: any[];
}

type FilterTab = "rooms" | "tags";

export default function FilterModal({
  visible,
  onClose,
  selectedRoomFilter,
  setSelectedRoomFilter,
  selectedTagFilters,
  setSelectedTagFilters,
  rooms,
  tags,
  photos,
}: FilterModalProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("rooms");

  const clearAllFilters = () => {
    setSelectedRoomFilter("all");
    setSelectedTagFilters([]);
  };

  const hasActiveFilters =
    selectedRoomFilter !== "all" || selectedTagFilters.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Filter size={24} color={Colors.light.primary} />
            <Text style={styles.headerTitle}>Filters</Text>
          </View>
          <View style={styles.headerRight}>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "rooms" && styles.activeTab]}
            onPress={() => setActiveTab("rooms")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "rooms" && styles.activeTabText,
              ]}
            >
              Rooms
            </Text>
            {selectedRoomFilter !== "all" && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "tags" && styles.activeTab]}
            onPress={() => setActiveTab("tags")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "tags" && styles.activeTabText,
              ]}
            >
              Tags
            </Text>
            {selectedTagFilters.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {selectedTagFilters.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === "rooms" ? (
            <RoomFilterTab
              rooms={rooms}
              photos={photos}
              selectedRoomFilter={selectedRoomFilter}
              setSelectedRoomFilter={setSelectedRoomFilter}
            />
          ) : (
            <TagFilterTab
              tags={tags}
              photos={photos}
              selectedTagFilters={selectedTagFilters}
              setSelectedTagFilters={setSelectedTagFilters}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  clearButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    position: "relative",
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#fff",
  },
  tabBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  applyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
