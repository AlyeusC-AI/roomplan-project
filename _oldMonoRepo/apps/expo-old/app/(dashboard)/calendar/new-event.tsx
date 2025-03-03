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
} from "react-native";
import dayjs from "dayjs";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useNavigation, useRouter } from "expo-router";
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

export default function Example() {
  const [form, setForm] = useState<DateType>(dayjs());
  const [reminder, setReminder] = useState<DateType>(dayjs());

  const [eventSubject, setEventSubject] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [remindProjectOwners, setRemindProjectOwners] = useState(false);
  const [remindClient, setRemindClient] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const { projects } = projectsStore();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  const onSubmit = () => {
    if (!eventSubject || !eventDescription || !form || !projectId) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    const organizationId = supabaseSession.user.user_metadata.organizationId;
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/calendar-events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${supabaseSession?.access_token}`,
        },
        body: JSON.stringify({
          subject: eventSubject,
          payload: eventDescription,
          remindProjectOwners: remindProjectOwners,
          remindClient: remindClient,
          start: form,
          end: form,
          reminderDate: reminder,
          organizationId,
          projectId: projectId,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setLoading(false);
        router.dismiss();
      });
  };

  if (loading) {
    return (
      <View className="w-full h-full flex justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity onPress={() => router.dismiss()}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          New Event
        </Text>

        <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
      </View>

      <ScrollView style={styles.content}>
        <View style={{ ...styles.section, paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Event date</Text>

          <View style={styles.sectionBody}>
            <DateTimePicker
              mode="single"
              minDate={dayjs()}
              buttonNextIcon={<ChevronRight color="#1d4ed8" />}
              buttonPrevIcon={<ChevronLeft color="#1d4ed8" />}
              onChange={(params) => setForm(params.date)}
              selectedItemColor="#1d4ed8"
              date={form}
            />
          </View>

          <View style={{ ...styles.section, paddingHorizontal: 10 }}>
            <Text style={styles.sectionTitle}>Event Subject</Text>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Text>
                    {projectId ? (
                      <Text>
                        {projects.find((e) => e.id === projectId).name}
                      </Text>
                    ) : (
                      <Text>Select A Project</Text>
                    )}
                  </Text>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 native:w-72">
                <DropdownMenuGroup>
                  <ScrollView>
                    {projects.map((project) => (
                      <>
                        <DropdownMenuItem
                          onPress={() => setProjectId(project.id)}
                          className="flex justify-between"
                        >
                          <Text>{project.name}</Text>
                          {projectId === project.id && (
                            <Check size={17} />
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ))}
                  </ScrollView>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>

          <View style={{ ...styles.section, paddingHorizontal: 10 }}>
            <Text style={styles.sectionTitle}>Event Subject</Text>

            <View style={styles.sectionTextBody}>
              <TextInput
                clearButtonMode="while-editing"
                onChangeText={setEventSubject}
                placeholder="Enter event subject"
                style={styles.sectionInput}
                value={eventSubject}
              />
            </View>
          </View>

          <View style={{ ...styles.section, paddingHorizontal: 10 }}>
            <Text style={styles.sectionTitle}>Event Payload</Text>

            <View style={styles.sectionTextBody}>
              <TextInput
                clearButtonMode="while-editing"
                onChangeText={setEventDescription}
                placeholder="Enter event payload"
                style={styles.sectionInput}
                value={eventDescription}
              />
            </View>
          </View>

          <View style={{ ...styles.section, paddingHorizontal: 10 }}>
            <Text style={styles.sectionTitle}>Event Reminder Date</Text>

            <View style={styles.sectionBody}>
              <DateTimePicker
                mode="single"
                minDate={dayjs()}
                buttonNextIcon={<ChevronRight color="#1d4ed8" />}
                buttonPrevIcon={<ChevronLeft color="#1d4ed8" />}
                onChange={(params) => setReminder(params.date)}
                selectedItemColor="#1d4ed8"
                date={reminder}
              />
            </View>
          </View>

          <View
            style={{
              ...styles.section,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={remindClient}
              onCheckedChange={setRemindClient}
            />
            <Text style={styles.sectionTitle}>Remind Client</Text>
          </View>

          <View
            style={{
              ...styles.section,
              paddingHorizontal: 16,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={remindProjectOwners}
              onCheckedChange={setRemindProjectOwners}
            />
            <Text style={styles.sectionTitle}>Remind Project Owners</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onSubmit}>
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Save</Text>

            <ArrowRight color="#fff" size={22} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
  /** Header */
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
  /** Section */
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
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  /** Button */
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
});
