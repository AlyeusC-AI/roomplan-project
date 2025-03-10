import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export default function Empty({
  title,
  description,
  buttonText,
  onPress,
  header = undefined,
  icon,
  secondaryIcon,
}: {
  title: string;
  description: string;
  header?: string;
  buttonText: string;
  onPress: () => void;
  icon: React.ReactNode;
  secondaryIcon: React.ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <View style={styles.container}>
        <Text style={styles.title}>{header}</Text>

        <View style={styles.empty}>
          {icon}

          <Text style={styles.emptyTitle}>{title}</Text>

          <Text style={styles.emptyDescription}>{description}</Text>

          <TouchableOpacity onPress={onPress}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>{buttonText}</Text>

              {secondaryIcon ?? icon}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingBottom: 140,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 12,
  },
  /** Empty */
  empty: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: "#878787",
    marginBottom: 24,
    textAlign: "center"
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: "#2b64e3",
    borderColor: "#2b64e3",
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#fff",
  },
});
