import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { X, ChevronRight, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  useGetProjectById,
  useGetRooms,
  useGetRoom,
  useUpdateProject,
  useUpdateRoom,
} from "@service-geek/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextInput, Image } from "react-native";
import { AlertTriangle } from "lucide-react-native";

// Type assertions for Lucide icons
const XIcon = X as any;
const ChevronRightIcon = ChevronRight as any;
const ChevronDownIcon = ChevronDown as any;
const ChevronUpIcon = ChevronUp as any;
const AlertTriangleIcon = AlertTriangle as any;

const WATER_PROJECT_TASKS = [
  "Take Cover Photo",
  "Enter Job & Insurance Info",
  "Sign Work Auth",
  "Document source of loss",
  "Make lidar sketch",
  "Make Chambers (select/add rooms)",
];

const WATER_ROOM_TASKS = [
  "Take 4 photos",
  "Enter Atmospheric Reading",
  "Make 3 moisture points",
  "Calculate equipment",
  "Make moisture map",
  "Add note (optional)",
  "Move to next room",
];

// Mock data for tags and notes
const MOCK_TAGS = ["Water", "Demolition", "+5"];
const MOCK_NOTES = [
  { id: 1, text: "Checked for visible water damage." },
  { id: 2, text: "Removed baseboards in affected area." },
];

// Mock image for moisture map
const MOCK_MAP = require("@/assets/icon.png");

type TaskRowProps = {
  label: string;
  done: boolean;
  onPress: () => void;
};

const TaskRow: React.FC<TaskRowProps> = ({ label, done, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}
  >
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: done ? "#22c55e" : "#d1d5db",
        backgroundColor: done ? "#22c55e" : "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
      }}
    >
      {done && <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>}
    </View>
    <Text style={{ fontSize: 16, color: done ? "#22c55e" : "#222", flex: 1 }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function CopilotScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { data: project } = useGetProjectById(projectId);
  const { data: rooms } = useGetRooms(projectId);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  // Memo: current room object
  const currentRoom = useMemo(
    () => rooms?.find((r) => r.id === selectedRoomId) || rooms?.[0] || null,
    [rooms, selectedRoomId]
  );

  // Get current room data with copilot progress
  const { data: roomData } = useGetRoom(currentRoom?.id || "");

  // If no room selected, default to first
  useEffect(() => {
    if (!selectedRoomId && rooms && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Update hooks for project and room
  const updateProject = useUpdateProject();
  const updateRoom = useUpdateRoom();

  // Checklist state
  const [projectTasks, setProjectTasks] = useState(
    WATER_PROJECT_TASKS.map((label) => ({ label, done: false }))
  );
  const [roomTasks, setRoomTasks] = useState(
    WATER_ROOM_TASKS.map((label) => ({ label, done: false }))
  );

  // Sync checklist state with backend data
  useEffect(() => {
    if (roomData?.copilotProgress) {
      setRoomTasks(roomData.copilotProgress);
    } else {
      setRoomTasks(WATER_ROOM_TASKS.map((label) => ({ label, done: false })));
    }
  }, [roomData]);

  useEffect(() => {
    // Handle different possible project data structures
    const projectData = project?.data;
    if (projectData && projectData.copilotProgress) {
      setProjectTasks(projectData.copilotProgress);
    } else {
      setProjectTasks(
        WATER_PROJECT_TASKS.map((label) => ({ label, done: false }))
      );
    }
  }, [project]);

  const [checklistOpen, setChecklistOpen] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState(MOCK_NOTES);

  // Handlers
  const handleTaskToggle = useCallback(
    async (idx: number, isRoom: boolean) => {
      if (isRoom) {
        const updated = roomTasks.map((t, i) =>
          i === idx ? { ...t, done: !t.done } : t
        );
        setRoomTasks(updated);
        if (currentRoom) {
          await updateRoom.mutateAsync({
            id: currentRoom.id,
            data: { copilotProgress: updated },
          });
        }
      } else {
        const updated = projectTasks.map((t, i) =>
          i === idx ? { ...t, done: !t.done } : t
        );
        setProjectTasks(updated);
        await updateProject.mutateAsync({
          id: projectId,
          data: { copilotProgress: updated },
        });
      }
    },
    [roomTasks, projectTasks, currentRoom, projectId, updateRoom, updateProject]
  );

  const handleNextRoom = () => {
    if (!rooms || !currentRoom) return;
    const idx = rooms.findIndex((r) => r.id === currentRoom.id);
    if (idx < rooms.length - 1) {
      setSelectedRoomId(rooms[idx + 1].id);
      setRoomTasks(WATER_ROOM_TASKS.map((label) => ({ label, done: false })));
    }
  };

  // UI
  const loading = currentRoom ? !roomData : !project;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: "#f3f4f6",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <XIcon size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setRoomDropdownOpen((v) => !v)}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            {currentRoom ? currentRoom.name : "Project Tasks"}
          </Text>
          {rooms &&
            rooms.length > 1 &&
            (roomDropdownOpen ? (
              <ChevronUpIcon size={20} style={{ marginLeft: 4 }} />
            ) : (
              <ChevronDownIcon size={20} style={{ marginLeft: 4 }} />
            ))}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextRoom}
          disabled={!rooms || !currentRoom || rooms.length < 2}
        >
          <ChevronRightIcon
            size={28}
            color={rooms && currentRoom && rooms.length > 1 ? "#222" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
      {/* Room dropdown modal (unchanged) */}
      {/* Copilot Tasks Card */}
      <Card style={{ margin: 16 }}>
        <CardHeader
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 0,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <CardTitle>Copilot Tasks</CardTitle>
            <Badge
              variant="outline"
              style={{
                marginLeft: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <AlertTriangleIcon
                size={14}
                color="#f59e42"
                style={{ marginRight: 4 }}
              />
              {`${(currentRoom ? roomTasks : projectTasks).filter((t) => t.done).length}/${(currentRoom ? roomTasks : projectTasks).length}`}
            </Badge>
          </View>
          <TouchableOpacity onPress={() => setChecklistOpen((v) => !v)}>
            {checklistOpen ? (
              <ChevronUpIcon size={20} />
            ) : (
              <ChevronDownIcon size={20} />
            )}
          </TouchableOpacity>
        </CardHeader>
        {checklistOpen && (
          <CardContent>
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              {`${(currentRoom ? roomTasks : projectTasks).filter((t) => t.done).length}/${(currentRoom ? roomTasks : projectTasks).length} tasks completed`}
            </Text>
            {(currentRoom ? roomTasks : projectTasks).map((task, idx) => (
              <TaskRow
                key={task.label}
                label={task.label}
                done={task.done}
                onPress={() => handleTaskToggle(idx, !!currentRoom)}
              />
            ))}
          </CardContent>
        )}
      </Card>
      {/* Work Notes Section */}
      <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <CardHeader>
          <CardTitle>Work Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}
          >
            {MOCK_TAGS.map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                {tag}
              </Badge>
            ))}
          </View>
          <View style={{ marginBottom: 8 }}>
            {notes.map((note) => (
              <Text key={note.id} style={{ marginBottom: 4 }}>
                {note.text}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Add a note"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 8,
                padding: 8,
                marginRight: 8,
              }}
            />
            <Button
              onPress={() => {
                if (noteInput.trim()) {
                  setNotes((prev) => [
                    ...prev,
                    { id: Date.now(), text: noteInput },
                  ]);
                  setNoteInput("");
                }
              }}
              size="sm"
            >
              <Text style={{ fontSize: 14, fontWeight: "bold" }}>Add</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
      {/* Moisture Map Section */}
      <Card style={{ marginHorizontal: 16, marginBottom: 32 }}>
        <CardHeader>
          <CardTitle>Moisture Map (15 points)</CardTitle>
        </CardHeader>
        <CardContent>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
            }}
          >
            <Image
              source={MOCK_MAP}
              style={{
                width: 240,
                height: 120,
                borderRadius: 8,
                marginBottom: 8,
              }}
              resizeMode="contain"
            />
            <Button
              variant="secondary"
              size="icon"
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                borderRadius: 24,
                width: 48,
                height: 48,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {}}
            >
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>+</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
