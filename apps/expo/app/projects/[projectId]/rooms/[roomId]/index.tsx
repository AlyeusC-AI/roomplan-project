import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Ruler,
  Plus,
  Camera,
  ImagePlus,
  FileText as FileTextIcon,
  BookOpen as BookOpenIcon,
} from "lucide-react-native";
import { useGetRooms } from "@service-geek/api-client";
import ImagesTab from "./ImagesTab";
import ReadingsTab from "./ReadingsTab";
import NotesTab from "./NotesTab";
import ScopeTab from "./ScopeTab";
import { useOfflineCreateNote } from "@/lib/hooks/useOfflineNotes";
import { useOfflineCreateRoomReading } from "@/lib/hooks/useOfflineReadings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";
import {
  takePhoto,
  pickMultipleImages,
  STORAGE_BUCKETS,
} from "@/lib/utils/imageModule";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useAddImage } from "@service-geek/api-client";
import FabMenu from "./FabMenu";

// Type assertions to fix ReactNode compatibility
const ChevronLeftIcon = ChevronLeft as any;
const ImageIconComponent = ImageIcon as any;
const BookOpenIconComponent = BookOpen as any;
const FileTextIconComponent = FileText as any;
const RulerIconComponent = Ruler as any;
const PlusIcon = Plus as any;
const CameraIcon = Camera as any;
const ImagePlusIcon = ImagePlus as any;
const FileTextActionIcon = FileTextIcon as any;
const BookOpenActionIcon = BookOpenIcon as any;

const TABS = [
  { key: "Images", label: "Images", icon: ImageIconComponent },
  { key: "Readings", label: "Readings", icon: BookOpenIconComponent },
  { key: "Notes", label: "Notes", icon: FileTextIconComponent },
  { key: "Scope", label: "Scope", icon: RulerIconComponent },
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

  // Hooks for actions
  const { mutate: createNote } = useOfflineCreateNote();
  const { mutate: createRoomReading } = useOfflineCreateRoomReading(projectId);
  const { mutate: addImage } = useAddImage();
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineUploadsStore();

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
            <ChevronLeftIcon size={24} color="#1e293b" />
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

      {/* FAB with Options */}
      <FabMenu
        roomId={roomId}
        projectId={projectId}
        onTakePhoto={() => {
          router.push({ pathname: "../camera", params: { projectId, roomId } });
        }}
      />
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
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.04,
    // shadowRadius: 3,
    // elevation: 2,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    // borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 8,
    // marginBottom: 4,
    overflow: "hidden",
    // borderBottomWidth: 3,
    // borderBottomColor: "#f4f4f4",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    // borderRadius: 16,
    backgroundColor: "#fff",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#2563eb",
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
    backgroundColor: "#f8fafc",
  },
  // FAB Styles
  fabContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 100,
    paddingRight: 20,
  },
  fabOptionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  fabOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  fabOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cameraIcon: {
    backgroundColor: "#10b981",
  },
  uploadIcon: {
    backgroundColor: "#2563eb",
  },
  noteIcon: {
    backgroundColor: "#f59e0b",
  },
  readingIcon: {
    backgroundColor: "#8b5cf6",
  },
  fabOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
  },
});
