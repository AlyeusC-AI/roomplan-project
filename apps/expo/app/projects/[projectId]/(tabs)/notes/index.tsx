import { Button } from "@/components/ui/button";
import React from "react";
import {
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Building, Plus } from "lucide-react-native";
import { toast } from "sonner-native";
import { Card } from "@/components/ui/card";
import { ActivityIndicator, ScrollView } from "react-native";
import Empty from "@/components/project/empty";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import AddRoomButton from "@/components/project/AddRoomButton";
import { router, useGlobalSearchParams } from "expo-router";
import { useGetNotes, useGetRooms, Room } from "@service-geek/api-client";
import NoteCard from "./_comps/noteCard";
import { useOfflineCreateNote } from "@/lib/hooks/useOfflineNotes";
import { useOfflineNotesStore } from "@/lib/state/offline-notes";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import OfflineNoteCard from "@/components/project/OfflineNoteCard";

// Type assertions to fix ReactNode compatibility
const BuildingComponent = Building as any;
const PlusComponent = Plus as any;

const RoomNoteListItem = ({ room }: { room: Room }) => {
  const { mutate: createNote } = useOfflineCreateNote();
  const { data: notes } = useGetNotes(room.id);
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const { getNotesByRoom } = useOfflineNotesStore();
  const { isOffline } = useNetworkStatus();

  // Get offline notes for this room
  const offlineNotes = getNotesByRoom(room.id);

  const onAdd = async () => {
    await createNote({
      body: "",
      roomId: room.id,
      projectId: projectId!,
    });
    toast.success("Note added successfully");
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
            <BuildingComponent size={20} color="#0369A1" />
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "../rooms/create",
                params: { roomName: room.name, roomId: room.id },
              });
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{room.name}</Text>
          </TouchableOpacity>
        </View>
        <Button variant="ghost" onPress={onAdd} className="p-2">
          <PlusComponent color="#1e40af" size={20} />
        </Button>
      </View>

      {/* Show offline notes first */}
      {offlineNotes.map((offlineNote) => (
        <OfflineNoteCard
          key={offlineNote.id}
          note={offlineNote}
          roomId={room.id}
          projectId={projectId!}
        />
      ))}

      {/* Show online notes */}
      {notes?.map((note) => <NoteCard key={note.id} note={note} room={room} />)}

      {notes?.length === 0 && offlineNotes.length === 0 && (
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
              <PlusComponent size={16} color="#1e40af" />
              <Text style={{ color: "#1e40af" }}>Add Note</Text>
            </View>
          </Button>
        </Card>
      )}
    </View>
  );
};

export default function Notes() {
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const { data: rooms, isLoading: roomsLoading } = useGetRooms(projectId);
  const { isOffline } = useNetworkStatus();

  if (roomsLoading) {
    return (
      <View className="w-full h-full flex items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (rooms?.length === 0) {
    return (
      <Empty
        title="No Rooms"
        description="Create a room to add notes to it."
        buttonText="Create a room"
        icon={<BuildingComponent height={50} width={50} />}
        secondaryIcon={
          <PlusComponent height={20} width={20} color="#fff" className="ml-4" />
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
        contentContainerStyle={{
          padding: 16,
          paddingTop: 32,
          backgroundColor: "#F8FAFC",
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {roomsLoading ? (
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
          ) : rooms?.length === 0 ? (
            <Empty
              icon={<BuildingComponent size={36} color="#1e40af" />}
              secondaryIcon={<BuildingComponent size={36} color="#1e40af" />}
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
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
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
                  {isOffline && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#fef2f2",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        gap: 4,
                      }}
                    >
                      <PlusComponent size={16} color="#ef4444" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#ef4444",
                          fontWeight: "500",
                        }}
                      >
                        Offline
                      </Text>
                    </View>
                  )}
                </View>
                <AddRoomButton showText={false} size="sm" />
              </View>

              <View style={{ gap: 12 }}>
                {rooms?.map((room) => (
                  <RoomNoteListItem key={room.id} room={room} />
                ))}
              </View>
            </>
          )}
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
