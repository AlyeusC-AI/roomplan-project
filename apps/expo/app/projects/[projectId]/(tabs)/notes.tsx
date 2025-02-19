import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { format, formatDistance } from "date-fns";

import { userStore } from "@/lib/state/user";
import { router, useGlobalSearchParams } from "expo-router";
import {
  Building,
  Camera,
  Mic,
  Plus,
  Square,
  Trash,
} from "lucide-react-native";
import { toast } from "sonner-native";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ActivityIndicator, ScrollView } from "react-native";
import Empty from "@/components/project/empty";
import { RefreshControl, View } from "react-native";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";

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
        <Text className=" font-bold text-2xl"> {room.name}</Text>
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

      notes.updateNote(json.note, roomId);
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

    console.log(result);

    const photo = result.assets[0];

    const p = {
      uri: photo.uri,
      name: photo.fileName,
    };
    const formData = new FormData();
    // @ts-expect-error maaaaan react-native sucks
    formData.append("file", p);

    try {
      await supabaseServiceRole.storage
        .from("note-images")
        .upload(`/${note.publicId}/${v4()}.jpeg`, formData, {
          cacheControl: "3600",
          upsert: false,
        });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card key={note?.publicId} className="p-4 rounded-md mb-2">
      {note?.date && (
        <View className="flex-row justify-between items-center mb-2">
          <Text>{format(new Date(note.date), "PPp")}</Text>
          <View className="flex-row gap-3">
            <Button variant="outline" disabled={isUpdating} onPress={pickImage}>
              <Camera color={"#1e40af"} height={24} width={24} />
            </Button>
            <Button
              variant="outline"
              disabled={isUpdating}
              onPress={() => handleStart(note.publicId)}
            >
              {recognizing && note.publicId == noteId ? (
                <Square color="red" height={24} width={24} />
              ) : (
                <Mic color={"#1e40af"} height={24} width={24} />
              )}
            </Button>
            <Button
              disabled={isDeleting || isUpdating}
              variant="outline"
              onPress={() => deleteNote(note.publicId, room.publicId)}
            >
              {isDeleting ? (
                <ActivityIndicator />
              ) : (
                <Trash color="red" height={24} width={24} />
              )}
            </Button>
          </View>
        </View>
      )}
      <Textarea
        value={`${tempNote}${tempNote.includes(transcript) ? "" : transcript}`}
        onChangeText={(text) => {
          if (!recognizing && transcript.length === 0) {
            setNote(text);
          }
        }}
        placeholder="Note here..."
        autoComplete="off"
      />
      {note.updatedAt && (
        <Text>
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

  if (notes.notes.length === 0) {
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
      {notes.notes.map((room) => (
        <RoomNoteListItem key={room.publicId} room={room} addNote={addNote} />
      ))}
    </ScrollView>
  );
}
