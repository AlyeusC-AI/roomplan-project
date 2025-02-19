import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import DateTimePicker from "react-native-ui-datepicker";
import { userStore } from "@/lib/state/user";
import { Separator } from "@/components/ui/separator";
import { projectsStore } from "@/lib/state/projects";

const { width } = Dimensions.get("window");

export default function Example() {
  const { session: supabaseSession } = userStore((state) => state);

  const navigation = useNavigation();

  const [form, setForm] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const { projects } = projectsStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/calendar-events`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${supabaseSession?.access_token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        console.log(data);
        setEvents(data.data);
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
        </View>

        {/* <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) {
                return;
              }

              const index = ind - 1;
              setValue(moment(value).add(index, "week").toDate());

              setTimeout(() => {
                setWeek(week + index);
                swiper.current?.scrollTo(1, false);
              }, 10);
            }}
          >
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive =
                    value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={dateIndex}
                      onPress={() => setValue(item.date)}
                    >
                      <View
                        style={[
                          styles.item,
                          isActive && {
                            backgroundColor: "#2563eb",
                            borderColor: "#2563eb",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemWeekday,
                            isActive && { color: "#fff" },
                          ]}
                        >
                          {item.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.itemDate,
                            isActive && { color: "#fff" },
                          ]}
                        >
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View> */}
        <DateTimePicker
          mode="single"
          buttonNextIcon={<ChevronRight color="#1d4ed8" />}
          buttonPrevIcon={<ChevronLeft color="#1d4ed8" />}
          onChange={(params) => setForm(new Date(params.date))}
          selectedItemColor="#1d4ed8"
          date={form}
        />

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchEvents} />
          }
          style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}
        >
          <Text style={styles.subtitle}>
            {form.toLocaleDateString("en-US", { dateStyle: "full" })}
          </Text>
          <View style={styles.placeholder}>
            <View style={styles.placeholderInset}>
              {events.filter(
                (event) =>
                  new Date(event.date).toDateString() === form.toDateString()
              ).length === 0 && <Text>No Events</Text>}
              {events
                .filter(
                  (event) =>
                    new Date(event.date).toDateString() === form.toDateString()
                )
                .map((event) => (
                  <View key={event.id}>
                    <Separator />
                    <View className="my-5">
                      <View className="flex flex-row justify-between items-center">
                        <Text className="font-bold text-2xl">
                          {event.subject}
                        </Text>
                        <Text>{new Date(event.date).toLocaleDateString()}</Text>
                      </View>
                      <View className="flex flex-row justify-between items-center mt-2">
                        <Text className="text-gray-600 text-lg font-regular">
                          {event.payload}
                        </Text>
                        <Text>
                          {
                            projects.find((e) => e.id == event.projectId)
                              .clientName
                          }
                        </Text>
                      </View>
                    </View>
                    <Separator />
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "calendar/new-event" })}
          >
            <View style={styles.btn}>
              <Plus color="#fff" size={22} style={{ marginRight: 6 }} />

              <Text style={styles.btnText}>Add Event</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#999999",
    marginBottom: 12,
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 16,
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
  /** Item */
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#e3e3e3",
    flexDirection: "column",
    alignItems: "center",
  },
  itemRow: {
    width: width,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: "500",
    color: "#737373",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  /** Placeholder */
  placeholder: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    height: 400,
    marginTop: 0,
    padding: 0,
    backgroundColor: "transparent",
  },
  placeholderInset: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
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
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});
