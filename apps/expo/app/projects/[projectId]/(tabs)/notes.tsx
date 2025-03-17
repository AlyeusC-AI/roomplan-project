import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { format, formatDistance } from "date-fns";
import { Alert } from "react-native";

import { userStore } from "@/lib/state/user";
import { router, useGlobalSearchParams } from "expo-router";
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
import {
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
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

const { width: screenWidth } = Dimensions.get("window");

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
});

const SUPABASE_IMAGE_URL =
  "https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images";

// Function to optimize image URLs with different sizes
const getOptimizedImageUrl = (
  imageKey: string,
  size: "small" | "medium" | "large" = "medium"
): string => {
  const baseUrl = `${SUPABASE_IMAGE_URL}/${imageKey}`;

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
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{room.name}</Text>
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

  /**
   * Handles taking a photo with the camera
   */
  const takePhoto = async (noteId: number, onSuccess?: () => void) => {
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

  const handlePrevImage = () => {
    if (note.NoteImage && selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? note.NoteImage.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (note.NoteImage && selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === note.NoteImage.length - 1
          ? 0
          : selectedImageIndex + 1
      );
    }
  };

  const deleteImage = async (imageKey: string) => {
    try {
      // Delete from storage
      await supabaseServiceRole.storage.from("note-images").remove([imageKey]);

      // Delete from database
      await supabaseServiceRole
        .from("NoteImage")
        .delete()
        .eq("imageKey", imageKey);

      // Fetch fresh data after deletion
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

      // Update modal state
      if (selectedImageIndex !== null) {
        const updatedNote = data.notes
          .flatMap((room: RoomWithNotes) => room.Notes)
          .find((n: NoteWithAudits) => n.publicId === note.publicId);

        if (!updatedNote?.NoteImage?.length) {
          setSelectedImageIndex(null);
        } else if (selectedImageIndex >= updatedNote.NoteImage.length) {
          setSelectedImageIndex(updatedNote.NoteImage.length - 1);
        }
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error(error);
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
              {format(new Date(note.date), "PPp")}
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
            <Pressable onPress={() => setSelectedImageIndex(0)}>
              <OptimizedImage
                uri={`${SUPABASE_IMAGE_URL}/${note.NoteImage[0].imageKey}`}
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
                {/* Only show up to PREVIEW_IMAGE_COUNT images when not expanded */}
                {(expandedImageGrid
                  ? note.NoteImage
                  : note.NoteImage.slice(0, PREVIEW_IMAGE_COUNT)
                ).map((image, index) => (
                  <Pressable
                    key={`${note.publicId}-image-${index}`}
                    onPress={() => setSelectedImageIndex(index)}
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
                      uri={`${SUPABASE_IMAGE_URL}/${image.imageKey}`}
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

      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImageIndex(null);
          }
        }}
      >
        <DialogContent className="p-0 bg-black w-screen h-screen">
          {note.NoteImage && selectedImageIndex !== null && (
            <View style={{ flex: 1, position: "relative" }}>
              <OptimizedImage
                uri={`${SUPABASE_IMAGE_URL}/${note.NoteImage[selectedImageIndex].imageKey}`}
                backgroundColor={"black"}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
                size="large"
              />

              {/* Close button with improved hitbox */}
              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedImageIndex(null)}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 20,
                    padding: 8,
                  }}
                >
                  <X color="white" size={24} />
                </View>
              </Pressable>

              {/* Image navigation controls */}
              {note.NoteImage.length > 1 && (
                <View style={styles.modalControls}>
                  <Pressable
                    onPress={handlePrevImage}
                    style={{
                      padding: 10,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 20,
                    }}
                  >
                    <ChevronLeft color="white" size={24} />
                  </Pressable>

                  <Text style={{ color: "white", fontSize: 16 }}>
                    {selectedImageIndex + 1} / {note.NoteImage.length}
                  </Text>

                  <Pressable
                    onPress={handleNextImage}
                    style={{
                      padding: 10,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      borderRadius: 20,
                    }}
                  >
                    <ChevronRight color="white" size={24} />
                  </Pressable>
                </View>
              )}

              {/* Delete button */}
              <Pressable
                style={{
                  position: "absolute",
                  top: 40,
                  left: 16,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 20,
                  padding: 8,
                }}
                onPress={() => {
                  if (note.NoteImage && selectedImageIndex !== null) {
                    deleteImage(note.NoteImage[selectedImageIndex].imageKey);
                  }
                }}
              >
                <Trash color="white" size={24} />
              </Pressable>
            </View>
          )}
        </DialogContent>
      </Dialog>
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
    const res = await supabaseServiceRole.storage
      .from("note-images")
      .upload(`/${noteId}/${v4()}.jpeg`, formData, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!res.data?.path) {
      throw new Error("Failed to upload image");
    }

    // Add to NoteImage table
    const { data, error } = await supabaseServiceRole.from("NoteImage").insert({
      noteId,
      imageKey: res.data.path,
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

    return res.data.path;
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
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
    </ScrollView>
  );
}
