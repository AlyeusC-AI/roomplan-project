import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import dayjs from "dayjs";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react-native";
import { router, useNavigation } from "expo-router";

export default function Example() {
  const [form, setForm] = useState<DateType>(dayjs());

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity
            onPress={() => router.dismiss()}
          >
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          New Event
        </Text>

        <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
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
        </View>

        <TouchableOpacity
          onPress={() => {
            // handle onPress
          }}
        >
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Save</Text>

            <ArrowRight
              color="#fff"
              size={22}
              style={{ marginLeft: 12 }}
            />
          </View>
        </TouchableOpacity>
      </View>
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
