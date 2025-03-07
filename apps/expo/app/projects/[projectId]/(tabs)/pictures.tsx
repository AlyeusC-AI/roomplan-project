import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Camera } from "react-native-vision-camera";
import { Camera as CameraIcon, ImagePlus, Plus, Image as ImageIcon } from "lucide-react-native";
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Text } from "@/components/ui/text";
import { urlMapStore } from "@/lib/state/url-map";
import { roomInferenceStore } from "@/lib/state/readings-image";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/project/ImageGallery";
import { 
  takePhoto, 
  pickMultipleImages, 
  STORAGE_BUCKETS,
  getStorageUrl
} from "@/lib/utils/imageModule";
import safelyGetImageUrl from "@/utils/safelyGetImageKey";

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProjectPhotos() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const { session: supabaseSession } = userStore((state) => state);
  const [loading, setLoading] = useState(true);
  const [expandedValue, setExpandedValue] = useState<string | undefined>(undefined);
  const rooms = roomInferenceStore();
  const urlMap = urlMapStore();
  const router = useRouter();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch rooms
      const roomsRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );

      const roomsData = await roomsRes.json();
      rooms.setRooms(roomsData.rooms);

      // Fetch images
      const imagesRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/images`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      );
      const imagesData = await imagesRes.json();
      urlMap.setUrlMap(imagesData.urlMap);
      
      // Set the first room as expanded by default if none is selected
      if (!expandedValue && roomsData.rooms.length > 0) {
        setExpandedValue(roomsData.rooms[0].name);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const firstRoom = rooms.rooms.find(r => !r.isDeleted);
      if (!firstRoom) {
        toast.error("Please create a room first");
        return;
      }
      
      await takePhoto(
        firstRoom.id, 
        {
          bucket: STORAGE_BUCKETS.PROJECT,
          pathPrefix: `projects/${projectId}/rooms`,
          onRefresh: refreshData,
          compression: 'high'
        }
      );
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to take photo");
    }
  };

  const handlePickImages = async () => {
    try {
      const firstRoom = rooms.rooms.find(r => !r.isDeleted);
      if (!firstRoom) {
        toast.error("Please create a room first");
        return;
      }
      
      await pickMultipleImages(
        firstRoom.id,
        {
          bucket: STORAGE_BUCKETS.PROJECT,
          pathPrefix: `projects/${projectId}/rooms`,
          onRefresh: refreshData,
          compression: 'medium',
          maxImages: 20
        }
      );
    } catch (error) {
      console.error("Error picking images:", error);
      toast.error("Failed to pick images");
    }
  };

  // Get a preview image for a room
  const getRoomPreviewImage = (roomInferences: Array<{imageKey: string | null}> | undefined): string | null => {
    if (!roomInferences || roomInferences.length === 0) return null;
    
    for (const inference of roomInferences) {
      if (inference.imageKey) {
        const imageUrl = safelyGetImageUrl(urlMap.urlMap, inference.imageKey, '');
        if (imageUrl) return imageUrl;
      }
    }
    
    // If no valid image URL was found, try to get any image key and construct a URL
    for (const inference of roomInferences) {
      if (inference.imageKey) {
        // Try to construct a URL directly using the storage URL
        const directUrl = getStorageUrl(inference.imageKey);
        if (directUrl) return directUrl;
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!loading && rooms?.rooms?.length === 0) {
    return (
      <Empty
        title="No Images"
        description="Upload images to associate with this project. Images of rooms can be automatically assigned a room"
        buttonText="Start Taking Pictures"
        icon={<CameraIcon height={50} width={50} />}
        secondaryIcon={
          <CameraIcon height={20} width={20} color="#fff" className="ml-4" />
        }
        onPress={() => router.push("../camera")}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshData} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Project Photos</Text>
          <View style={styles.buttonContainer}>
            <Button
              className="mr-2"
              variant="outline"
              onPress={() => router.push("../rooms/create")}
            >
              <Plus size={18} color="#1e40af" />
              <Text className="ml-1 text-primary">Add Room</Text>
            </Button>
            <Button
              variant="outline"
              onPress={handlePickImages}
            >
              <ImagePlus size={18} color="#1e40af" />
              <Text className="ml-1 text-primary">Select Images</Text>
            </Button>
          </View>
        </View>

        <View style={styles.roomsContainer}>
          {rooms.rooms
            .filter((room) => !room.isDeleted)
            .map((room) => {
              const previewImageUrl = getRoomPreviewImage(room.Inference);
              const imageCount = room.Inference?.length || 0;
              
              return (
                <TouchableOpacity 
                  key={room.name}
                  style={styles.roomCard}
                  onPress={() => {
                    setExpandedValue(expandedValue === room.name ? undefined : room.name);
                  }}
                >
                  <View style={styles.roomCardContent}>
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text style={styles.imageCount}>
                        {imageCount} {imageCount === 1 ? 'image' : 'images'}
                      </Text>
                    </View>
                    
                    {previewImageUrl ? (
                      <Image 
                        source={{ uri: previewImageUrl }}
                        style={styles.roomPreviewImage}
                      />
                    ) : (
                      <View style={styles.roomPreviewPlaceholder}>
                        <ImageIcon size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  
                  {expandedValue === room.name && (
                    <View style={styles.galleryContainer}>
                      <ImageGallery
                        inferences={room.Inference || []}
                        urlMap={urlMap.urlMap}
                        onRefresh={refreshData}
                        roomName={room.name}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>

      {rooms.rooms.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            onPress={handleTakePhoto}
            style={styles.fab}
          >
            <CameraIcon size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  roomsContainer: {
    padding: 12,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  roomCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  imageCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  roomPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  roomPreviewPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
