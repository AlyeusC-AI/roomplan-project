import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Colors } from "@/constants/Colors";

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  connected: boolean;
  onBack: () => void;
}

export function ChatHeader({
  title,
  subtitle,
  connected,
  onBack,
}: ChatHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      {/* Connection Status */}
      {/* <View style={styles.connectionStatus}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: connected ? "#10b981" : "#ef4444" },
          ]}
        />
        <Text style={styles.statusText}>
          {connected ? "Connected" : "Disconnected"}
        </Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    borderBottomWidth: 1,
    borderBottomColor: "#1976d2",
  },
  navigationHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
});
