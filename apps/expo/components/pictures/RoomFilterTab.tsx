import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { Check } from "lucide-react-native";
import { Image, Room } from "@service-geek/api-client";

interface RoomFilterTabProps {
  rooms: Room[];
  selectedRoomFilter: string | "all";
  setSelectedRoomFilter: (filter: string | "all") => void;
  photos: Image[];
}

export default function RoomFilterTab({
  rooms,
  selectedRoomFilter,
  setSelectedRoomFilter,
  photos,
}: RoomFilterTabProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Room</Text>
        <Text style={styles.sectionDescription}>
          Choose a room to filter photos
        </Text>

        {/* View All Option */}
        <TouchableOpacity
          style={[
            styles.roomOption,
            selectedRoomFilter === "all" && styles.selectedRoomOption,
          ]}
          onPress={() => setSelectedRoomFilter("all")}
        >
          <View style={styles.roomOptionContent}>
            <Text
              style={[
                styles.roomOptionText,
                selectedRoomFilter === "all" && styles.selectedRoomOptionText,
              ]}
            >
              View All
            </Text>
            <Text
              style={[
                styles.roomOptionCount,
                selectedRoomFilter === "all" && styles.selectedRoomOptionCount,
              ]}
            >
              {rooms.length} rooms
            </Text>
          </View>
          {selectedRoomFilter === "all" && <Check size={20} color="#fff" />}
        </TouchableOpacity>

        {/* Room Options */}
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.roomOption,
              selectedRoomFilter === room.id && styles.selectedRoomOption,
            ]}
            onPress={() => setSelectedRoomFilter(room.id)}
          >
            <View style={styles.roomOptionContent}>
              <Text
                style={[
                  styles.roomOptionText,
                  selectedRoomFilter === room.id &&
                    styles.selectedRoomOptionText,
                ]}
              >
                {room.name}
              </Text>
              <Text
                style={[
                  styles.roomOptionCount,
                  selectedRoomFilter === room.id &&
                    styles.selectedRoomOptionCount,
                ]}
              >
                {photos.filter((photo) => photo.roomId === room.id).length}{" "}
                photos
              </Text>
            </View>
            {selectedRoomFilter === room.id && <Check size={20} color="#fff" />}
          </TouchableOpacity>
        ))}
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
  roomOption: {
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
  selectedRoomOption: {
    backgroundColor: "#15438e",
    borderColor: "#15438e",
  },
  roomOptionContent: {
    flex: 1,
  },
  roomOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  selectedRoomOptionText: {
    color: "#fff",
  },
  roomOptionCount: {
    fontSize: 14,
    color: "#64748b",
  },
  selectedRoomOptionCount: {
    color: "#e2e8f0",
  },
});
