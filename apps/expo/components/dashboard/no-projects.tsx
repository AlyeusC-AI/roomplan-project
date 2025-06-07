import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

export default function NoProjects() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerAction} />
          </View>

          <Text style={styles.headerTitle}>Projects</Text>
        </View> */}

        <View style={styles.empty}>
          <View style={styles.fake}>
            <View style={styles.fakeCircle} />

            <View>
              <View style={[styles.fakeLine, { width: 120 }]} />

              <View style={styles.fakeLine} />

              <View style={[styles.fakeLine, { width: 70, marginBottom: 0 }]} />
            </View>
          </View>

          <View style={[styles.fake, { opacity: 0.5 }]}>
            <View style={styles.fakeCircle} />

            <View>
              <View style={[styles.fakeLine, { width: 120 }]} />

              <View style={styles.fakeLine} />

              <View style={[styles.fakeLine, { width: 70, marginBottom: 0 }]} />
            </View>
          </View>

          <Text style={styles.emptyTitle}>No Projects</Text>

          <Text style={styles.emptyDescription}>
            Press the plus button below to create your first project and start
            managing with RestoreGeek.
          </Text>
        </View>

        <TouchableOpacity onPress={() => router.push("/projects/new-project")}>
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Create A Project</Text>

            <Plus color="#fff" size={22} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Header */
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTop: {
    marginHorizontal: -6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "700",
    color: "#1d1d1d",
  },
  /** Empty */
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 100,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    color: "#8c9197",
    textAlign: "center",
  },
  /** Fake */
  fake: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  fakeCircle: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    backgroundColor: "#e8e9ed",
    marginRight: 16,
  },
  fakeLine: {
    width: 200,
    height: 10,
    borderRadius: 4,
    backgroundColor: "#e8e9ed",
    marginBottom: 8,
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
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
    marginTop: "auto",
    marginHorizontal: 24,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});
