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

  // FAB state
  const [showFabOptions, setShowFabOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingReading, setIsCreatingReading] = useState(false);

  // Hooks for actions
  const { mutate: createNote } = useOfflineCreateNote();
  const { mutate: createRoomReading } = useOfflineCreateRoomReading(projectId);
  const { mutate: addImage } = useAddImage();
  const { isOffline } = useNetworkStatus();
  const { addToQueue } = useOfflineUploadsStore();

  // Action handlers
  const handleAddNote = async () => {
    try {
      setIsCreatingNote(true);
      await createNote({
        body: "",
        roomId: roomId,
        projectId: projectId,
      });
      toast.success("Note added successfully");
      setShowFabOptions(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create note");
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleAddReading = async () => {
    try {
      setIsCreatingReading(true);
      createRoomReading({
        roomId: roomId,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
      toast.success("Reading added successfully");
      setShowFabOptions(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reading");
    } finally {
      setIsCreatingReading(false);
    }
  };

  const uploadToSupabase = async (imagePath: string) => {
    if (isOffline) {
      addToQueue({
        projectId,
        roomId,
        imagePath,
        imageUrl: imagePath,
        metadata: {
          size: 0,
          type: "image/jpeg",
          name: "offline-image",
        },
      });
      toast.success("Image added to offline queue");
      return true;
    }

    try {
      await addImage({
        data: {
          url: imagePath,
          roomId: roomId,
          projectId,
        },
      });
      return true;
    } catch (error) {
      console.error("Upload error:", error);
      addToQueue({
        projectId,
        roomId,
        imagePath,
        imageUrl: imagePath,
        metadata: {
          size: 0,
          type: "image/jpeg",
          name: "failed-upload",
        },
      });
      toast.error("Upload failed, added to offline queue");
      return false;
    }
  };

  const handleTakePhoto = async () => {
    try {
      router.push("../camera");
      //   setIsUploading(true);
      //   await takePhoto(roomId, {
      //     bucket: STORAGE_BUCKETS.PROJECT,
      //     pathPrefix: `projects/${projectId}/rooms`,
      //     compression: "high",
      //     projectId,
      //     roomId: roomId,
      //     isOffline,
      //     addToOfflineQueue: addToQueue,
      //     onSuccess: async (file) => {
      //       if (!isOffline && file.url && file.url !== file.path) {
      //         await uploadToSupabase(file.url);
      //       }
      //     },
      //   });
      setShowFabOptions(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickImages = async () => {
    try {
      setIsUploading(true);
      await pickMultipleImages(roomId, {
        bucket: STORAGE_BUCKETS.PROJECT,
        pathPrefix: `projects/${projectId}/rooms`,
        compression: "medium",
        maxImages: 20,
        projectId,
        roomId: roomId,
        isOffline,
        addToOfflineQueue: addToQueue,
        onSuccess: async (files) => {
          for (const file of files) {
            if (!isOffline && file.url && file.url !== file.path) {
              await uploadToSupabase(file.url);
            }
          }
        },
      });
      setShowFabOptions(false);
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    } finally {
      setIsUploading(false);
    }
  };

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
      <View style={styles.fabContainer}>
        {/* FAB Options Modal */}
        <Modal
          visible={showFabOptions}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowFabOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowFabOptions(false)}
          >
            <View style={styles.fabOptionsContainer}>
              {/* Take Photo Option */}
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handleTakePhoto}
                disabled={isUploading}
              >
                <View style={[styles.fabOptionIcon, styles.cameraIcon]}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <CameraIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Take Photo</Text>
              </TouchableOpacity>

              {/* Upload Images Option */}
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handlePickImages}
                disabled={isUploading}
              >
                <View style={[styles.fabOptionIcon, styles.uploadIcon]}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ImagePlusIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Upload Images</Text>
              </TouchableOpacity>

              {/* Add Note Option */}
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handleAddNote}
                disabled={isCreatingNote}
              >
                <View style={[styles.fabOptionIcon, styles.noteIcon]}>
                  {isCreatingNote ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <FileTextActionIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Add Note</Text>
              </TouchableOpacity>

              {/* Add Reading Option */}
              <TouchableOpacity
                style={styles.fabOption}
                onPress={handleAddReading}
                disabled={isCreatingReading}
              >
                <View style={[styles.fabOptionIcon, styles.readingIcon]}>
                  {isCreatingReading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <BookOpenActionIcon size={20} color="#fff" />
                  )}
                </View>
                <Text style={styles.fabOptionText}>Add Reading</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Main FAB Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            (isUploading || isCreatingNote || isCreatingReading) &&
              styles.fabDisabled,
          ]}
          onPress={() => setShowFabOptions(!showFabOptions)}
          disabled={isUploading || isCreatingNote || isCreatingReading}
        >
          {isUploading || isCreatingNote || isCreatingReading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <PlusIcon size={30} color="#fff" />
          )}
        </TouchableOpacity>
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
    borderBottomWidth: 3,
    borderBottomColor: "#f4f4f4",
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
