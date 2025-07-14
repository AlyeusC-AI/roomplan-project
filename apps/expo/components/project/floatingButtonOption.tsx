// components/FloatingActionButton.tsx
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Action = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function FloatingButtonOption({ actions }: { actions: Action[] }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {open && (
        <View style={styles.optionsContainer}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.option, action.disabled && { opacity: 0.5 }]}
              onPress={() => {
                if (!action.disabled) {
                  setOpen(false);
                  action.onPress();
                }
              }}
              disabled={action.disabled}
            >
              <Text style={styles.optionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)}>
        <Plus size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 30,
    right: 30,
    alignItems: "flex-end",
    zIndex: 1000,
  },
  fab: {
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  optionText: {
    color: "#fff",
    marginLeft: 8,
  },
});
