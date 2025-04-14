import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { format, formatDistance } from "date-fns";
import {
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Platform,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  Building,
  Camera,
  Edit2,
  Mic,
  MoreVertical,
  Plus,
  Square,
  Trash,
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import { toast } from "sonner-native";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ActivityIndicator, ScrollView, Image, Dimensions } from "react-native";
import Empty from "@/components/project/empty";
import { RefreshControl, View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { notesStore } from "@/lib/state/notes";
import { useDebounce } from "@/utils/debounce";
import { supabaseServiceRole } from "../camera";
import { v4 } from "react-native-uuid/dist/v4";
import AddRoomButton from "@/components/project/AddRoomButton";
import { useCameraStore } from "@/lib/state/camera";
import { userStore } from "@/lib/state/user";
import { router, useGlobalSearchParams } from "expo-router";
import { uploadImage } from "@/lib/imagekit";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  noteCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 12,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  singleImage: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    marginBottom: 8,
  },
  gridImage: {
    borderRadius: 8,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  modalImage: {
    width: "100%",
    height: "80%",
  },
  modalControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 16,
    zIndex: 10,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalContent: {
    flex: 1,
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalImageContainer: {
    width: screenWidth,
    height: screenHeight - 200,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(30, 64, 175, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    color: "#fff",
    fontSize: 16,
  },
  thumbnailContainer: {
    height: 80,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  thumbnailScroll: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: "hidden",
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: "#1e40af",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
});

const SUPABASE_IMAGE_URL =
  "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images";

// Function to optimize image URLs with different sizes
const getOptimizedImageUrl = (
  imageKey: string,
  size: "small" | "medium" | "large" = "medium"
): string => {
  const baseUrl = imageKey.startsWith("http")
    ? imageKey
    : `${SUPABASE_IMAGE_URL}/${imageKey}`;

  // For now, we're just returning the base URL, but in a real optimization
  // scenario, you might append query parameters for resizing
  // e.g. `${baseUrl}?width=300&height=300`
  // This depends on your image hosting service's capabilities
  return baseUrl;
};

// Helper function to generate image placeholder
function generatePlaceholderColor(imageKey: string): string {
  // Simple hash function to get a consistent color from the key
  let hash = 0;
  for (let i = 0; i < imageKey.length; i++) {
    hash = imageKey.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a pastel color
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 90%)`;
}

function OptimizedImage({
  uri,
  style,
  resizeMode = "cover",
  size = "medium",
  backgroundColor,
}: {
  uri: string;
  style: any;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract the image key from the URI if it's a Supabase URL
  const imageKey = uri.includes(SUPABASE_IMAGE_URL)
    ? uri.replace(`${SUPABASE_IMAGE_URL}/`, "")
    : "";

  // Generate placeholder color based on the image key
  const placeholderColor = generatePlaceholderColor(imageKey);

  // Optimize the URL based on the requested size
  const optimizedUri =
    uri.includes(SUPABASE_IMAGE_URL) && imageKey
      ? getOptimizedImageUrl(imageKey, size)
      : uri;

  return (
    <View
      style={[{ backgroundColor: backgroundColor || placeholderColor }, style]}
    >
      <Image
        source={{
          uri: optimizedUri,
          cache: "force-cache",
          headers:
            Platform.OS === "ios"
              ? { "Cache-Control": "max-age=31536000" }
              : undefined,
        }}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading && (
        <View style={[styles.loadingContainer, style]}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      )}
      {error && (
        <View
          style={[
            styles.loadingContainer,
            style,
            { backgroundColor: "rgba(0,0,0,0.05)" },
          ]}
        >
          <ImageIcon size={24} color="#9CA3AF" />
          <Text className="text-gray-400 mt-2">Failed to load image</Text>
        </View>
      )}
    </View>
  );
}

const RoomNoteListItem = ({
  room,
  addNote,
}: {
  room: RoomWithNotes;
  addNote: (roomId: string) => Promise<void>;
}) => {
  const onAdd = async () => {
    await addNote(room.publicId);
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: "#E0F2FE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building size={20} color="#0369A1" />
          </View>
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: "../rooms/create",
              params: {  roomName: room.name, roomId: room.publicId },
            })
          }}>
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{room.name}</Text>
          </TouchableOpacity>
        </View>
        <Button variant="ghost" onPress={onAdd} className="p-2">
          <Plus color="#1e40af" size={20} />
        </Button>
      </View>

      {room.Notes.map((note) => (
        <NoteCard key={note.publicId} note={note} room={room} />
      ))}

      {room.Notes.length === 0 && (
        <Card
          style={{
            padding: 16,
            marginBottom: 16,
            borderRadius: 12,
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: "#CBD5E1",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#64748B", marginBottom: 8 }}>
            No notes for this room
          </Text>
          <Button variant="outline" onPress={onAdd}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Plus size={16} color="#1e40af" />
              <Text style={{ color: "#1e40af" }}>Add Note</Text>
            </View>
          </Button>
        </Card>
      )}
    </View>
  );
};

function EditNoteModal({
  note,
  room,
  onSave,
}: {
  note: NoteWithAudits;
  room: RoomWithNotes;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(note.body);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="p-2">
          <Edit2 color="#1e40af" size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px]">
        <DialogHeader>
          <DialogTitle
            style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}
          >
            Edit Note
          </DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChangeText={setText}
          className="min-h-[200px]"
          placeholder="What's on your mind?"
          multiline
          autoFocus
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 16,
            gap: 12,
          }}
        >
          <Button
            variant="outline"
            onPress={() => {
              setText(note.body);
            }}
          >
            <Text style={{ color: "#6B7280" }}>Cancel</Text>
          </Button>
          <Button
            onPress={() => {
              onSave(text);
            }}
          >
            <Text style={{ color: "white" }}>Save</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

// Add new ImageGalleryModal component
const ImageGalleryModal = ({
  visible,
  onClose,
  images,
  initialIndex,
  onDeleteImage,
}: {
  visible: boolean;
  onClose: () => void;
  images: any[];
  initialIndex: number;
  onDeleteImage: (imageKey: string) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalScrollRef = useRef<FlatList>(null);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  // Handle modal open
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialIndex]);

  // Handle modal close
  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Handle scroll end
  const handleScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  // Render image in the modal
  const renderModalItem = ({ item }: { item: any }) => (
    <View style={styles.modalImageContainer}>
      <OptimizedImage
        uri={
          item.imageKey.startsWith("http")
            ? item.imageKey
            : `${SUPABASE_IMAGE_URL}/${item.imageKey}`
        }
        style={styles.modalImage}
        resizeMode="contain"
        backgroundColor="#000000"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            backgroundColor: "rgba(0,0,0,0.9)",
          },
        ]}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#fff" />
            </Pressable>
            <Text style={styles.modalTitle}>Image Gallery</Text>
            {images[currentIndex] && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Image",
                    "Are you sure you want to delete this image?",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          onDeleteImage(images[currentIndex].imageKey);
                        },
                      },
                    ]
                  );
                }}
                style={[styles.closeButton, { right: 60 }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            ref={modalScrollRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            renderItem={renderModalItem}
            keyExtractor={(item) => item.imageKey}
            onMomentumScrollEnd={handleScrollEnd}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={3}
            scrollEventThrottle={16}
            decelerationRate="fast"
          />

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              onPress={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  modalScrollRef.current?.scrollToIndex({
                    index: currentIndex - 1,
                    animated: true,
                  });
                }
              }}
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              disabled={currentIndex === 0}
            >
              <ChevronLeft
                size={30}
                color={currentIndex === 0 ? "#666" : "#fff"}
              />
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              {currentIndex + 1} / {images.length}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (currentIndex < images.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  modalScrollRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                  });
                }
              }}
              style={[
                styles.navButton,
                currentIndex === images.length - 1 && styles.navButtonDisabled,
              ]}
              disabled={currentIndex === images.length - 1}
            >
              <ChevronRight
                size={30}
                color={currentIndex === images.length - 1 ? "#666" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.thumbnailContainer}>
            <ScrollView
              ref={thumbnailScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
              scrollEventThrottle={16}
              bounces={false}
              decelerationRate="fast"
              snapToInterval={70}
              snapToAlignment="start"
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={image.imageKey}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => {
                    setCurrentIndex(index);
                    modalScrollRef.current?.scrollToIndex({
                      index,
                      animated: true,
                      viewPosition: 0.5,
                    });
                    thumbnailScrollRef.current?.scrollTo({
                      x: index * 70,
                      animated: true,
                    });
                  }}
                  style={[
                    styles.thumbnail,
                    index === currentIndex && styles.activeThumbnail,
                  ]}
                >
                  <OptimizedImage
                    uri={
                      image.imageKey.startsWith("http")
                        ? image.imageKey
                        : `${SUPABASE_IMAGE_URL}/${image.imageKey}`
                    }
                    style={styles.thumbnailImage}
                    size="small"
                    backgroundColor="#000000"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

function NoteCard({
  note,
  room,
}: {
  note: NoteWithAudits;
  room: RoomWithNotes;
}) {
  const [recognizing, setRecognizing] = useState(false);
  const [noteId, setNoteId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tempNote, setNote] = useState(note.body);
  const notes = notesStore();
  const { setFieldId, images, clearImages, fieldId } = useCameraStore();
  const { session } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();

  // State to track newly uploaded images for highlighting
  const [highlightedImageIndex, setHighlightedImageIndex] = useState<
    number | null
  >(null);
  // Reference to the note element for scrolling
  const noteRef = useRef<View>(null);
  // State to track if image grid is expanded or collapsed
  const [expandedImageGrid, setExpandedImageGrid] = useState(false);
  // Number of images to show when collapsed
  const PREVIEW_IMAGE_COUNT = 4;

  useEffect(() => {
    setNote(note.body);
  }, [note.body]);

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    setNoteId((noteId) => {
      console.log("🚀 ~ useSpeechRecognitionEvent ~ noteId:", noteId);
      console.log("🚀 ~ setNoteId ~ note.publicId:", note.publicId);

      if (noteId != note.publicId) {
        return noteId;
      }
      setRecognizing(false);
      console.log(transcript);
      if (!tempNote.includes(transcript)) {
        setNote(`${tempNote} ${transcript}`);
      }
      setTimeout(() => setTranscript(""), 1000);
      return "";
    });
  });
  useSpeechRecognitionEvent("result", (event) => {
    if (noteId != note.publicId) {
      return;
    }
    setTranscript(event.results[0]?.transcript);

    console.log(
      "🚀 ~ useSpeechRecognitionEvent ~ event.results[0]?.transcript:",
      event.results[0]?.transcript
    );

    // console.log(transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    toast.error(event.error ?? "Error recognizing speech");
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async (id: string) => {
    console.log("🚀 ~ handleStart ~ id:", id, note.publicId);

    if (id != note.publicId) {
      return;
    }
    setNoteId(id);

    if (recognizing) {
      setRecognizing(false);
      // setNoteId("");
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      toast.error(
        "Permission to access speech recognition not granted. Please enable this in your device settings."
      );
      return;
    }
    setNoteId(id);
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: ["Carlsen", "Nepomniachtchi", "Praggnanandhaa"],
    });
  };

  // Using a longer debounce time for better performance
  const debouncedNote = useDebounce(tempNote, 1500);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save when note changes
  useEffect(() => {
    if (debouncedNote !== note.body && !recognizing) {
      // Don't update if the note is empty or unchanged
      if (debouncedNote.trim() === note.body.trim()) return;

      // Auto-save silently
      (async () => {
        setIsSaving(true);
        await updateNote(note.publicId, room.publicId, debouncedNote, true);
        setIsSaving(false);
      })();
    }
  }, [debouncedNote]);

  // Modified updateNote function with a silent mode option
  const updateNote = async (
    noteId: string,
    roomId: string,
    body: string,
    silent = false
  ) => {
    try {
      if (!silent) setIsUpdating(true);
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes`,
        {
          method: "PATCH",
          headers: {
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({ noteId, body }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(
          "Could not update note. If this error persists, please contact support@restoregeek.app"
        );
        return;
      }

      notes.updateNote(
        {
          ...json.note,
          NoteImage: note.NoteImage,
        },
        roomId
      );

      // Only show success toast if not in silent mode
      if (!silent) {
        toast.success("Note updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Could not update note. If this error persists, please contact support@restoregeek.app"
      );
    } finally {
      if (!silent) setIsUpdating(false);
    }
  };

  const deleteNote = async (noteId: string, roomId: string) => {
    try {
      setIsDeleting(true);
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes/`,
        {
          method: "DELETE",
          headers: {
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({ noteId }),
        }
      );

      notes.deleteNote(noteId, roomId);
      toast.success("Note deleted successfully");
    } catch {
      toast.error(
        "Could not delete note. If this error persits, please contact support@restoregeek.app"
      );
    }

    setIsDeleting(false);
  };

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ images:", images);

    if (images.length > 0 && note.id == fieldId) {
      // Add to NoteImage table
      supabaseServiceRole
        .from("NoteImage")
        .insert({
          noteId: note.id,
          imageKey: images[0].url,
        })
        .then(({ data, error }) => {
          console.log("🚀 ~ .then ~ data, error:", data, error);

          clearImages();
          refreshNotes();
        });
    }
  }, [images, fieldId]);

  /**
   * Handles taking a photo with the camera
   */
  const takePhoto = async (noteId: number, onSuccess?: () => void) => {
    console.log("🚀 ~ takePhoto ~ noteId:", noteId);
    setFieldId(noteId.toString());
    router.push("../camera");

    return;
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      toast.error("Camera permission is required to take photos");
      return;
    }

    try {
      setImageUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        toast("Capturing image...");
        await uploadImageToSupabase(result.assets[0], noteId, onSuccess);

        // Explicitly refresh the UI to show the new image
        await refreshNotes();

        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to capture image");
    } finally {
      setImageUploading(false);
    }
  };

  // Helper function to refresh notes data after image actions
  const refreshNotes = async () => {
    try {
      const notesRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes`,
        {
          headers: {
            "auth-token": `${session?.access_token}`,
          },
        }
      );
      const data = await notesRes.json();
      notes.setNotes(data.notes);

      // After refreshing, highlight the latest image but don't automatically open it
      const updatedNote = data.notes
        .flatMap((room: RoomWithNotes) => room.Notes)
        .find((n: NoteWithAudits) => n.publicId === note.publicId);

      if (updatedNote?.NoteImage?.length) {
        // Highlight the last image (most recently uploaded) without opening it
        setHighlightedImageIndex(updatedNote.NoteImage.length - 1);

        // Make sure the note is visible by scrolling to it
        if (noteRef.current) {
          // We need to use setTimeout to ensure this happens after rendering
          setTimeout(() => {
            noteRef.current?.measureInWindow((x, y, width, height) => {
              if (y < 0 || y > height) {
                // If the note is not visible in the window, attempt to make it visible
                // Note: React Native doesn't have scrollIntoView, so we'll just highlight more prominently
                setHighlightedImageIndex(updatedNote.NoteImage.length - 1);
              }
            });
          }, 300);
        }

        // Clear the highlight after 3 seconds
        setTimeout(() => {
          setHighlightedImageIndex(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to refresh notes:", error);
    }
  };

  const deleteImage = async (imageKey: string) => {
    try {
      // Delete from storage
      const storageResult = await supabaseServiceRole.storage
        .from("note-images")
        .remove([imageKey]);

      if (storageResult.error) {
        throw storageResult.error;
      }

      // Delete from database
      const dbResult = await supabaseServiceRole
        .from("NoteImage")
        .delete()
        .eq("imageKey", imageKey);

      if (dbResult.error) {
        throw dbResult.error;
      }

      // Fetch fresh data after deletion
      const notesRes = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes`,
        {
          headers: {
            "auth-token": `${session?.access_token}`,
          },
        }
      );

      if (!notesRes.ok) {
        throw new Error("Failed to fetch updated notes");
      }

      const data = await notesRes.json();

      // Update the notes state
      notes.setNotes(data.notes);

      // Update modal state
      if (selectedImageIndex !== null) {
        const updatedNote = data.notes
          .flatMap((room: RoomWithNotes) => room.Notes)
          .find((n: NoteWithAudits) => n.publicId === note.publicId);

        if (!updatedNote?.NoteImage?.length) {
          // If no images left, close the modal
          handleCloseModal();
        } else if (selectedImageIndex >= updatedNote.NoteImage.length) {
          // If current index is beyond available images, go to last image
          setSelectedImageIndex(updatedNote.NoteImage.length - 1);
        }
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Delete image error:", error);
      toast.error("Failed to delete image");
    }
  };

  // Handle image options - combined function for camera and gallery
  const handleImageOptions = async () => {
    // Show options menu for image actions
    Alert.alert(
      "Add Images",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto(note.id, refreshNotes),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickMultipleImages(note.id, refreshNotes),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handles picking multiple images from the gallery
   */
  const pickMultipleImages = async (noteId: number, onSuccess?: () => void) => {
    // Request media library permissions
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryPermission.status !== "granted") {
      toast.error("Media library permission is required to select photos");
      return;
    }

    try {
      setImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 20, // Increased limit to 20 images
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageCount = result.assets.length;

        // Show appropriate loading message based on number of images
        if (imageCount === 1) {
          toast("Uploading image...");
        } else {
          toast(`Uploading ${imageCount} images...`);
        }

        // Process and upload each image
        const uploadPromises = result.assets.map((asset) =>
          uploadImageToSupabase(asset, noteId)
        );

        await Promise.all(uploadPromises);

        // Always call refreshNotes to update the UI
        await refreshNotes();

        // Also call onSuccess if provided (for compatibility)
        if (onSuccess) onSuccess();

        // Show appropriate success message
        if (imageCount === 1) {
          toast.success("Image uploaded successfully");
        } else {
          toast.success(`${imageCount} images uploaded successfully`);
          // Auto-expand the grid when uploading multiple images
          setExpandedImageGrid(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  // Update modal close handling
  const handleCloseModal = useCallback(() => {
    // First animate out
    setSelectedImageIndex(null);
  }, []);

  // Update modal open handling
  const handleOpenModal = useCallback((index: number) => {
    // Set the index first
    setSelectedImageIndex(index);
  }, []);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      setSelectedImageIndex(null);
    };
  }, []);

  return (
    <Card style={styles.noteCard} ref={noteRef}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[styles.userAvatar, { backgroundColor: "#EFF6FF" }]}>
            <Text
              style={{ color: "#1E40AF", fontWeight: "bold", fontSize: 18 }}
            >
              {note.NotesAuditTrail?.[0]?.userName?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>
              {note.NotesAuditTrail?.[0]?.userName || "User"}
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 13 }}>
              {format(new Date(note.date), "LLLL	d, yyyy hh:mm a")}
            </Text>
          </View>
        </View>

        {/* Action buttons moved to the top */}
        <View style={{ flexDirection: "row", gap: 0 }}>
          <Button
            variant="ghost"
            className="p-1"
            disabled={isUpdating || imageUploading}
            onPress={() => handleStart(note.publicId)}
          >
            {recognizing && note.publicId == noteId ? (
              <Square color="red" size={20} />
            ) : (
              <Mic color="#1e40af" size={20} />
            )}
          </Button>

          {/* Combined image button for camera and gallery */}
          <Button
            variant="ghost"
            className="p-1"
            disabled={isUpdating || imageUploading}
            onPress={handleImageOptions}
          >
            {imageUploading ? (
              <ActivityIndicator size="small" color="#1e40af" />
            ) : (
              <Camera color="#1e40af" size={20} />
            )}
          </Button>

          {/* Delete button with confirmation */}
          <Button
            variant="ghost"
            className="p-1"
            disabled={isDeleting}
            onPress={() => {
              Alert.alert(
                "Delete Note",
                "Are you sure you want to delete this note? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteNote(note.publicId, room.publicId),
                  },
                ]
              );
            }}
          >
            {isDeleting ? (
              <ActivityIndicator />
            ) : (
              <Trash color="red" size={20} />
            )}
          </Button>
        </View>
      </View>

      {/* Always show textarea for direct editing */}
      <View style={{ position: "relative" }}>
        <Textarea
          value={tempNote}
          onChangeText={setNote}
          placeholder="What's on your mind?"
          style={{
            minHeight: 80,
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: isSaving ? "#93C5FD" : "#E5E7EB",
            fontSize: 16,
          }}
          multiline
          onBlur={() => {
            // Save changes when focus is lost
            if (tempNote !== note.body) {
              updateNote(note.publicId, room.publicId, tempNote);
            }
          }}
        />
        {isSaving && (
          <View
            style={{
              position: "absolute",
              bottom: 24,
              right: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: 4,
              padding: 4,
            }}
          >
            <ActivityIndicator
              size="small"
              color="#2563EB"
              style={{ marginRight: 4 }}
            />
            <Text style={{ fontSize: 12, color: "#2563EB" }}>Saving...</Text>
          </View>
        )}
      </View>

      {note.NoteImage && note.NoteImage.length > 0 && (
        <View style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden" }}>
          {note.NoteImage.length === 1 ? (
            <Pressable onPress={() => handleOpenModal(0)}>
              <OptimizedImage
                uri={
                  note.NoteImage[0].imageKey.startsWith("http")
                    ? note.NoteImage[0].imageKey
                    : `${SUPABASE_IMAGE_URL}/${note.NoteImage[0].imageKey}`
                }
                style={{
                  ...styles.singleImage,
                  borderWidth: highlightedImageIndex === 0 ? 3 : 0,
                  borderColor:
                    highlightedImageIndex === 0 ? "#3B82F6" : "transparent",
                }}
                size="large"
              />
            </Pressable>
          ) : (
            <>
              <View style={styles.imageGrid}>
                {(expandedImageGrid
                  ? note.NoteImage
                  : note.NoteImage.slice(0, PREVIEW_IMAGE_COUNT)
                ).map((image, index) => (
                  <Pressable
                    key={`${note.publicId}-image-${index}`}
                    onPress={() => handleOpenModal(index)}
                    style={{
                      width:
                        note.NoteImage?.length === 2
                          ? "50%"
                          : note.NoteImage?.length === 3 && index === 0
                          ? "100%"
                          : "50%",
                      padding: 4,
                      transform: [
                        { scale: highlightedImageIndex === index ? 1.05 : 1 },
                      ],
                    }}
                  >
                    <OptimizedImage
                      uri={
                        image.imageKey.startsWith("http")
                          ? image.imageKey
                          : `${SUPABASE_IMAGE_URL}/${image.imageKey}`
                      }
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 8,
                        borderWidth: highlightedImageIndex === index ? 3 : 0,
                        borderColor:
                          highlightedImageIndex === index
                            ? "#3B82F6"
                            : "transparent",
                      }}
                      size="medium"
                    />
                  </Pressable>
                ))}
              </View>

              {/* Only show the See More/Less button if we have more than PREVIEW_IMAGE_COUNT images */}
              {note.NoteImage.length > PREVIEW_IMAGE_COUNT && (
                <Pressable
                  onPress={() => setExpandedImageGrid(!expandedImageGrid)}
                  style={{
                    padding: 8,
                    backgroundColor: "#F3F4F6",
                    borderRadius: 8,
                    marginTop: 8,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Text style={{ color: "#1E40AF", fontWeight: "600" }}>
                    {expandedImageGrid
                      ? "Show less"
                      : `Show all ${note.NoteImage.length} images`}
                  </Text>
                  {expandedImageGrid ? (
                    <ChevronUp size={18} color="#1E40AF" />
                  ) : (
                    <ChevronDown size={18} color="#1E40AF" />
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      )}

      {note.updatedAt && (
        <Text style={{ color: "#6B7280", fontSize: 13 }}>
          Updated{" "}
          {formatDistance(new Date(note.updatedAt), Date.now(), {
            addSuffix: true,
          })}
          {note.NotesAuditTrail &&
            note.NotesAuditTrail.length > 0 &&
            note.NotesAuditTrail[0].userName && (
              <Text> by {note.NotesAuditTrail[0].userName}</Text>
            )}
        </Text>
      )}

      <ImageGalleryModal
        visible={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        images={note.NoteImage || []}
        initialIndex={selectedImageIndex || 0}
        onDeleteImage={deleteImage}
      />
    </Card>
  );
}

/**
 * Uploads an image to Supabase and adds it to the note
 */
const uploadImageToSupabase = async (
  photo: ImagePicker.ImagePickerAsset,
  noteId: number,
  onSuccess?: () => void
) => {
  const p = {
    uri: photo.uri,
    name: photo.fileName || `${v4()}.jpeg`,
    type: photo.mimeType || "image/jpeg",
  };

  const formData = new FormData();
  // @ts-expect-error react-native form data typing issue
  formData.append("file", p);

  try {
    // Upload to Supabase storage
    // const res = await supabaseServiceRole.storage
    //   .from("note-images")
    //   .upload(`/${noteId}/${v4()}.jpeg`, formData, {
    //     cacheControl: "3600",
    //     upsert: false,
    //   });

       // Upload to ImageKit
       const uploadResult = await uploadImage(
        {
          uri: photo.uri,
          type: "image/jpeg",
          name: photo.fileName || `${v4()}.jpeg`,
        },
        {
          // folder: `projects/${projectId}/notes/${noteId}`,
          // useUniqueFileName: true,
          // tags: [`project-${projectId}`, `note-${noteId}`],
        }
      );
       console.log("🚀 ~ uploadResult:", uploadResult)


    if (!uploadResult.url) {
      throw new Error("Failed to upload image");
    }

    // Add to NoteImage table
    const { data, error } = await supabaseServiceRole.from("NoteImage").insert({
      noteId,
      imageKey: uploadResult.url,
    });

    if (error) {
      console.error(
        "Failed to add image to NoteImage table",
        JSON.stringify(error, null, 2)
      );
      // throw new Error("Failed to add image to NoteImage table");
      return toast.error("Failed to add image to NoteImage table");
    }

    // Call onSuccess callback if provided
    if (onSuccess) {
      await onSuccess();
    }

    return uploadResult.url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export default function RoomNotes() {
  const { session } = userStore((state) => state);
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const [loading, setLoading] = useState(false);
  const notes = notesStore();
  const [refreshing, setRefreshing] = useState(false);

  const addNote = async (roomId: string) => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes`,
        {
          method: "POST",
          headers: {
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({ body: "", roomId }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(
          "Could not add note. If this error persists, please contact support@restoregeek.app"
        );
        return;
      }

      notes.addNote(json.note, roomId);
      toast.success("Note added successfully");
    } catch {
      toast.error(
        "Could not add note. If this error persists, please contact support@restoregeek.app"
      );
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    console.log("FETCHING NOTES");
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/notes`,
      {
        headers: {
          "auth-token": `${session?.access_token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("FETCHED NOTES");
        setLoading(false);
        console.log(data);
        notes.setNotes(data.notes);
      });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  }, [projectId, session?.access_token]);

  useEffect(() => {
    console.log("fetching notes");
    fetchNotes();
  }, []);

  if (loading) {
    return (
      <View className="w-full h-full flex items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (notes.notes?.length === 0) {
    return (
      <Empty
        title="No Rooms"
        description="Create a room to add notes to it."
        buttonText="Create a room"
        icon={<Building height={50} width={50} />}
        secondaryIcon={
          <Plus height={20} width={20} color="#fff" className="ml-4" />
        }
        onPress={() =>
          router.push({
            pathname: "../rooms/create",
            params: { projectName },
          })
        }
      />
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <ActivityIndicator size="large" color="#1e40af" />
              <Text style={{ marginTop: 16, color: "#6B7280" }}>
                Loading notes...
              </Text>
            </View>
          ) : notes.notes?.length === 0 ? (
            <Empty
              icon={<Building size={36} color="#1e40af" />}
              secondaryIcon={<Building size={36} color="#1e40af" />}
              title="No notes added yet"
              description="Add a note to get started"
              buttonText="Add Note"
              onPress={() => router.push(`/projects/${projectId}/add-room`)}
            />
          ) : (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1e293b",
                    paddingTop: 8,
                  }}
                >
                  Notes
                </Text>
                <AddRoomButton showText={false} size="sm" />
              </View>

              {/* Add animation wrapper for smooth transitions */}
              <View style={{ gap: 12 }}>
                {notes.notes?.map((room) => (
                  <RoomNoteListItem
                    key={room.publicId}
                    room={room}
                    addNote={addNote}
                  />
                ))}
              </View>
            </>
          )}
                </TouchableWithoutFeedback>

        </ScrollView>
    </KeyboardAvoidingView>
  );
}
