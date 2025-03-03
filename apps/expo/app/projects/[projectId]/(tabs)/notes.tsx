import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { format, formatDistance } from "date-fns";

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
} from "lucide-react-native";
import { toast } from "sonner-native";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ActivityIndicator, ScrollView, Image } from "react-native";
import Empty from "@/components/project/empty";
import { RefreshControl, View, Pressable } from "react-native";
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

const RoomNoteListItem = ({
  room,
  addNote,
}: {
  room: RoomWithNotes;
  addNote: (roomId: string) => Promise<void>;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const onAdd = async () => {
    setIsAdding(true);
    await addNote(room.publicId);
    setIsAdding(false);
  };

  return (
    <>
      <View className="w-full justify-between items-start flex-row my-4">
        <Text className="font-bold text-2xl">{room.name}</Text>
        <Button size="sm" onPress={onAdd}>
          {isAdding ? <ActivityIndicator /> : <Plus color="white" />}
        </Button>
      </View>
      <View className="w-full mb-3">
        {room?.Notes.length === 0 && (
          <View className="w-full flex items-center justify-center">
            <Text className="text-gray-500 font-bold text-lg">
              There are no notes yet
            </Text>
          </View>
        )}
        {room?.Notes.map((note) => (
          <NoteCard key={note.publicId} note={note} room={room} />
        ))}
      </View>
    </>
  );
};

function EditNoteModal({ note, room, onSave }: { note: NoteWithAudits; room: RoomWithNotes; onSave: (text: string) => void }) {
  const [text, setText] = useState(note.body);
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button 
          variant="ghost" 
          className="p-2"
          onPress={() => setOpen(true)}
        >
          <Edit2 color="#1e40af" size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Text className="text-lg font-semibold">Edit Note</Text>
          </DialogTitle>
        </DialogHeader>
        <View className="mt-4">
          <Textarea
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind?"
            className="min-h-[150px]"
          />
          <View className="flex-row justify-end mt-4 gap-2">
            <Button 
              variant="outline"
              onPress={() => setOpen(false)}
            >
              <Text className="text-foreground">Cancel</Text>
            </Button>
            <Button
              onPress={() => {
                onSave(text);
                setOpen(false);
              }}
            >
              <Text className="text-white">Save</Text>
            </Button>
          </View>
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const notes = notesStore();
  const { session } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    if (noteId != note.publicId) {
      return;
    }
    setRecognizing(false);
    console.log(transcript);
    if (!tempNote.includes(transcript)) {
      setNote(`${tempNote}${transcript}`);
    }
    setTimeout(() => setTranscript(""), 1000);
    setNoteId("");
  });
  useSpeechRecognitionEvent("result", (event) => {
    if (noteId != note.publicId) {
      return;
    }
    setTranscript(event.results[0]?.transcript);
    // console.log(transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async (id: string) => {
    if (id != note.publicId) {
      return;
    }

    if (recognizing) {
      setRecognizing(false);
      setNoteId("");
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

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tempNote, setNote] = useState(note.body);

  const debouncedNote = useDebounce(tempNote, 1000);

  useEffect(() => {
    if (debouncedNote != note.body && !recognizing) {
      updateNote(note.publicId, room.publicId, debouncedNote);
    }
  }, [debouncedNote]);

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

  const updateNote = async (noteId: string, roomId: string, body: string) => {
    try {
      setIsUpdating(true);
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
      }

      notes.updateNote({
        ...json.note,
        NoteImage: note.NoteImage
      }, roomId);
      toast.success("Note updated successfully");
    } catch {
      toast.error(
        "Could not update note. If this error persits, please contact support@restoregeek.app"
      );
    }

    setIsUpdating(false);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.[0]) {
      const photo = result.assets[0];

      const p = {
        uri: photo.uri,
        name: photo.fileName || `${v4()}.jpeg`,
      };
      const formData = new FormData();
      // @ts-expect-error maaaaan react-native sucks
      formData.append("file", p);

      try {
        const res = await supabaseServiceRole.storage
          .from("note-images")
          .upload(`/${note.publicId}/${v4()}.jpeg`, formData, {
            cacheControl: "3600",
            upsert: false,
          });

        const noteImage = await supabaseServiceRole.from("NoteImage").insert({
          noteId: note.id,
          imageKey: res.data?.path,
        });

        // Fetch fresh data after upload
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
        
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
      }
    }
  };

  const handlePrevImage = () => {
    if (note.NoteImage && selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? note.NoteImage.length - 1 : selectedImageIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (note.NoteImage && selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === note.NoteImage.length - 1 ? 0 : selectedImageIndex + 1
      );
    }
  };

  const deleteImage = async (imageKey: string) => {
    try {
      // Delete from storage
      await supabaseServiceRole.storage
        .from("note-images")
        .remove([imageKey]);

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

  return (
    <Card className="p-4 rounded-lg mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
            <Text className="text-blue-600 font-bold text-lg">
              {note.NotesAuditTrail?.[0]?.userName?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text className="font-semibold">
              {note.NotesAuditTrail?.[0]?.userName || "User"}
            </Text>
            <Text className="text-gray-500 text-sm">
              {format(new Date(note.date), "PPp")}
            </Text>
          </View>
        </View>
      </View>

      {isEditing ? (
        <Textarea
          value={tempNote}
          onChangeText={setNote}
          placeholder="What's on your mind?"
          className="min-h-[100px] mb-4"
          autoFocus
          multiline
        />
      ) : (
        <>
          <Text className="text-base mb-4">{tempNote}</Text>
          {note.NoteImage && note.NoteImage.length > 0 && (
            <View className="mb-4 rounded-lg overflow-hidden">
              {note.NoteImage.length === 1 ? (
                <Pressable onPress={() => setSelectedImageIndex(0)}>
                  <Image
                    source={{ uri: `https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images/${note.NoteImage[0].imageKey}` }}
                    className="w-full h-[200px]"
                    resizeMode="cover"
                  />
                </Pressable>
              ) : (
                <View className="flex-row flex-wrap">
                  {note.NoteImage.map((image, index) => (
                    <Pressable 
                      key={`${note.publicId}-image-${index}`}
                      onPress={() => setSelectedImageIndex(index)}
                      className={`${
                        note.NoteImage?.length === 2 ? 'w-1/2' : 
                        note.NoteImage?.length === 3 ? (index === 0 ? 'w-full' : 'w-1/2') :
                        'w-1/2'
                      } p-1`}
                    >
                      <Image
                        source={{ uri: `https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images/${image.imageKey}` }}
                        className="w-full h-[150px]"
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </>
      )}

      <View className="flex-row justify-end gap-2 mb-3">
        <Button
          variant="ghost"
          className="p-2"
          disabled={isUpdating}
          onPress={() => {
            if (isEditing) {
              updateNote(note.publicId, room.publicId, tempNote);
            }
            setIsEditing(!isEditing);
          }}
        >
          <Edit2 color={isEditing ? "#22c55e" : "#1e40af"} size={20} />
        </Button>
        <Button
          variant="ghost"
          className="p-2"
          disabled={isUpdating || isEditing}
          onPress={() => handleStart(note.publicId)}
        >
          {recognizing && note.publicId == noteId ? (
            <Square color="red" size={20} />
          ) : (
            <Mic color="#1e40af" size={20} />
          )}
        </Button>
        <Button
          variant="ghost"
          className="p-2"
          disabled={isUpdating || isEditing}
          onPress={pickImage}
        >
          <Camera color="#1e40af" size={20} />
        </Button>
        <Button
          variant="ghost"
          className="p-2"
          disabled={isDeleting || isUpdating || isEditing}
          onPress={() => deleteNote(note.publicId, room.publicId)}
        >
          {isDeleting ? (
            <ActivityIndicator />
          ) : (
            <Trash color="red" size={20} />
          )}
        </Button>
      </View>

      {note.updatedAt && (
        <Text className="text-gray-500 text-sm mt-2">
          <Text>Updated </Text>
          <Text>
            {formatDistance(new Date(note.updatedAt), Date.now(), {
              addSuffix: true,
            })}
          </Text>
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
            <View className="flex-1 relative">
              <Image
                source={{ uri: `https://zmvdimcemmhesgabixlf.supabase.co/storage/v1/object/public/note-images/${note.NoteImage[selectedImageIndex].imageKey}` }}
                style={{ width: '100%', height: '100%' }}                resizeMode="contain"
              />
              <View className="absolute top-12 right-4 flex-row gap-2 z-20">
                <Pressable 
                  onPress={() => {
                    if (note.NoteImage?.[selectedImageIndex]) {
                      deleteImage(note.NoteImage[selectedImageIndex].imageKey);
                    }
                  }}
                  className="bg-black/50 rounded-full p-2"
                >
                  <Trash color="white" size={24} />
                </Pressable>
                <Pressable 
                  onPress={() => setSelectedImageIndex(null)}
                  className="bg-black/50 rounded-full p-2"
                >
                  <X color="white" size={24} />
                </Pressable>
              </View>
              {note.NoteImage.length > 1 && (
                <View className="absolute inset-y-0 flex-row justify-between items-center px-4 w-full z-10">
                  <Pressable
                    onPress={handlePrevImage}
                    className="bg-black/50 rounded-full p-2"
                  >
                    <ChevronLeft color="white" size={24} />
                  </Pressable>
                  <Pressable
                    onPress={handleNextImage}
                    className="bg-black/50 rounded-full p-2"
                  >
                    <ChevronRight color="white" size={24} />
                  </Pressable>
                </View>
              )}
              <View className="absolute bottom-4 w-full flex-row justify-center z-10">
                <Text className="text-white text-sm">
                  {selectedImageIndex + 1} / {note.NoteImage.length}
                </Text>
              </View>
            </View>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function RoomNotes() {
  const { session } = userStore((state) => state);
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const [loading, setLoading] = useState(false);
  const notes = notesStore();

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
      className="w-full h-full px-3 mt-5"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchNotes} />
      }
    >
      {notes.notes?.map((room) => (
        <RoomNoteListItem key={room.publicId} room={room} addNote={addNote} />
      ))}
    </ScrollView>
  );
}
