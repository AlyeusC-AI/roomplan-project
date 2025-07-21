// components/FloatingActionButton.tsx
import { Plus, X } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

// Add icon property to Action type
// icon: LucideIcon (component)
type Action = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
};

export default function FloatingButtonOption({
  actions,
}: {
  actions: Action[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Modal Overlay for FAB Options */}
      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.fabOptionsColumn}>
              {actions.map((action, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.squareOption}
                  onPress={() => {
                    if (!action.disabled) {
                      setOpen(false);
                      action.onPress();
                    }
                  }}
                  disabled={action.disabled}
                  activeOpacity={0.8}
                >
                  {React.createElement(action.icon as any, { size: 28 })}
                  <Text style={styles.squareLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
              {/* Close Button styled like other options but blue */}
              <TouchableOpacity
                style={[styles.squareOption, styles.closeOption]}
                onPress={() => setOpen(false)}
                activeOpacity={0.8}
              >
                {React.createElement(X as any, { size: 28, color: "#fff" })}
                <Text style={styles.closeOptionLabel}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Main FAB Button (hide when open) */}
      {!open && (
        <TouchableOpacity style={styles.fab} onPress={() => setOpen(!open)}>
          {React.createElement(Plus as any, { size: 30, color: "#fff" })}
        </TouchableOpacity>
      )}
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
    backgroundColor: Colors.light.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  fabOptionsColumn: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginBottom: 100,
    marginRight: 10,
    gap: 10,
  },
  squareOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 0,
    minWidth: 120,
    minHeight: 48,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  squareLabel: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
    color: "#1e293b",
  },
  closeFab: {
    backgroundColor: "#15438e",
    borderRadius: 32,
    width: 64,
    height: 64,
    position: "absolute",
    bottom: 30,
    right: 30,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
    alignItems: "center",
    justifyContent: "center",
  },
  closeLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  closeOption: {
    backgroundColor: "#15438e",
  },
  closeOptionLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
});
