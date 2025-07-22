import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useGetNotes, Note } from "@service-geek/api-client";
import NoteCard from "../../(tabs)/notes/_comps/noteCard";
import { useOfflineCreateNote } from "@/lib/hooks/useOfflineNotes";
import { useOfflineNotesStore } from "@/lib/state/offline-notes";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Plus, WifiOff } from "lucide-react-native";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { toast } from "sonner-native";
import OfflineNoteCard from "@/components/project/OfflineNoteCard";

// Type assertions to fix ReactNode compatibility
const PlusComponent = Plus as any;
const WifiOffComponent = WifiOff as any;

export default function NotesTab({
  projectId,
  roomId,
  room,
}: {
  projectId: string;
  roomId: string;
  room: any;
}) {
  const { data: notes } = useGetNotes(roomId);
  const { mutate: createNote } = useOfflineCreateNote();
  const { isOffline } = useNetworkStatus();
  const [isCreatingNote, setIsCreatingNote] = React.useState(false);
  const { getNotesByRoom } = useOfflineNotesStore();

  // Get offline notes for this room
  const offlineNotes = getNotesByRoom(roomId);

  const addNote = async () => {
    try {
      setIsCreatingNote(true);
      await createNote({
        body: "",
        roomId: roomId,
        projectId: projectId,
      });
      toast.success("Note added successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create note");
    } finally {
      setIsCreatingNote(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 200 : 0}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        {/* Header with Add Note button */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Room Notes</Text>
            {isOffline && (
              <View style={styles.offlineIndicator}>
                <WifiOffComponent size={16} color="#ef4444" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
          <Button
            onPress={addNote}
            size="sm"
            variant="outline"
            disabled={isCreatingNote}
          >
            {isCreatingNote ? (
              <ActivityIndicator />
            ) : (
              <View style={styles.buttonContent}>
                <PlusComponent color="#1e40af" height={18} width={18} />
                <Text style={styles.buttonText}>Add Note</Text>
              </View>
            )}
          </Button>
        </View>

        {/* Notes list */}
        {!notes?.length && offlineNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes for this room yet.</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {/* Show offline notes first */}
            {offlineNotes.map((offlineNote) => (
              <View key={offlineNote.id} style={styles.card}>
                <OfflineNoteCard
                  note={offlineNote}
                  roomId={roomId}
                  projectId={projectId}
                />
              </View>
            ))}

            {/* Show online notes */}
            {notes?.map((note: Note) => (
              <View key={note.id} style={styles.card}>
                <NoteCard note={note} room={room} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  offlineIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    marginLeft: 4,
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "500",
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    // padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    fontStyle: "italic",
  },
});
