import React, { useState, useEffect, ReactNode } from "react";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
} from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import DateTimePicker, {
  CalendarDay,
  useDefaultStyles,
} from "react-native-ui-datepicker";
import { userStore } from "@/lib/state/user";
import { Separator } from "@/components/ui/separator";
import { projectsStore } from "@/lib/state/projects";
import dayjs, { Dayjs } from "dayjs";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { toast } from "sonner-native";
import {
  CalendarEvent,
  useDeleteCalendarEvent,
  useGetCalendarEvents,
} from "@service-geek/api-client";

const { width } = Dimensions.get("window");

const CustomDay = ({
  day,
  events,
  isSelected,
  onPress,
}: {
  day: CalendarDay;
  events: CalendarEvent[];
  isSelected?: boolean;
  onPress?: () => void;
}) => {
  const dayDate = day.date;
  const hasEvents = events.some((event) => {
    const eventDate = event.start
      ? new Date(event.start)
      : new Date(event.date);
    return (
      dayjs(eventDate).format("YYYY-MM-DD") ===
      dayjs(dayDate).format("YYYY-MM-DD")
    );
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          customStyles.dayContainer,
          hasEvents && customStyles.hasEventsDay,
          isSelected && customStyles.selectedDay,
        ]}
      >
        <Text
          style={[
            customStyles.dayText,
            (hasEvents || isSelected) && customStyles.dayTextLight,
          ]}
        >
          {dayjs(dayDate).format("D")}
        </Text>
        {hasEvents && <View style={customStyles.eventIndicator} />}
      </View>
    </TouchableOpacity>
  );
};

export default function CalendarScreen() {
  const { session: supabaseSession } = userStore((state) => state);
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: eventsData, isLoading: isLoadingEvents } =
    useGetCalendarEvents();
  const events = eventsData ?? [];
  const { mutate: deleteEventM } = useDeleteCalendarEvent();
  // const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { projects } = projectsStore();
  const defaultStyles = useDefaultStyles();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  // useEffect(() => {
  //   fetchEvents();

  //   // Add focus listener to refetch events when returning to the screen
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     fetchEvents();
  //   });

  //   return unsubscribe;
  // }, []);

  function getEventStatus(eventDate: Date): { status: string; color: string } {
    const now = new Date();
    const timeDifference = eventDate.getTime() - now.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    let status: string;
    let color: string;

    if (daysDifference > 30) {
      status = "Future";
      color = "#3b82f6"; // blue
    } else if (daysDifference > 7) {
      status = "Upcoming";
      color = "#10b981"; // green
    } else if (daysDifference > 0) {
      status = "Soon";
      color = "#f97316"; // orange
    } else if (daysDifference === 0) {
      status = "Today";
      color = "#ef4444"; // red
    } else {
      status = "Past";
      color = "#64748b"; // gray
    }

    return { status, color };
  }

  const handleViewEventDetails = (event: CalendarEvent) => {
    router.push({
      pathname: "calendar/event-details",
      params: {
        ...event,
        id: event.id.toString(),
        subject: event.subject,
        description: event.description,
        date: event.date,
        start: event.start || event.date,
        end: event.end || event.date,
        projectId: event.projectId?.toString() || "",
        remindClient: event.remindClient ? "true" : "false",
        remindProjectOwners: event.remindProjectOwners ? "true" : "false",
        reminderTime: event.reminderTime || "",
        users: event.usersToRemind.map((user) => user.id) || [],
      },
    });
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
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
          onPress: () => deleteEvent(event),
        },
      ]
    );
  };

  const deleteEvent = async (event: CalendarEvent) => {
    try {
      await deleteEventM(event.id);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      // toast.error("Failed to delete event");
    }
  };

  const renderDay = (day: CalendarDay): ReactNode => {
    const isSelected =
      dayjs(selectedDate).format("YYYY-MM-DD") ===
      dayjs(day.date).format("YYYY-MM-DD");

    return (
      <CustomDay
        day={day}
        events={events}
        isSelected={isSelected}
        onPress={() => {
          // Convert to string and then to Date to avoid type issues
          const dateStr = dayjs(day.date).toDate();
          setSelectedDate(dateStr);
        }}
      />
    );
  };

  const IconNext = <ChevronRight color="#1d4ed8" size={28} />;
  const IconPrev = <ChevronLeft color="#1d4ed8" size={28} />;

  const todayEvents = events.filter((event) => {
    const eventDate = event.start
      ? new Date(event.start)
      : new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  if (isDeleting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: "#64748b" }}>
          Deleting event...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setSelectedDate(new Date())}
          >
            <CalendarIcon size={16} color="#2563eb" />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          // refreshControl={
          //   <RefreshControl refreshing={loading} onRefresh={fetchEvents} />
          // }
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarContainer}>
            {/* <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </Text>
          </View> */}
            <View style={styles.calendarWrapper}>
              <DateTimePicker
                mode="single"
                className="w-full border-none bg-transparent px-0 pt-0 shadow-none"
                components={{
                  IconNext,
                  IconPrev,
                  Day: renderDay,
                }}
                onChange={(params) => {
                  console.log("🚀 ~ CalendarScreen ~ params:", params);
                  if (params.date) {
                    const dateStr = dayjs(params.date).format("YYYY-MM-DD");
                    setSelectedDate(new Date(dateStr));
                  }
                }}
                styles={{
                  ...defaultStyles,
                  day: {
                    ...defaultStyles.day,
                    backgroundColor: "transparent",
                  },
                  selected: {
                    backgroundColor: "transparent",
                  },
                }}
                date={selectedDate}
              />
            </View>
          </View>
          <View style={styles.scrollViewContent}>
            <View style={styles.dateHeader}>
              <Text style={styles.subtitle}>
                {selectedDate.toLocaleDateString("en-US", {
                  dateStyle: "full",
                })}
              </Text>
              <Text style={styles.eventCount}>
                {todayEvents.length}{" "}
                {todayEvents.length === 1 ? "Event" : "Events"}
              </Text>
            </View>

            <View style={styles.eventsContainer}>
              {todayEvents.length === 0 ? (
                <Animated.View
                  style={styles.noEventsContainer}
                  entering={FadeIn.delay(200).duration(400)}
                >
                  <Text style={styles.noEventsText}>
                    No events scheduled for today
                  </Text>
                  <TouchableOpacity
                    style={styles.addEventButton}
                    onPress={() =>
                      router.push({ pathname: "calendar/new-event" })
                    }
                  >
                    <Text style={styles.addEventButtonText}>Add Event</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                todayEvents.map((event, index) => {
                  const eventDate = event.start
                    ? new Date(event.start)
                    : new Date(event.date);
                  const status = getEventStatus(eventDate);

                  return (
                    <Animated.View
                      key={event.id}
                      style={styles.eventCard}
                      entering={FadeInDown.delay(index * 100).springify()}
                    >
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 12,
                          zIndex: 10,
                        }}
                        onPress={() => handleDeleteEvent(event)}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleViewEventDetails(event)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.eventHeader}>
                          <Text style={styles.eventTitle}>{event.subject}</Text>
                          <View
                            style={[
                              styles.eventTimeContainer,
                              { marginRight: 24 },
                            ]}
                          >
                            <Clock
                              size={14}
                              color="#64748b"
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.eventTime}>
                              {eventDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.eventDescription}>
                          {event.description}
                        </Text>

                        <View style={styles.eventFooter}>
                          {event.projectId && (
                            <View
                              style={[
                                styles.projectBadge,
                                {
                                  backgroundColor: getProjectColor(index),
                                },
                              ]}
                            >
                              <Text style={styles.projectName}>
                                {projects.find((p) => p.id === event.projectId)
                                  ?.name || "Project"}
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor: status.color + "20",
                                marginLeft: event.projectId ? 8 : 0,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: status.color },
                              ]}
                            >
                              {status.status}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => router.push({ pathname: "calendar/new-event" })}
            activeOpacity={0.8}
          >
            <Plus color="#fff" size={22} style={{ marginRight: 6 }} />
            <Text style={styles.btnText}>Add Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Function to generate consistent colors for projects
const getProjectColor = (projectId: number): string => {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#f97316", // orange
    "#ec4899", // pink
    "#06b6d4", // cyan
  ];

  return colors[projectId % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
  },
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayButtonText: {
    marginLeft: 4,
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarWrapper: {
    minHeight: 340,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    marginTop: 24,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  eventCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventsContainer: {
    marginBottom: 16,
  },
  noEventsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    height: 200,
  },
  noEventsText: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 16,
  },
  addEventButton: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addEventButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  eventCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
    paddingRight: 24, // Space for delete button
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTime: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  eventDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 20,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  projectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  projectName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

const customStyles = StyleSheet.create({
  dayContainer: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 3,
    backgroundColor: "transparent",
  },
  hasEventsDay: {
    backgroundColor: "#93c5fd", // light blue
  },
  selectedDay: {
    backgroundColor: "#2563eb", // darker blue
    transform: [{ scale: 1.05 }],
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  dayText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  dayTextLight: {
    color: "#fff",
    fontWeight: "700",
  },
  eventIndicator: {
    position: "absolute",
    bottom: 6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
  },
});
