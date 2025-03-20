import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { ChevronDown } from "lucide-react-native";

export declare type DamageType = "fire" | "water" | "mold" | "other";

export const DAMAGE_TYPES = [
  { label: "Fire Damage", value: "fire" },
  { label: "Water Damage", value: "water" },
  { label: "Mold Damage", value: "mold" },
  { label: "Other", value: "other" },
] as const;

interface DamageTypeSelectorProps {
  value?: DamageType;
  onChange: (value: DamageType) => void;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
}

export function DamageTypeSelector({
  value,
  onChange,
  style,
  bodyStyle,
}: DamageTypeSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel = value
    ? DAMAGE_TYPES.find((type) => type.value === value)?.label
    : "Select damage type";

  return (
    <View style={[styles.section, bodyStyle]}>
      <Text style={styles.sectionTitle}>Damage Type</Text>

      <View style={styles.sectionBody}>
        <TouchableOpacity
          style={[styles.selectorInput, style]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.inputText, !value && styles.placeholderText]}>
            {selectedLabel}
          </Text>
          <ChevronDown size={20} color="#1d1d1d" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Damage Type</Text>
              </View>

              {DAMAGE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.optionItem,
                    value === type.value && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onChange(type.value as DamageType);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === type.value && styles.selectedOptionText,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    // paddingTop: 12,
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
    borderRadius: 12,
 
  },
  selectorInput: {
    backgroundColor: "transparent",
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  placeholderText: {
    color: "#a69f9f",
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  optionText: {
    fontSize: 17,
    color: "#1d1d1d",
  },
  selectedOptionText: {
    fontWeight: "600",
    color: "#1e40af",
  },
});
