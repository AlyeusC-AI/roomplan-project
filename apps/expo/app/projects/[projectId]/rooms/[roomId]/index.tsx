import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Ruler,
} from "lucide-react-native";
import { useGetRooms } from "@service-geek/api-client";
import ImagesTab from "./ImagesTab";
import ReadingsTab from "./ReadingsTab";
import NotesTab from "./NotesTab";
import ScopeTab from "./ScopeTab";

const TABS = [
  { key: "Images", label: "Images", icon: ImageIcon },
  { key: "Readings", label: "Readings", icon: BookOpen },
  { key: "Notes", label: "Notes", icon: FileText },
  { key: "Scope", label: "Scope", icon: Ruler },
];

export default function RoomScreen() {
  const router = useRouter();
  const { projectId, roomId } = useGlobalSearchParams<{
    projectId: string;
    roomId: string;
  }>();
  const { data: rooms } = useGetRooms(projectId);
  const room = useMemo(
    () => rooms?.find((r) => r.id === roomId),
    [rooms, roomId]
  );
  const [tab, setTab] = useState("Images");

  if (!room) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading room...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="bg-background relative"
      style={{ flex: 1, position: "relative" }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      {/* Header */}
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {room.name}
          </Text>
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.tabBarShadow}>
        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setTab(t.key)}
                activeOpacity={0.8}
              >
                <View style={styles.tabContentColumn}>
                  <Icon
                    size={22}
                    color={isActive ? "#2563eb" : "#64748b"}
                    style={{ marginBottom: 2 }}
                  />
                  <Text
                    style={[styles.tabText, isActive && styles.activeTabText]}
                  >
                    {t.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {tab === "Images" && (
          <ImagesTab projectId={projectId} roomId={roomId} room={room} />
        )}
        {tab === "Readings" && (
          <ReadingsTab projectId={projectId} roomId={roomId} room={room} />
        )}
        {tab === "Notes" && (
          <NotesTab projectId={projectId} roomId={roomId} room={room} />
        )}
        {tab === "Scope" && (
          <ScopeTab projectId={projectId} roomId={roomId} room={room} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderBottomWidth: 0,
    borderBottomColor: "#e5e7eb",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
  },
  tabBarShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#2563eb11",
  },
  tabContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabContentColumn: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  tabContent: {
    flex: 1,
    marginTop: 2,
    backgroundColor: "white",
  },
});
