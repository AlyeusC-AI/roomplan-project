import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import dayjs from "dayjs";
import DateTimePicker, { DateType, getDefaultStyles } from "react-native-ui-datepicker";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { userStore } from "@/lib/state/user";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner-native";
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



const Header: React.FC<{ isEditMode: boolean }> = ({ isEditMode }) => {
  const router = useRouter();
  return (
  <View style={styles.header}>
    <View style={styles.headerAction}>
      <Pressable onPress={() => router.back()}>
        <ArrowLeft color="#000" size={24} />
      </Pressable>
    </View>
    <Text numberOfLines={1} style={styles.headerTitle}>
      {isEditMode ? "Edit Event" : "New Event"}
    </Text>
    <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
  </View>
  );
};

const ProjectSelector: React.FC<{
  projectId: number | null;
  projects: Array<{ id: number; name: string }>;
  onSelect: (id: number) => void;
}> = ({ projectId, projects, onSelect }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <Text>
          {projectId
            ? projects.find((e) => e.id === projectId)?.name ?? "Select A Project"
            : "Select A Project"}
        </Text>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-64 native:w-72">
      <DropdownMenuGroup>
        <ScrollView>
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <DropdownMenuItem
                onPress={() => onSelect(project.id)}
                className="flex justify-between"
              >
                <Text>{project.name}</Text>
                {projectId === project.id && <Check size={17} />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </React.Fragment>
          ))}
        </ScrollView>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function NewEvent() {
  const params = useLocalSearchParams();
  const isEditMode = params.editMode === "true";
  const eventId = params.eventId as string;

  const [formData, setFormData] = useState<EventFormData>({
    start: dayjs(),
    end: dayjs().add(1, 'hour'),
    subject: "",
    payload: "",
    remindProjectOwners: false,
    remindClient: false,
    projectId: null,
    reminderTime: "24h",
  });
  console.log("🚀 ~ NewEvent ~ formData:", formData)

  const [isDeleting, setIsDeleting] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { projects } = projectsStore();
  const navigation = useNavigation();
  const initialDataLoaded = React.useRef(false);
  const defaultStyles = getDefaultStyles();

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
        end: params.end ? dayjs(params.end as string) : dayjs().add(1, 'hour'),
        reminderTime: (params.reminderTime as "24h" | "2h" | "40m") || undefined,
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
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteEvent
        }
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
    
    if (!subject || !payload || !start ) {
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
      console.log("🚀 ~ onSubmit ~ data:", data)
      toast.success(isEditMode ? "Event updated successfully" : "Event created successfully");
      router.back();
    } catch (error) {
      toast.error(isEditMode ? "Failed to update event" : "Failed to create event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || isDeleting) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#64748b' }}>
          {isDeleting ? "Deleting event..." : (isEditMode ? "Updating event..." : "Creating event...")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <Header  isEditMode={isEditMode} />

      <ScrollView style={styles.content}>
        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Event start date</Text>
          <View style={[styles.sectionBody, styles.calendarContainer]}>
            <DateTimePicker
              mode="single"
              timePicker
              className="w-full border-none bg-transparent px-0 pt-0 shadow-none"
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeft color="#1d4ed8" size={28} />,
            
              }}
              onChange={(params: { date: DateType }) => {
                console.log("🚀 ~ NewEvent ~ params:", params)
                // setFormData({
                //   ...formData,
                //   start: params.date ,
                //   // end: dayjs(params.date).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
                // });
                updateFormData("start", params.date);
                // Set end date to 1 hour after start date if end date is before start date
                const endDate = dayjs(formData.end);
                const startDate = dayjs(params.date);
                if (endDate.isBefore(startDate)) {
                  updateFormData("end", startDate.add(1, 'hour').toDate());
                }
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
              date={formData.start}
            />
          </View>
        </View>

        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Event end date</Text>
          <View style={[styles.sectionBody, styles.calendarContainer]}>
            <DateTimePicker
              mode="single"
              timePicker
              className="w-full border-none bg-transparent px-0 pt-0 shadow-none"
              components={{
                IconNext: <ChevronRight color="#1d4ed8" size={28} />,
                IconPrev: <ChevronLeft color="#1d4ed8" size={28} />,
             
              }}
              onChange={(params: { date: DateType }) => updateFormData("end", params.date)}
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
              date={formData.end}
            />
          </View>
        </View>

        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Project</Text>
          <ProjectSelector
            projectId={formData.projectId}
            projects={projects}
            onSelect={(id) => updateFormData("projectId", id)}
          />
        </View>

        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Event Subject</Text>
          <View style={styles.sectionTextBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={(text) => updateFormData("subject", text)}
              placeholder="Enter event subject"
              style={styles.sectionInput}
              value={formData.subject}
            />
          </View>
        </View>

        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Event Description</Text>
          <View style={styles.sectionTextBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={(text) => updateFormData("payload", text)}
              placeholder="Enter event description"
              style={styles.sectionInput}
              value={formData.payload}
              multiline={true}
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Reminder Time</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[
                styles.radioOption, 
                formData.reminderTime === "24h" && styles.radioOptionSelected
              ]}
              onPress={() => updateFormData("reminderTime", "24h")}
            >
              <View style={[
                styles.radioCircle, 
                formData.reminderTime === "24h" && styles.radioCircleSelected
              ]}>
                {formData.reminderTime === "24h" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>24 hours before</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.radioOption, 
                formData.reminderTime === "2h" && styles.radioOptionSelected
              ]}
              onPress={() => updateFormData("reminderTime", "2h")}
            >
              <View style={[
                styles.radioCircle, 
                formData.reminderTime === "2h" && styles.radioCircleSelected
              ]}>
                {formData.reminderTime === "2h" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>2 hours before</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.radioOption, 
                formData.reminderTime === "40m" && styles.radioOptionSelected
              ]}
              onPress={() => updateFormData("reminderTime", "40m")}
            >
              <View style={[
                styles.radioCircle, 
                formData.reminderTime === "40m" && styles.radioCircleSelected
              ]}>
                {formData.reminderTime === "40m" && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioText}>40 minutes before</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            checked={formData.remindClient}
            onCheckedChange={(checked) => updateFormData("remindClient", checked)}
          />
          <Text style={styles.checkboxLabel}>Remind Client</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            checked={formData.remindProjectOwners}
            onCheckedChange={(checked) => updateFormData("remindProjectOwners", checked)}
          />
          <Text style={styles.checkboxLabel}>Remind Project Owners</Text>
        </View>

        <View style={styles.buttonContainer}>
          {isEditMode && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 color="#fff" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onSubmit} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>{isEditMode ? "Update" : "Save"}</Text>
            <ArrowRight color="#fff" size={20} style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
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
  section: {
    paddingTop: 12,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: "500",
    color: "#a69f9f",
    textTransform: "uppercase",
  },
  sectionTextBody: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionBody: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionInput: {
    backgroundColor: "#fff",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  radioGroup: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radioOptionSelected: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: "#2563eb",
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#2563eb",
  },
  radioText: {
    fontSize: 16,
    color: "#1d1d1d",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    marginLeft: 10,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#1d4ed8",
    borderColor: "#1d4ed8",
    marginVertical: 24,
    marginHorizontal: 36,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
    marginRight: "auto",
    marginLeft: "auto",
  },
  calendarContainer: {
    padding: 16,
    paddingBottom: 24,
    minHeight: 360,
  },
});
