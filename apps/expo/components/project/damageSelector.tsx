import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
export declare type DamageType = "fire" | "water" | "mold" | "other";

export const DAMAGE_TYPES = [
  { label: "Fire Damage", value: "fire" },
  { label: "Water Damage", value: "water" },
  { label: "Mold Damage", value: "mold" },
  { label: "Other", value: "other" },
] as const;

interface DamageTypeSelectorProps {
  value: DamageType;
  onChange: (value: DamageType) => void;
}

export function DamageTypeSelector({ value, onChange }: DamageTypeSelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Damage Type</Text>

      <View style={styles.sectionBody}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => onChange(itemValue as DamageType)}
            style={styles.picker}
          >
            {DAMAGE_TYPES.map((type) => (
              <Picker.Item
                key={type.value}
                label={type.label}
                value={type.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 44,
    width: "100%",
  },
}); 