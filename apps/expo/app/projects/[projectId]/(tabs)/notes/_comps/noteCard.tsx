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
  FileText,
} from "lucide-react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
import { useDebounce } from "@/utils/debounce";
import { v4 } from "react-native-uuid/dist/v4";
import AddRoomButton from "@/components/project/AddRoomButton";
import { useCameraStore } from "@/lib/state/camera";
import { router, useGlobalSearchParams } from "expo-router";
import { uploadImage } from "@/lib/imagekit";
import {
  useCreateNote,
  useGetNotes,
  useGetNote,
  useGetRooms,
  useUpdateRoom,
  useDeleteRoom,
  Note,
  Room,
  useAddImage,
  useRemoveImage,
} from "@service-geek/api-client";
import {
  useOfflineUpdateNote,
  useOfflineDeleteNote,
} from "@/lib/hooks/useOfflineNotes";
import { useOfflineUploadsStore } from "@/lib/state/offline-uploads";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import ImageGalleryModal, { OptimizedImage } from "./notesGallery";
import { useQueryClient } from "@tanstack/react-query";
import { SvgProps } from "react-native-svg";

// Type assertions to fix ReactNode compatibility
const FileTextComponent = FileText as any;
const SquareComponent = Square as any;
const MicComponent = Mic as any;
const CameraComponent = Camera as any;
const TrashComponent = Trash as any;
const ChevronUpComponent = ChevronUp as any;
const ChevronDownComponent = ChevronDown as any;

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  noteCard: {
    padding: 16,
    // marginBottom: 16,
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

export default function NoteCard({ note, room }: { note: Note; room: Room }) {
  console.log("🚀 ~ NoteCard ~ note:", note.images?.length);
  const [recognizing, setRecognizing] = useState(false);
  const [noteId, setNoteId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const { mutate: updateNoteMutation } = useOfflineUpdateNote();
  const { mutate: deleteNoteMutation } = useOfflineDeleteNote();
  const [tempNote, setNote] = useState(note?.body);
  const { setFieldId, images, clearImages, fieldId } = useCameraStore();
  const { mutate: addImageMutation } = useAddImage();
  const { mutate: removeImageMutation } = useRemoveImage();
  const { data: notes } = useGetNotes(room.id);
  const { addToQueue: addImageToUploadQueue } = useOfflineUploadsStore();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const refreshNotes = useCallback(() => {
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }, 1000);
  }, [queryClient, room.id]);

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
      console.log("🚀 ~ setNoteId ~ note.publicId:", note.id);

      if (noteId != note.id) {
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
    if (noteId != note.id) {
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
    console.log("🚀 ~ handleStart ~ id:", id, note.id);

    if (id != note.id) {
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
        await updateNoteMutation(
          note.id,
          { body: debouncedNote },
          projectId!,
          room.id
        );
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

      await updateNoteMutation(noteId, { body }, projectId!, roomId);

      // Only show success toast if not in silent mode
      if (!silent) {
        toast.success("Note updated successfully");
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setIsUpdating(false);
    }
  };

  const deleteNote = async (noteId: string, roomId: string) => {
    try {
      setIsDeleting(true);
      await deleteNoteMutation(noteId, projectId!, roomId);

      toast.success("Note deleted successfully");
    } catch (error) {
      console.error(error);
    }

    setIsDeleting(false);
  };

  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ images:", images);

    if (images.length > 0 && note.id == fieldId) {
      if (isOffline) {
        // Add to offline upload queue when offline
        addImageToUploadQueue({
          projectId: projectId!,
          roomId: room.id,
          imagePath: images[0].url,
          imageUrl: images[0].url,
          metadata: {
            size: 0,
            type: "image/jpeg",
            name: "note-image",
          },
        });
        toast.success("Image added to offline queue");
      } else {
        addImageMutation({
          data: {
            noteId: note.id,
            url: images[0].url,
            projectId: projectId,
          },
        });
      }

      clearImages();
      refreshNotes();
    }
  }, [images, fieldId]);

  /**
   * Handles taking a photo with the camera
   */
  const takePhoto = async (noteId: string, onSuccess?: () => void) => {
    console.log("🚀 ~ takePhoto ~ noteId:", noteId);
    setFieldId(noteId);
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

  const deleteImage = async (imageId: string) => {
    try {
      await removeImageMutation(imageId);
      await refreshNotes();

      // Update modal state
      if (selectedImageIndex !== null) {
        if (notes?.length == 1) {
          // If no images left, close the modal
          handleCloseModal();
        } else if (selectedImageIndex >= notes?.length!) {
          // If current index is beyond available images, go to last image
          setSelectedImageIndex(notes?.length! - 1);
        }
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Delete image error:", error);
      //   toast.error("Failed to delete image");
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
          onPress: () => takePhoto(note.id),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickMultipleImages(note.id),
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
  const pickMultipleImages = async (noteId: string, onSuccess?: () => void) => {
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

        const urls = await Promise.all(uploadPromises);

        console.log("🚀 ~ pickMultipleImages ~ urls:", urls);
        for (const url of urls) {
          addImageMutation({
            data: {
              noteId: noteId,
              url: url,
              projectId: projectId,
            },
          });
        }
        await refreshNotes();

        // Always call refreshNotes to update the UI

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
            <FileText color="#1E40AF" size={20} />
          </View>
          <View>
            <Text style={{ color: "#6B7280", fontSize: 13 }}>
              {format(new Date(note.updatedAt), "d LLLL	hh:mm a")}
            </Text>
          </View>
        </View>

        {/* Action buttons moved to the top */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            disabled={isUpdating || imageUploading}
            onPress={() => handleStart(note.id)}
          >
            {recognizing && note.id == noteId ? (
              <Square color="red" size={20} />
            ) : (
              <Mic color="#1e40af" size={20} />
            )}
          </Pressable>
          <Pressable
            disabled={isUpdating || imageUploading}
            onPress={handleImageOptions}
          >
            {imageUploading ? (
              <ActivityIndicator size="small" color="#1e40af" />
            ) : (
              <Camera color="#1e40af" size={20} />
            )}
          </Pressable>
          <Pressable
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
                    onPress: () => deleteNote(note.id, room.id),
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
          </Pressable>
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
              updateNote(note.id, room.id, tempNote);
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
              color="#2563eb"
              style={{ marginRight: 4 }}
            />
            <Text style={{ fontSize: 12, color: "#2563eb" }}>Saving...</Text>
          </View>
        )}
      </View>

      {note.images && note.images.length > 0 && (
        <View style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden" }}>
          {note.images.length === 1 ? (
            <Pressable onPress={() => handleOpenModal(0)}>
              <OptimizedImage
                uri={note.images[0].url}
                style={{
                  ...styles.singleImage,
                  borderWidth: highlightedImageIndex === 0 ? 3 : 0,
                  borderColor:
                    highlightedImageIndex === 0 ? "#2563eb" : "transparent",
                }}
                size="large"
              />
            </Pressable>
          ) : (
            <>
              <View style={styles.imageGrid}>
                {(expandedImageGrid
                  ? note.images
                  : note.images.slice(0, PREVIEW_IMAGE_COUNT)
                ).map((image, index) => (
                  <Pressable
                    key={`${note.id}-image-${index}`}
                    onPress={() => handleOpenModal(index)}
                    style={{
                      width:
                        note.images?.length === 2
                          ? "50%"
                          : note.images?.length === 3 && index === 0
                            ? "100%"
                            : "50%",
                      padding: 4,
                      transform: [
                        { scale: highlightedImageIndex === index ? 1.05 : 1 },
                      ],
                    }}
                  >
                    <OptimizedImage
                      uri={image.url}
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 8,
                        borderWidth: highlightedImageIndex === index ? 3 : 0,
                        borderColor:
                          highlightedImageIndex === index
                            ? "#2563eb"
                            : "transparent",
                      }}
                      size="medium"
                    />
                  </Pressable>
                ))}
              </View>

              {/* Only show the See More/Less button if we have more than PREVIEW_IMAGE_COUNT images */}
              {note.images.length > PREVIEW_IMAGE_COUNT && (
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
                      : `Show all ${note.images.length} images`}
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
          {/* {note.auditTrail &&
            note.auditTrail.length > 0 &&
            note.auditTrail[0].userName && (
              <Text> by {note.auditTrail[0].userName}</Text>
            )} */}
        </Text>
      )}

      <ImageGalleryModal
        visible={selectedImageIndex !== null}
        onClose={() => setSelectedImageIndex(null)}
        images={note.images || []}
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
  noteId: string,
  onSuccess?: () => void
) => {
  const p = {
    uri: photo.uri,
    name: photo.fileName || `${v4()}.jpeg`,
    type: photo.mimeType || "image/jpeg",
  };

  const formData = new FormData();
  if (p) {
    // @ts-expect-error react-native form data typing issue
    formData.append("file", p);
  }

  try {
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
    console.log("🚀 ~ uploadResult:", uploadResult);

    if (!uploadResult.url) {
      throw new Error("Failed to upload image");
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
