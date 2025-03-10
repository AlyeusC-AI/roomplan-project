import { CircleAlert } from "lucide-react-native";
import React from "react";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";
// import { isSupported } from "room-plan-module"

export default function Lidar() {
  // if (!isSupported()) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
  //       <View style={styles.container}>

  //         <View style={styles.empty}>
  //           <CircleAlert size={100} color="red" />

  //           <Text style={styles.emptyTitle}>Lidar not supported</Text>

  //           <Text style={styles.emptyDescription}>
  //             Unfortunately, your device does not support Lidar scanning. Lidar
  //             scanning is only available on devices with a Lidar sensor.
  //           </Text>
  //         </View>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return <View></View>;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingBottom: 140,
    padding: 24,
  },
  /** Empty */
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
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
});
