import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { X, ChevronRight, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  useGetProjectById,
  useGetRooms,
  useGetRoom,
  useUpdateProject,
  useUpdateRoom,
  useGetDocuments, // <-- add this
  DocumentType, // <-- add this
} from "@service-geek/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextInput, Image } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import ClaimSummaryEditor from "@/components/project/ClaimSummaryEditor";

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
  onPress?: () => void;
};

const TaskRow: React.FC<TaskRowProps> = ({ label, done, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      opacity: onPress ? 1 : 0.6,
    }}
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

  // Add: fetch project documents
  const { data: documents } = useGetDocuments(projectId);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);

  // Add state to control showing room tasks
  const [showRoomTasks, setShowRoomTasks] = useState(false);

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

  // Claim summary modal state
  const [showClaimSummaryModal, setShowClaimSummaryModal] = useState(false);

  // Handlers for claim summary/images auto-save
  const handleChangeClaimSummary = (summary: string) => {
    if (projectId && summary !== project?.data?.claimSummary) {
      updateProject.mutate({
        id: projectId,
        data: { claimSummary: summary },
      });
    }
  };
  const handleChangeClaimSummaryImages = (images: string[]) => {
    if (
      projectId &&
      JSON.stringify(images) !==
        JSON.stringify(project?.data?.claimSummaryImages || [])
    ) {
      updateProject.mutate({
        id: projectId,
        data: { claimSummaryImages: images },
      });
    }
  };

  // Compute projectTasks from real data
  const projectData = project?.data;
  // Check if a Work Auth document exists
  const hasWorkAuth = useMemo(
    () =>
      (documents || []).some(
        (doc) =>
          doc.type === DocumentType.AUTH ||
          doc.name?.toLowerCase().includes("work auth")
      ),
    [documents]
  );
  const computedProjectTasks = [
    {
      label: "Take Cover Photo",
      done: !!projectData?.mainImage,
      onPress: () =>
        router.push({ pathname: "../pictures", params: { projectId } }),
    },
    {
      label: "Enter Job & Insurance Info",
      done:
        !!projectData?.insuranceCompanyName &&
        !!projectData?.insuranceClaimId &&
        !!projectData?.adjusterName &&
        !!projectData?.adjusterEmail &&
        !!projectData?.adjusterPhoneNumber &&
        !!projectData?.policyNumber,
      onPress: () =>
        router.push({
          pathname: "../details",
          params: { projectId, activeTab: "insurance" },
        }),
    },
    {
      label: "Sign Work Auth",
      done: hasWorkAuth,
      onPress: () =>
        router.push({ pathname: "../documents", params: { projectId } }),
    },
    {
      label: "Document source of loss",
      done: !!projectData?.claimSummary,
      onPress: () => setShowClaimSummaryModal(true),
    },
    // The rest of the tasks
    {
      label: "Make lidar sketch",
      done: Array.isArray(rooms) && rooms.some((room) => !!room.roomPlanSVG),
      onPress: () =>
        router.push({ pathname: `../lidar/rooms`, params: { projectId } }),
    },
    ...WATER_PROJECT_TASKS.slice(5).map((label) => ({
      label,
      done: false,
      onPress: () => {},
    })),
  ];

  // Checklist state
  const [roomTasks, setRoomTasks] = useState(
    WATER_ROOM_TASKS.map((label) => ({
      label,
      done: false,
      onPress: undefined,
    }))
  );

  // Sync checklist state with backend data
  useEffect(() => {
    if (roomData?.copilotProgress) {
      setRoomTasks(
        roomData.copilotProgress.map(
          (task: { label: string; done: boolean }) => ({
            ...task,
            onPress: undefined,
          })
        )
      );
    } else {
      setRoomTasks(
        WATER_ROOM_TASKS.map((label) => ({
          label,
          done: false,
          onPress: undefined,
        }))
      );
    }
  }, [roomData]);

  useEffect(() => {
    // Handle different possible project data structures
    // const projectData = project?.data;
    // if (projectData && projectData.copilotProgress) {
    //   setProjectTasks(projectData.copilotProgress);
    // } else {
    //   setProjectTasks(
    //     WATER_PROJECT_TASKS.map((label) => ({ label, done: false }))
    //   );
    // }
  }, [project]);

  // Reset showRoomTasks to false every time the screen is opened, unless all project tasks are completed
  useEffect(() => {
    if (computedProjectTasks.every((t) => t.done)) {
      setShowRoomTasks(true);
    } else {
      setShowRoomTasks(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projectId,
    computedProjectTasks.length,
    project?.data?.mainImage,
    project?.data?.insuranceCompanyName,
    project?.data?.insuranceClaimId,
    project?.data?.adjusterName,
    project?.data?.adjusterEmail,
    project?.data?.adjusterPhoneNumber,
    project?.data?.policyNumber,
  ]);

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
        // This part of the logic is now handled by computedProjectTasks
        // and the onPress handlers for project tasks.
        // We keep this function signature for consistency, but it won't be called
        // for project tasks that have onPress handlers.
        console.warn("Project task toggle clicked, but no onPress handler.");
      }
    },
    [roomTasks, currentRoom, updateRoom]
  );

  const handleNextRoom = () => {
    if (!rooms || !currentRoom) return;
    const idx = rooms.findIndex((r) => r.id === currentRoom.id);
    if (idx < rooms.length - 1) {
      setSelectedRoomId(rooms[idx + 1].id);
      setRoomTasks(
        WATER_ROOM_TASKS.map((label) => ({
          label,
          done: false,
          onPress: undefined,
        }))
      );
    }
  };

  // UI
  const loading = currentRoom ? !roomData : !project;
  return (
    <>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          // paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: "#2563eb",
          // color: "white",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <XIcon size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setRoomDropdownOpen((v) => !v)}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            {currentRoom ? currentRoom.name : "Project Tasks"}
          </Text>
          {rooms &&
            rooms.length > 1 &&
            (roomDropdownOpen ? (
              <ChevronUpIcon
                size={20}
                style={{ marginLeft: 4, color: "white" }}
              />
            ) : (
              <ChevronDownIcon
                size={20}
                style={{ marginLeft: 4, color: "white" }}
              />
            ))}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextRoom}
          disabled={!rooms || !currentRoom || rooms.length < 2}
        >
          <ChevronRightIcon
            size={28}
            color={rooms && currentRoom && rooms.length > 1 ? "white" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
      {/* Instructional Text */}
      <ScrollView style={{ flex: 1, backgroundColor: "#2563eb" }}>
        {/* Project Tasks Checklist */}
        {!showRoomTasks && (
          <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <CardHeader
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 0,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CardTitle>Project Tasks</CardTitle>
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
                  {`${computedProjectTasks.filter((t) => t.done).length}/${computedProjectTasks.length}`}
                </Badge>
              </View>
              {/* Elegant text-link style for 'Start with Rooms' */}
              {rooms && rooms.length > 0 && (
                <TouchableOpacity
                  onPress={() => setShowRoomTasks(true)}
                  style={{ padding: 4 }}
                >
                  <Text
                    style={{
                      color: "#2563eb",
                      fontSize: 14,
                      fontWeight: "500",
                      textDecorationLine: "underline",
                    }}
                  >
                    Start with Rooms
                  </Text>
                </TouchableOpacity>
              )}
            </CardHeader>
            <CardContent>
              <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                {`${computedProjectTasks.filter((t) => t.done).length}/${computedProjectTasks.length} tasks completed`}
              </Text>
              {computedProjectTasks.map((task, idx) => (
                <TaskRow
                  key={task.label}
                  label={task.label}
                  done={task.done}
                  onPress={task.onPress}
                />
              ))}
            </CardContent>
          </Card>
        )}
        {/* Room Tasks Checklist (if a room is selected and showRoomTasks is true) */}
        {currentRoom && showRoomTasks && (
          <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <CardHeader
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 0,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CardTitle>{currentRoom.name} Tasks</CardTitle>
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
                  {`${roomTasks.filter((t) => t.done).length}/${roomTasks.length}`}
                </Badge>
              </View>
            </CardHeader>
            <CardContent>
              <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                {`${roomTasks.filter((t) => t.done).length}/${roomTasks.length} tasks completed`}
              </Text>
              {roomTasks.map((task, idx) => (
                <TaskRow
                  key={task.label}
                  label={task.label}
                  done={task.done}
                  onPress={task.onPress}
                />
              ))}
            </CardContent>
          </Card>
        )}
        {/* Work Notes Section */}
        <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <CardHeader>
            <CardTitle>Work Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginBottom: 8,
              }}
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

      {/* Room dropdown modal */}
      <Modal
        visible={roomDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRoomDropdownOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Select Room</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setRoomDropdownOpen(false)}
              >
                <XIcon size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>
                Choose a room to work on
              </Text>

              <View style={styles.roomList}>
                {rooms?.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.roomOption,
                      selectedRoomId === room.id && styles.selectedRoom,
                    ]}
                    onPress={() => {
                      setSelectedRoomId(room.id);
                      setRoomDropdownOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.roomOptionText,
                        selectedRoomId === room.id && styles.selectedRoomText,
                      ]}
                    >
                      {room.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Claim Summary Editor Modal */}
      <ClaimSummaryEditor
        visible={showClaimSummaryModal}
        onClose={() => setShowClaimSummaryModal(false)}
        claimSummary={project?.data?.claimSummary || ""}
        claimSummaryImages={project?.data?.claimSummaryImages || []}
        onChangeSummary={handleChangeClaimSummary}
        onChangeImages={handleChangeClaimSummaryImages}
        projectId={projectId}
        onTakePhoto={() => {
          setShowClaimSummaryModal(false);
          setTimeout(() => {
            router.push({
              pathname: `/projects/${projectId}/camera`,
              params: { mode: "claimSummary" },
            });
          }, 200);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalBody: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  roomList: {
    marginBottom: 20,
  },
  roomOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectedRoom: {
    backgroundColor: "#2563eb",
  },
  roomOptionText: {
    fontSize: 16,
    color: "#1e293b",
  },
  selectedRoomText: {
    color: "#fff",
    fontWeight: "600",
  },
});
