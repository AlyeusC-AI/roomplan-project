import { View, StyleSheet } from "react-native";

interface ProgressProps {
  value: number;
  style?: any;
}

export function Progress({ value, style }: ProgressProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progress, { width: `${value}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#182e43",
  },
});
