import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Room, useGetAreaAffected } from "@service-geek/api-client";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { Text } from "@/components/ui/text";
import { Edit2 } from "lucide-react-native";
import { useRouter } from "expo-router";

// Type assertions to fix ReactNode compatibility
const Edit2Component = Edit2 as any;

export default function ScopeTab({
  projectId,
  roomId,
  room,
}: {
  projectId: string;
  roomId: string;
  room: Room;
}) {
  const { isOffline } = useNetworkStatus();
  const router = useRouter();
  const { data: areaAffected, isLoading: areaLoading } = useGetAreaAffected(
    room.id
  );

  const getTotalAreaRemoved = () => {
    return [
      areaAffected?.ceilingAffected,
      areaAffected?.floorAffected,
      areaAffected?.wallsAffected,
    ]
      .filter((a: any) => a?.isVisible)
      .reduce(
        (sum: number, area: any) => sum + (Number(area.totalAreaRemoved) || 0),
        0
      );
  };

  const handleEdit = () => {
    router.push(
      `/projects/${projectId}/rooms/${roomId}/scope?roomName=${encodeURIComponent(
        room.name
      )}`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Edit button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Room Scope</Text>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Edit2Component color="#1e40af" size={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <View>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomDimensions}>
              {room.length || 0}' × {room.width || 0}' × {room.height || 0}'
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Area</Text>
            <Text style={styles.statValue}>
              {(
                Number(room.length || 0) * Number(room.width || 0)
              ).toLocaleString()}{" "}
              sqft
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Doors</Text>
            <Text style={styles.statValue}>{room.doors || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Windows</Text>
            <Text style={styles.statValue}>{room.windows || 0}</Text>
          </View>
        </View>
        {isOffline && areaLoading && (
          <View style={styles.offlineDataIndicator}>
            <Text style={styles.offlineDataText}>Loading cached data...</Text>
          </View>
        )}
        {[
          areaAffected?.ceilingAffected,
          areaAffected?.floorAffected,
          areaAffected?.wallsAffected,
        ].filter((a: any) => a?.isVisible).length > 0 ? (
          <>
            <Text style={styles.areasTitle}>Areas Affected</Text>
            <View style={styles.areasRow}>
              {[
                { ...areaAffected?.ceilingAffected, type: "ceiling" },
                { ...areaAffected?.floorAffected, type: "floor" },
                { ...areaAffected?.wallsAffected, type: "wall" },
              ]
                .filter((a: any) => a?.isVisible)
                .map((area: any) => (
                  <View key={area.publicId} style={styles.areaTag}>
                    <Text style={styles.areaTagText}>
                      {area.type === "wall"
                        ? "Walls"
                        : area.type === "floor"
                          ? "Floor"
                          : "Ceiling"}
                      {area.totalAreaRemoved
                        ? ` · ${area.totalAreaRemoved} sqft`
                        : ""}
                    </Text>
                  </View>
                ))}
            </View>
            <Text style={styles.totalAreaRemoved}>
              Total Area Removed:{" "}
              <Text style={styles.totalAreaRemovedValue}>
                {getTotalAreaRemoved().toLocaleString()} sqft
              </Text>
            </Text>
          </>
        ) : (
          <Text style={styles.noAreas}>No areas affected yet</Text>
        )}
      </View>
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
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  roomDimensions: {
    fontSize: 14,
    color: "#64748b",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  offlineDataIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  offlineDataText: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "500",
  },
  areasTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  areasRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  areaTag: {
    backgroundColor: "#f0f9ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  areaTagText: {
    color: "#0284c7",
    fontSize: 13,
    fontWeight: "500",
  },
  totalAreaRemoved: {
    fontSize: 14,
    color: "#64748b",
  },
  totalAreaRemovedValue: {
    fontWeight: "600",
    color: "#334155",
  },
  noAreas: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
  },
});
