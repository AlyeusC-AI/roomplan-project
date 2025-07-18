import React from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useGetRoomReadings } from "@service-geek/api-client";
import RoomReading from "@/components/project/reading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Plus, WifiOff } from "lucide-react-native";
import { useOfflineCreateRoomReading } from "@/lib/hooks/useOfflineReadings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";

// Type assertions to fix ReactNode compatibility
const PlusComponent = Plus as any;
const WifiOffComponent = WifiOff as any;

export default function ReadingsTab({
  projectId,
  roomId,
  room,
}: {
  projectId: string;
  roomId: string;
  room: any;
}) {
  const { data: readingsData } = useGetRoomReadings(roomId);
  const { mutate: createRoomReading, isPending: isCreatingRoomReading } =
    useOfflineCreateRoomReading(projectId);
  const { isOffline } = useNetworkStatus();

  const addReading = async () => {
    try {
      createRoomReading({
        roomId: roomId,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reading");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Reading button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Room Readings</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <WifiOffComponent size={16} color="#ef4444" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        <Button
          onPress={addReading}
          size="sm"
          variant="outline"
          disabled={isCreatingRoomReading}
        >
          {isCreatingRoomReading ? (
            <ActivityIndicator />
          ) : (
            <View style={styles.buttonContent}>
              <PlusComponent color="#1e40af" height={18} width={18} />
              <Text style={styles.buttonText}>Add Reading</Text>
            </View>
          )}
        </Button>
      </View>

      {/* Readings list */}
      {!readingsData?.data?.length ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No readings for this room yet.</Text>
        </View>
      ) : (
        <ScrollView style={styles.readingsList}>
          {readingsData.data.map((reading: any) => (
            <View key={reading.id} style={styles.card}>
              <RoomReading
                room={room}
                reading={reading}
                projectId={projectId}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 4,
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "500",
  },
  readingsList: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    fontStyle: "italic",
  },
});
