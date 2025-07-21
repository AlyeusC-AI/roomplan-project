import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Text } from "./text";
import { ChevronDown, Plus, Search, Pencil, Trash2 } from "lucide-react-native";
import { cn } from "@/lib/utils";
import type { MaterialOption } from "@/lib/constants/materialOptions";
import { savedOptionsStore } from "@/lib/state/saved-options";
import { api } from "@/lib/api";
import { Colors } from "@/constants/Colors";

interface MaterialSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: MaterialOption[];
  title: string;
  type: "wallMaterial" | "floorMaterial";
}

export function MaterialSelect({
  value,
  onValueChange,
  placeholder = "Select material",
  options,
  title,
  type,
}: MaterialSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [editingOption, setEditingOption] = useState<MaterialOption | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    createOption,
    deleteOption,
    updateOption,
    setSavedOptions,
    wallMaterial,
    floorMaterial,
  } = savedOptionsStore();

  const selectedOption =
    type == "wallMaterial"
      ? wallMaterial.find((opt) => opt.value === value)
      : floorMaterial.find((opt) => opt.value === value);

  //   const filteredOptions = options.filter(option =>
  //     option.label.toLowerCase().includes(searchQuery.toLowerCase())
  //   );

  useEffect(() => {
    fetchSavedOptions();
  }, []);

  const fetchSavedOptions = async () => {
    try {
      const { data } = await api.get(
        `/api/v1/organization/savedOption?type=${type}`
      );

      console.log("🚀 ~ fetchSavedOptions ~ data:", data);
      if (data?.status == "ok" && Array.isArray(data.options)) {
        setSavedOptions({
          [type]: [...options, ...data.options],
        });
      }
    } catch (error) {
      console.error("Error fetching saved options:", error);
    }
  };

  const handleAddNewOption = async () => {
    if (!newOptionLabel.trim()) return;

    setIsLoading(true);
    try {
      const value = newOptionLabel.trim().toLowerCase().replace(/\W/g, "");
      const newOption = { label: newOptionLabel.trim(), value };

      const { data } = await api.post("/api/v1/organization/savedOption", {
        label: newOptionLabel.trim(),
        type,
      });

      if (data.status == "ok" && data.option) {
        createOption(data.option, type);
        onValueChange(value);
        setNewOptionLabel("");
        setShowAddNew(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error adding new option:", error);
      Alert.alert("Error", "Failed to add new material");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOption = async (option: MaterialOption) => {
    setIsLoading(true);
    try {
      const { data } = await api.patch("/api/v1/organization/savedOption", {
        publicId: option.publicId,
        label: option.label,
        type,
      });

      if (data?.status == "ok") {
        updateOption(option, type);
        setEditingOption(null);
      }
    } catch (error) {
      console.error("Error updating option:", error);
      Alert.alert("Error", "Failed to update material");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOption = async (option: MaterialOption) => {
    if (!option.publicId) return;

    Alert.alert(
      "Delete Material",
      "Are you sure you want to delete this material?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              const { data } = await api.delete(
                `/api/v1/organization/savedOption`,
                {
                  data: {
                    publicId: option.publicId,
                  },
                }
              );

              if (data?.status == "ok") {
                deleteOption(option, type);
                if (value === option.value) {
                  onValueChange("");
                }
              }
            } catch (error) {
              console.error("Error deleting option:", error);
              Alert.alert("Error", "Failed to delete material");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          "flex-row items-center justify-between",
          "px-3 py-2 rounded-md",
          "bg-background border border-input"
        )}
      >
        <Text
          className={cn(
            "text-sm",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text className="text-primary">Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search materials..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <FlatList
              data={type == "wallMaterial" ? wallMaterial : floorMaterial}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <View style={styles.optionItemContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      value === item.value && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        value === item.value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                  {item.publicId && (
                    <View style={styles.optionActions}>
                      <TouchableOpacity
                        onPress={() => setEditingOption(item)}
                        style={styles.actionButton}
                      >
                        <Pencil size={16} color="#64748b" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteOption(item)}
                        style={styles.actionButton}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              style={styles.optionsList}
            />

            {editingOption ? (
              <View style={styles.addNewForm}>
                <TextInput
                  style={styles.addNewInput}
                  placeholder="Edit material name"
                  value={editingOption.label}
                  onChangeText={(text) =>
                    setEditingOption({ ...editingOption, label: text })
                  }
                  placeholderTextColor="#94a3b8"
                  autoFocus
                />
                <View style={styles.addNewButtons}>
                  <TouchableOpacity
                    onPress={() => setEditingOption(null)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditOption(editingOption)}
                    style={[
                      styles.addButton,
                      !editingOption.label.trim() && styles.addButtonDisabled,
                    ]}
                    disabled={!editingOption.label.trim() || isLoading}
                  >
                    <Text style={styles.addButtonText}>
                      {isLoading ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.addNewSection}>
                {showAddNew ? (
                  <View style={styles.addNewForm}>
                    <TextInput
                      style={styles.addNewInput}
                      placeholder="Enter material name"
                      value={newOptionLabel}
                      onChangeText={setNewOptionLabel}
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                    <View style={styles.addNewButtons}>
                      <TouchableOpacity
                        onPress={() => setShowAddNew(false)}
                        style={styles.cancelButton}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleAddNewOption}
                        style={[
                          styles.addButton,
                          !newOptionLabel.trim() && styles.addButtonDisabled,
                        ]}
                        disabled={!newOptionLabel.trim() || isLoading}
                      >
                        <Text style={styles.addButtonText}>
                          {isLoading ? "Adding..." : "Add"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addNewButton}
                    onPress={() => setShowAddNew(true)}
                  >
                    <Plus size={20} color={Colors.light.primary} />
                    <Text style={styles.addNewButtonText}>
                      Add New Material
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#334155",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  optionItem: {
    flex: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  selectedOption: {
    backgroundColor: "#f0f9ff",
  },
  optionText: {
    fontSize: 16,
    color: "#334155",
  },
  selectedOptionText: {
    color: "#1e88e5",
    fontWeight: "600",
  },
  optionActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  addNewSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
  },
  addNewButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1e88e5",
    fontWeight: "500",
  },
  addNewForm: {
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  addNewInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    fontSize: 16,
    color: "#334155",
  },
  addNewButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#64748b",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#1e88e5",
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});
