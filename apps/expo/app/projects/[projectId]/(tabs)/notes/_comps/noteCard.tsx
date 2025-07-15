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
  Type,
  ImagePlus,
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
import { TextInput } from "react-native";

// Type assertions to fix ReactNode compatibility
const FileTextComponent = FileText as any;
const SquareComponent = Square as any;
const MicComponent = Mic as any;
const CameraComponent = Camera as any;
const TrashComponent = Trash as any;
const ChevronUpComponent = ChevronUp as any;
const ChevronDownComponent = ChevronDown as any;
const MoreVerticalComponent = MoreVertical as any;
const TypeComponent = Type as any;
const ImagePlusComponent = ImagePlus as any;
const XComponent = X as any;

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
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  noteDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  editHint: {
    alignSelf: "flex-end",
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  editHintText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "500",
  },
  editDialogContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: "80%",
  },
  editDialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editDialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  textareaField: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  imageCountBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  imageCountText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  noteDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  editHint: {
    alignSelf: "flex-end",
    backgroundColor: "#e0e7ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  editHintText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "500",
  },
  editDialogContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: "80%",
  },
  editDialogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editDialogTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },
  textareaField: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    minHeight: 120,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  editImageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "space-between",
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
  const [tempTitle, setTempTitle] = useState(note?.title || "");
  const { setFieldId, images, clearImages, fieldId } = useCameraStore();
  const { mutate: addImageMutation } = useAddImage();
  const { mutate: removeImageMutation } = useRemoveImage();
  const { data: notes } = useGetNotes(room.id);
  const { addToQueue: addImageToUploadQueue } = useOfflineUploadsStore();
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();
  
  // State for edit dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(note?.title || "");
  const [editBody, setEditBody] = useState(note?.body || "");
  
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
    setTempTitle(note?.title || "");
  }, [note.body, note?.title]);

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
    title?: string,
    silent = false
  ) => {
    try {
      if (!silent) setIsUpdating(true);

      const updateData: any = { body };
      if (title !== undefined) {
        updateData.title = title;
      }

      await updateNoteMutation(noteId, updateData, projectId!, roomId);

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

      if (!result.canceled && result.assets && result.assets.length > 0) {
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

  // Handle edit dialog
  const handleEditNote = () => {
    setEditTitle(note?.title || "");
    setEditBody(note?.body || "");
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsUpdating(true);
      await updateNote(note.id, room.id, editBody, editTitle);
      setShowEditDialog(false);
      setTempTitle(editTitle);
      setNote(editBody);
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditTitle(note?.title || "");
    setEditBody(note?.body || "");
  };

  return (
    <Card style={styles.noteCard} ref={noteRef}>
      <Pressable onPress={handleEditNote}>
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
              <FileTextComponent color="#1E40AF" size={20} />
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
              onPress={(e) => {
                e.stopPropagation();
                handleStart(note.id);
              }}
            >
              {recognizing && note.id == noteId ? (
                <SquareComponent color="red" size={20} />
              ) : (
                <MicComponent color="#1e40af" size={20} />
              )}
            </Pressable>
            <Pressable
              disabled={isUpdating || imageUploading}
              onPress={(e) => {
                e.stopPropagation();
                handleImageOptions();
              }}
            >
              {imageUploading ? (
                <ActivityIndicator size="small" color="#1e40af" />
              ) : (
                <View style={{ position: "relative" }}>
                  <CameraComponent color="#1e40af" size={20} />
                  {note.images && note.images.length > 0 && (
                    <View style={styles.imageCountBadge}>
                      <Text style={styles.imageCountText}>
                        {note.images.length}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
            
            {/* 3-dots menu */}
            <Pressable
              disabled={isUpdating || imageUploading}
              onPress={(e) => {
                e.stopPropagation();
                Alert.alert(
                  "Note Options",
                  "Choose an action",
                  [
                    {
                      text: "Edit Note",
                      onPress: handleEditNote,
                    },
                    {
                      text: "Add Images",
                      onPress: handleImageOptions,
                    },
                    {
                      text: "Delete Note",
                      style: "destructive",
                      onPress: () => {
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
                      },
                    },
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <MoreVerticalComponent color="#1e40af" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Note Title and Description */}
        {(tempTitle || tempNote) && (
          <View style={{ marginBottom: 16 }}>
            {tempTitle && (
              <Text style={styles.noteTitle}>{tempTitle}</Text>
            )}
            {tempNote && (
              <Text style={styles.noteDescription} numberOfLines={3}>
                {tempNote}
              </Text>
            )}
            <View style={styles.editHint}>
              <Text style={styles.editHintText}>Tap to edit</Text>
            </View>
          </View>
        )}
      </Pressable>

      {note.images && note.images.length > 0 && (
        <View style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden" }}>
          {note.images.length === 1 ? (
            <Pressable onPress={(e) => {
              e.stopPropagation();
              handleOpenModal(0);
            }}>
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
                    onPress={(e) => {
                      e.stopPropagation();
                      handleOpenModal(index);
                    }}
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
                  onPress={(e) => {
                    e.stopPropagation();
                    setExpandedImageGrid(!expandedImageGrid);
                  }}
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
                    <ChevronUpComponent size={18} color="#1E40AF" />
                  ) : (
                    <ChevronDownComponent size={18} color="#1E40AF" />
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

      {/* Edit Note Dialog */}
      <Modal
        visible={showEditDialog}
        transparent
        animationType="slide"
        onRequestClose={handleCancelEdit}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center" }}>
          <View style={styles.editDialogContent}>
            <View style={styles.editDialogHeader}>
              <Text style={styles.editDialogTitle}>Edit Note</Text>
              <Pressable onPress={handleCancelEdit}>
                <XComponent size={20} color="#64748b" />
              </Pressable>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#374151" }}>
                Title
              </Text>
              <TextInput
                style={styles.inputField}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter note title..."
                placeholderTextColor="#9ca3af"
              />
              
              <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#374151" }}>
                Content
              </Text>
              <TextInput
                style={styles.textareaField}
                value={editBody}
                onChangeText={setEditBody}
                placeholder="What's on your mind?"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />
              
              {/* Images Section */}
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "500", color: "#374151" }}>
                    Images ({note.images?.length || 0})
                  </Text>
                  <Pressable 
                    onPress={() => {
                      setShowEditDialog(false);
                      handleImageOptions()
                      // setTimeout(() => handleImageOptions(), 300);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#e0e7ff",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                    }}
                  >
                    <ImagePlusComponent size={16} color="#3b82f6" />
                    <Text style={{ marginLeft: 4, color: "#3b82f6", fontSize: 14, fontWeight: "500" }}>
                      Add Images
                    </Text>
                  </Pressable>
                </View>
                
                {note.images && note.images.length > 0 && (
                  <View style={styles.editImageGrid}>
                    {note.images.map((image, index) => (
                      <View key={`edit-${note.id}-image-${index}`} style={{ position: "relative", width: "30%", marginBottom: 8 }}>
                        <Pressable
                          onPress={() => {
                            // setShowEditDialog(false);
                            handleOpenModal(index)
                            // setTimeout(() => handleOpenModal(index), 300);
                          }}
                        >
                          <OptimizedImage
                            uri={image.url}
                            style={{
                              width: "100%",
                              height: 100,
                              borderRadius: 8,
                            }}
                            size="medium"
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
                
                {(!note.images || note.images.length === 0) && (
                  <View style={{
                    borderWidth: 2,
                    borderColor: "#e5e7eb",
                    borderStyle: "dashed",
                    borderRadius: 8,
                    padding: 20,
                    alignItems: "center",
                    backgroundColor: "#f9fafb",
                  }}>
                    <ImagePlusComponent size={32} color="#9ca3af" />
                    <Text style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
                      No images yet. Tap "Add Images" to get started.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.buttonContainer}>
              <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.saveButton, isUpdating && { opacity: 0.6 }]} 
                onPress={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  try {
    // Upload to ImageKit
    const uploadResult = await uploadImage(
      {
        uri: photo.uri,
        type: "image" as any,
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
