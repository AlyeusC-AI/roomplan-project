import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Ruler,
  DoorClosed,
  Wind,
  X,
  Wifi,
  WifiOff,
} from "lucide-react-native";
import { toast } from "sonner-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDebounce } from "@/utils/debounce";
import {
  useGetRooms,
  Room,
  useGetAreaAffected,
  useUpdateAreaAffected,
  useUpdateRoom,
  useCreateEquipment,
  useDeleteEquipment,
  useGetEquipment,
  useUpdateEquipment,
  AreaAffected as AreaAffectedInterface,
  useGetRoom,
} from "@service-geek/api-client";
import Dimensions from "@/components/project/scope/Dimensions";
import AffectedArea from "@/components/project/scope/affectedArea";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";

// Type assertions to fix ReactNode compatibility
const ArrowLeftComponent = ArrowLeft as any;
const WifiComponent = Wifi as any;
const WifiOffComponent = WifiOff as any;

// Constants for area types and equipment
const areaAffectedTitle = {
  wall: "Walls",
  floor: "Floor",
  ceiling: "Ceiling",
};

const equipmentOptions = [
  // "Fan",
  "Dehumidifier",
  "Air Scrubber",
  "Air Mover",
  "HEPA Vacuum",
  "Drying System",
];

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#15438e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardContent: {
    padding: 20,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#334155",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  areaToggle: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  areaToggleActive: {
    backgroundColor: "#f0f9ff",
    borderColor: "#15438e",
  },
  areaTabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  areaTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  areaTabActive: {
    backgroundColor: "#15438e",
    shadowColor: "#15438e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  areaTabInactive: {
    backgroundColor: "#f1f5f9",
    borderColor: "rgba(0,0,0,0.05)",
  },
  areaTabText: {
    fontSize: 15,
    fontWeight: "600",
  },
  areaTabTextActive: {
    color: "#ffffff",
  },
  areaTabTextInactive: {
    color: "#64748b",
  },
  detailCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "80%",
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  saveBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  saveText: {
    fontSize: 13,
    color: "#64748b",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(30,136,229,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dimensionGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  dimensionInput: {
    flex: 1,
  },
  unitLabel: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
    fontSize: 14,
    color: "#64748b",
  },
  equipmentSelector: {
    backgroundColor: "#f8fafc",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    gap: 8,
  },
  offlineText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "500",
    flex: 1,
  },
});

export default function RoomScopeScreen() {
  const { roomId, roomName, projectId } = useGlobalSearchParams<{
    roomId: string;
    roomName: string;
    projectId: string;
  }>();

  const { data: room, isLoading } = useGetRoom(roomId);
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  if (isLoading && !room) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
        {isOffline && (
          <Text
            style={{ marginTop: 16, color: "#64748b", textAlign: "center" }}
          >
            Loading cached room data...
          </Text>
        )}
      </View>
    );
  }
  if (!room) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <Text style={{ fontSize: 18, color: "#1e293b", marginBottom: 8 }}>
          Room not found
        </Text>
        {isOffline && (
          <Text style={{ color: "#64748b", textAlign: "center" }}>
            This room may not be available offline. Please check your
            connection.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View style={[styles.headerContainer, { paddingTop: top }]}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 bg-white/10 rounded-full"
          >
            <ArrowLeftComponent color="white" size={20} />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-semibold">{roomName}</Text>
            <Text className="text-white/80 text-sm">
              Room Scope Details
              {isOffline && " (Offline)"}
            </Text>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView className="flex-1 bg-background">
          {/* Offline indicator */}
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <WifiOffComponent size={16} color="#ef4444" />
              <Text style={styles.offlineText}>
                Offline Mode - Changes will sync when online
              </Text>
            </View>
          )}

          <Dimensions room={room} />
          <AffectedArea room={room} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
