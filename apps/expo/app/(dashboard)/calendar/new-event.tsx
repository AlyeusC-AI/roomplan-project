import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import dayjs from "dayjs";
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from "react-native-ui-datepicker";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar as CalendarIcon,
  X,
  ChevronDown,
  Search,
} from "lucide-react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { userStore } from "@/lib/state/user";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner-native";
import { FormInput, FormButton } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { projectsStore } from "@/lib/state/projects";
import { Box, VStack, HStack, FormControl, Radio, Stack, Input, Pressable, ScrollView, Text } from "native-base";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EventFormData {
  subject: string;
  payload: string;
  remindProjectOwners: boolean;
  remindClient: boolean;
  projectId: number | null;
  start: DateType;
  end: DateType;
  reminderTime?: "24h" | "2h" | "40m";
}

interface Project {
  id: number;
  name: string;
}

interface SelectItem {
  label: string;
  value: string;
}

const Header: React.FC<{ isEditMode: boolean }> = ({ isEditMode }) => {
  const router = useRouter();
  return (
    <Box style={styles.header}>
      <Box style={styles.headerAction}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color="#000" size={24} />
        </Pressable>
      </Box>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {isEditMode ? "Edit Event" : "New Event"}
      </Text>
      <Box style={[styles.headerAction, { alignItems: "flex-end" }]} />
    </Box>
  );
};

const ProjectSelector: React.FC<{
  projectId: number | null;
  projects: Project[];
  onSelect: (id: number) => void;
}> = ({ projectId, projects, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedProject = projects.find(p => p.id === projectId);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-3 py-2 rounded-md bg-background border border-input"
      >
        <Text className={cn(
          "text-sm",
          projectId ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedProject?.name || "Select a project"}
        </Text>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Pressable>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Box style={styles.calendarContainer}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <Pressable onPress={() => setIsOpen(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>

          <Box mb={4}>
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftElement={<Search size={20} color="#64748b" style={{ marginLeft: 12 }} />}
              className="bg-background border border-input rounded-md"
            />
          </Box>

          <ScrollView style={{ maxHeight: 300 }}>
            {filteredProjects.map((project) => (
              <Pressable
                key={project.id}
                onPress={() => {
                  onSelect(project.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex-row items-center justify-between px-4 py-3",
                  projectId === project.id ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <Text className="text-sm">{project.name}</Text>
                {projectId === project.id && (
                  <Check size={20} color="#1d4ed8" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Box>
      </Modal>
    </Box>
  );
};

const DateInput: React.FC<{
  label: string;
  value: DateType;
  onChange: (date: DateType) => void;
}> = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<DateType>(value);
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    setTempDate(value);
  }, [value]);

  const handleConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <Box>
      <FormControl.Label>{label}</FormControl.Label>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={styles.dateInput}
      >
        <Text style={styles.dateInputText}>
          {dayjs(value).format("MMM D, YYYY h:mm A")}
        </Text>
        <CalendarIcon color="#64748b" size={20} />
      </Pressable>

      <Modal isOpen={showPicker} onClose={() => setShowPicker(false)}>
        <Box style={styles.calendarContainer}>
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => setShowPicker(false)}>
              <X color="#64748b" size={20} />
            </Pressable>
          </HStack>
          <Box style={styles.datePickerContainer}>
            <DateTimePicker
              use12Hours={true}
              mode="single"
              timePicker
              minDate={dayjs().toDate()}
              maxDate={dayjs().endOf("year").toDate()}
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeft color="#1d4ed8" size={28} />,
              }}
              onChange={(params: { date: DateType }) => {
                setTempDate(params.date);
              }}
              styles={{
                ...defaultStyles,
                selected: {
                  ...defaultStyles.selected,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
                selected_month: {
                  ...defaultStyles.selected_month,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
                selected_year: {
                  ...defaultStyles.selected_year,
                  color: "#1d4ed8",
                  backgroundColor: "#1d4ed8",
                },
              }}
              date={tempDate}
            />
          </Box>
          <HStack space={2} mt={4}>
            <Button
              variant="outline"
              onPress={() => setShowPicker(false)}
              style={styles.modalButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Button>
            <Button
              onPress={handleConfirm}
              style={[styles.modalButton, styles.confirmButton]}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
};

export default function NewEvent() {
  const params = useLocalSearchParams();
  const isEditMode = params.editMode === "true";
  const eventId = params.eventId as string;

  const [formData, setFormData] = useState<EventFormData>({
    start: dayjs(),
    end: dayjs().add(1, "hour"),
    subject: "",
    payload: "",
    remindProjectOwners: false,
    remindClient: false,
    projectId: null,
    reminderTime: "24h",
  });
  console.log("🚀 ~ NewEvent ~ formData:", formData);

  const [isDeleting, setIsDeleting] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const session = userStore((state) => state);
  console.log("🚀 ~ NewEvent ~ session:", JSON.stringify(session, null, 2));

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { projects } = projectsStore();
  const navigation = useNavigation();
  const initialDataLoaded = React.useRef(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    // If in edit mode, populate form with event data, but only once
    if (isEditMode && params && !initialDataLoaded.current) {
      initialDataLoaded.current = true;
      setFormData({
        subject: params.subject as string,
        payload: params.payload as string,
        remindProjectOwners: params.remindProjectOwners === "true",
        remindClient: params.remindClient === "true",
        projectId: params.projectId ? Number(params.projectId) : null,
        start: params.start ? dayjs(params.start as string) : dayjs(),
        end: params.end ? dayjs(params.end as string) : dayjs().add(1, "hour"),
        reminderTime:
          (params.reminderTime as "24h" | "2h" | "40m") || undefined,
      });
    }
  }, [isEditMode, params]);

  const updateFormData = (key: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteEvent,
        },
      ]
    );
  };

  const deleteEvent = async () => {
    if (!supabaseSession) {
      toast.error("Authentication required");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/calendar-events`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession.access_token,
          },
          body: JSON.stringify({
            publicId: eventId,
          }),
        }
      );

      if (response.ok) {
        toast.success("Event deleted successfully");
        router.back();
      } else {
        toast.error("Failed to delete event");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async () => {
    const { subject, payload, start, end, projectId } = formData;

    if (!subject || !payload || !start) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!supabaseSession) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);

    try {
      const organizationId = supabaseSession.user.user_metadata.organizationId;
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/calendar-events`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession.access_token,
          },
          body: JSON.stringify({
            ...formData,
            organizationId,
            // organizationId:

            subject: subject,
            payload: payload,
            id: isEditMode ? eventId : undefined,
            remindProjectOwners: formData.remindProjectOwners,
            remindClient: formData.remindClient,
            reminderTime: formData.reminderTime,
          }),
        }
      );

      const data = await response.json();
      console.log("🚀 ~ onSubmit ~ data:", data);
      toast.success(
        isEditMode ? "Event updated successfully" : "Event created successfully"
      );
      router.back();
    } catch (error) {
      toast.error(
        isEditMode ? "Failed to update event" : "Failed to create event"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isDeleting) {
    return (
      <Box className="w-full h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>
          {isDeleting
            ? "Deleting event..."
            : isEditMode
            ? "Updating event..."
            : "Creating event..."}
        </Text>
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header isEditMode={isEditMode} />

      <ScrollView style={styles.content}>
        <VStack space={4}>
          <DateInput
            label="Event start date"
            value={formData.start}
            onChange={(date) => {
              updateFormData("start", date);
              const endDate = dayjs(formData.end);
              const startDate = dayjs(date);
              // if (endDate.isBefore(startDate)) {
              updateFormData("end", startDate.add(1, "hour").toDate());
              // }
            }}
          />

          <DateInput
            label="Event end date"
            value={formData.end}
            onChange={(date) => updateFormData("end", date)}
          />

          <Box>
            <FormControl.Label>Project (optional)</FormControl.Label>
            <ProjectSelector
              projectId={formData.projectId}
              projects={projects}
              onSelect={(id) => updateFormData("projectId", id)}
            />
          </Box>

          <FormInput
            label="Event Subject"
            placeholder="Enter event subject"
            value={formData.subject}
            onChangeText={(text) => updateFormData("subject", text)}
          />

          <FormInput
            label="Event Description"
            placeholder="Enter event description"
            value={formData.payload}
            onChangeText={(text) => updateFormData("payload", text)}
            multiline={true}
            numberOfLines={3}
          />

          <Box>
            <FormControl.Label>Reminder Time</FormControl.Label>
            <Box bg="white" rounded="lg" p={3} shadow={1}>
              <Radio.Group
                name="reminderTime"
                value={formData.reminderTime}
                onChange={(value) => updateFormData("reminderTime", value)}
              >
                <Stack space={2}>
                  <Radio value="24h">24 hours before</Radio>
                  <Radio value="2h">2 hours before</Radio>
                  <Radio value="40m">40 minutes before</Radio>
                </Stack>
              </Radio.Group>
            </Box>
          </Box>

          <HStack space={2} alignItems="center">
            <Checkbox
              checked={formData.remindClient}
              onCheckedChange={(checked) =>
                updateFormData("remindClient", checked)
              }
            />
            <Text style={styles.checkboxLabel}>Remind Client</Text>
          </HStack>

          <HStack space={2} alignItems="center">
            <Checkbox
              checked={formData.remindProjectOwners}
              onCheckedChange={(checked) =>
                updateFormData("remindProjectOwners", checked)
              }
            />
            <Text style={styles.checkboxLabel}>Remind Project Owners</Text>
          </HStack>

          <HStack space={2} mt={6}>
            {isEditMode && (
              <FormButton variant="danger" onPress={handleDelete} flex={1}>
                <HStack space={2} alignItems="center">
                  <Trash2 color="#fff" size={20} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </HStack>
              </FormButton>
            )}

            <FormButton onPress={onSubmit} flex={1}>
              <HStack space={2} alignItems="center">
                <Text style={styles.saveBtnText}>
                  {isEditMode ? "Update" : "Save"}
                </Text>
                <ArrowRight color="#fff" size={20} />
              </HStack>
            </FormButton>
          </HStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "center",
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  calendarContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
  },
  datePickerContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1d",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateInputText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  modalButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  confirmButton: {
    backgroundColor: "#1d4ed8",
    borderWidth: 0,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "600",
  },
} as const);
