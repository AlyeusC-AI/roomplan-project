import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import { Empty } from "@/components/ui/empty";
import {
  Ruler,
  ChevronRight,
  DoorClosed,
  Wind,
  Maximize2,
} from "lucide-react-native";
import {
  Room,
  useGetAreaAffected,
  useGetRooms,
} from "@service-geek/api-client";

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#2563eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  roomDimensions: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
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
  viewButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default function ScopeScreen() {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const {
    data: rooms,
    isLoading,
    refetch,
    isFetching,
    isRefetching,
  } = useGetRooms(projectId);
  const router = useRouter();

  const onCreateRoom = () => {
    router.push(`/projects/${projectId}/rooms/new`);
  };

  if (isLoading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator color="#2563eb" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <View className="px-5 py-6">
          {rooms?.length === 0 ? (
            <Empty
              title="No rooms added"
              description="Add rooms to start documenting scope of work"
              //   buttonText="Add First Room"
              //   onPress={onCreateRoom}
              icon={Ruler}
            />
          ) : (
            <View>
              <Text className="text-slate-500 text-sm mb-4">
                {rooms?.length} {rooms?.length === 1 ? "room" : "rooms"} in
                scope
              </Text>
              <View className="space-y-4">
                {rooms?.map((room) => (
                  <RoomScopeCard key={room.id} room={room} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* <TouchableOpacity
        onPress={onCreateRoom}
        style={styles.createButton}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Add New Room</Text>
      </TouchableOpacity> */}
    </View>
  );
}

function RoomScopeCard({ room }: { room: Room }) {
  const router = useRouter();
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const getTotalAreaRemoved = (room: any) => {
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

  const { data: areaAffected } = useGetAreaAffected(room.id);
  return (
    <View key={room.id} style={styles.card}>
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomDimensions}>
              {room.length || 0}' × {room.width || 0}' × {room.height || 0}'
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/projects/${projectId}/rooms/${room.id}/scope?roomName=${encodeURIComponent(
                  room.name
                )}`
              )
            }
            style={styles.viewButton}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
            <ChevronRight color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View className="flex-row items-center mb-1">
              <Maximize2 size={14} color="#64748b" />
              <Text style={[styles.statLabel, { marginLeft: 4 }]}>
                Total Area
              </Text>
            </View>
            <Text style={styles.statValue}>
              {(
                Number(room.length || 0) * Number(room.width || 0)
              ).toLocaleString()}{" "}
              sqft
            </Text>
          </View>
          <View style={styles.statBox}>
            <View className="flex-row items-center mb-1">
              <DoorClosed size={14} color="#64748b" />
              <Text style={[styles.statLabel, { marginLeft: 4 }]}>Doors</Text>
            </View>
            <Text style={styles.statValue}>{room.doors || 0}</Text>
          </View>
          <View style={styles.statBox}>
            <View className="flex-row items-center mb-1">
              <Wind size={14} color="#64748b" />
              <Text style={[styles.statLabel, { marginLeft: 4 }]}>Windows</Text>
            </View>
            <Text style={styles.statValue}>{room.windows || 0}</Text>
          </View>
        </View>

        {[
          areaAffected?.ceilingAffected,
          areaAffected?.floorAffected,
          areaAffected?.wallsAffected,
        ].filter((a: any) => a?.isVisible).length > 0 ? (
          <>
            <Text className="text-sm font-medium text-slate-700 mb-3">
              Areas Affected
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
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
            </ScrollView>
            <View className="pt-3 border-t border-slate-100">
              <Text className="text-sm text-slate-500">
                Total Area Removed:{" "}
                <Text className="font-medium text-slate-700">
                  {getTotalAreaRemoved(room).toLocaleString()} sqft
                </Text>
              </Text>
            </View>
          </>
        ) : (
          <Text className="text-sm text-slate-500 italic">
            No areas affected yet
          </Text>
        )}
      </View>
    </View>
  );
}
