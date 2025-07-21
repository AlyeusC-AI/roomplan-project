import React, { useState } from "react";
import {
  View,
  FlatList,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetProjectMaterials,
  useGetMaterials,
  useCreateProjectMaterial,
  useDeleteProjectMaterial,
  useCreateMaterial,
  useUpdateProjectMaterial,
  useGetProjectMaterial,
} from "@service-geek/api-client";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react-native";
import { Select } from "@/components/ui/select";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Material } from "@service-geek/api-client";

// 1. Add MaterialSelector component above the main function
type MaterialSelectorProps = {
  materials: Material[] | undefined;
  value: string | undefined;
  onChange: (value: string) => void;
  onAddNew: () => void;
  disabled?: boolean;
};

function MaterialSelector({
  materials,
  value,
  onChange,
  onAddNew,
  disabled,
}: MaterialSelectorProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Select
        value={value || ""}
        onValueChange={onChange}
        placeholder="Select material"
        options={
          materials
            ? materials.map((m: Material) => ({ value: m.id, name: m.name }))
            : []
        }
      />
      <Button
        variant="outline"
        onPress={onAddNew}
        style={{ marginTop: 8, borderRadius: 8 }}
        disabled={disabled}
      >
        <Text style={{ fontWeight: "700" }}>+ Add New Material</Text>
      </Button>
    </View>
  );
}

export default function DryStandardScreen() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: dryStandards,
    isLoading,
    isError,
    refetch,
  } = useGetProjectMaterials(projectId as string);
  const { data: materials } = useGetMaterials();
  const createMutation = useCreateProjectMaterial();
  const deleteMutation = useDeleteProjectMaterial();
  const createMaterialMutation = useCreateMaterial();
  const updateProjectMaterialMutation = useUpdateProjectMaterial();
  const [editId, setEditId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  // Remove currentMoisture from form state
  const [form, setForm] = useState({
    materialId: undefined as string | undefined,
    customVariance: "",
    moistureContent: "",
    dryGoal: "",
  });

  // 2. In DryStandardScreen, add state for addNewMaterialMode and newMaterialForm
  const [addNewMaterialMode, setAddNewMaterialMode] = useState(false);
  const [newMaterialForm, setNewMaterialForm] = useState({
    name: "",
    variance: "",
  });

  // Helper to get selected material
  const selectedMaterial = materials?.find((m) => m.id === form.materialId);
  const effectiveVariance =
    form.customVariance !== ""
      ? parseFloat(form.customVariance)
      : (selectedMaterial?.variance ?? 0);
  const moistureNum =
    form.moistureContent !== "" ? parseFloat(form.moistureContent) : 0;
  const dryGoalValue = moistureNum * (1 + effectiveVariance / 100);

  // When material changes, set customVariance to material's variance
  React.useEffect(() => {
    if (selectedMaterial && form.materialId) {
      setForm((f) => ({
        ...f,
        customVariance: selectedMaterial.variance.toString(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.materialId]);

  const handleAdd = () => {
    setForm({
      materialId: undefined,
      customVariance: "",
      moistureContent: "",
      dryGoal: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (item: any) => {
    setForm({
      materialId: item.materialId,
      customVariance: item.customVariance?.toString() ?? "",
      moistureContent: item.moistureContent?.toString() ?? "",
      dryGoal: item.dryGoal?.toString() ?? "",
    });
    setEditId(item.id);
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!form.materialId) {
      Alert.alert("Please select a material");
      return;
    }
    if (editId) {
      updateProjectMaterialMutation.mutate(
        {
          id: editId,
          data: {
            customVariance: form.customVariance
              ? parseFloat(form.customVariance)
              : undefined,
            moistureContent: form.moistureContent
              ? parseFloat(form.moistureContent)
              : undefined,
            dryGoal: dryGoalValue,
          },
        },
        {
          onSuccess: () => {
            setModalVisible(false);
            setEditId(null);
            refetch();
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          projectId: projectId as string,
          materialId: form.materialId,
          customVariance: form.customVariance
            ? parseFloat(form.customVariance)
            : undefined,
          moistureContent: form.moistureContent
            ? parseFloat(form.moistureContent)
            : undefined,
          dryGoal: dryGoalValue,
        },
        {
          onSuccess: () => setModalVisible(false),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this dry standard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  const { top } = useSafeAreaInsets();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (isError)
    return <Text style={{ color: "red" }}>Failed to load dry standards.</Text>;

  const XIcon = X as any;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ padding: 16 }}>
        <Button onPress={handleAdd} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Add Dry Standard
          </Text>
        </Button>
        <FlatList
          data={dryStandards || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card key={item.id} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={{ padding: 0 }}
                activeOpacity={0.8}
              >
                <CardHeader style={{ paddingBottom: 8 }}>
                  <CardTitle>{item.material.name}</CardTitle>
                </CardHeader>
                <CardContent style={{ paddingTop: 0 }}>
                  <Text>
                    Variance: {item.customVariance ?? item.material.variance}%
                  </Text>
                  <Text>Moisture Content: {item.moistureContent ?? "-"}</Text>
                  <Text>Dry Goal: {item.dryGoal ?? "-"}</Text>
                  <View style={{ flexDirection: "row", marginTop: 12 }}>
                    <Button
                      variant="destructive"
                      onPress={() => handleDelete(item.id)}
                      style={{ flex: 1 }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        Delete
                      </Text>
                    </Button>
                  </View>
                </CardContent>
              </TouchableOpacity>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 32 }}>
              No dry standards yet.
            </Text>
          }
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>
      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setModalVisible(false);
          setEditId(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "#f8fafc", paddingTop: top }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 20,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#e5e7eb",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: "#f1f5f9",
              }}
            >
              <XIcon size={24} color="#64748b" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                marginLeft: 16,
                color: "#1e293b",
              }}
            >
              {editId ? "Edit Dry Standard" : "Add Dry Standard"}
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Card style={{ marginBottom: 24, backgroundColor: "#fff" }}>
              <CardHeader style={{ paddingBottom: 8 }}>
                <CardTitle>Material</CardTitle>
              </CardHeader>
              <CardContent style={{ paddingTop: 0 }}>
                {form.materialId ? (
                  <Text
                    style={{
                      fontWeight: "600",
                      color: "#1e293b",
                      fontSize: 16,
                    }}
                  >
                    {selectedMaterial?.name}
                  </Text>
                ) : addNewMaterialMode ? (
                  <View style={{ marginBottom: 12 }}>
                    <Input
                      placeholder="Material Name"
                      value={newMaterialForm.name}
                      onChangeText={(v) =>
                        setNewMaterialForm((f) => ({ ...f, name: v }))
                      }
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      placeholder="Variance (%)"
                      value={newMaterialForm.variance}
                      onChangeText={(v) =>
                        setNewMaterialForm((f) => ({ ...f, variance: v }))
                      }
                      keyboardType="numeric"
                      style={{ marginBottom: 8 }}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        onPress={async () => {
                          if (
                            !newMaterialForm.name ||
                            !newMaterialForm.variance
                          )
                            return;
                          try {
                            const result =
                              await createMaterialMutation.mutateAsync({
                                name: newMaterialForm.name,
                                variance: parseFloat(newMaterialForm.variance),
                              });
                            setAddNewMaterialMode(false);
                            setNewMaterialForm({ name: "", variance: "" });
                            // Auto-select the new material
                            setForm((f) => ({ ...f, materialId: result.id }));
                          } catch (e) {
                            Alert.alert("Error", "Failed to add material");
                          }
                        }}
                        style={{ flex: 1 }}
                        disabled={createMaterialMutation.isPending}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          {createMaterialMutation.isPending
                            ? "Saving..."
                            : "Save"}
                        </Text>
                      </Button>
                      <Button
                        variant="outline"
                        onPress={() => setAddNewMaterialMode(false)}
                        style={{ flex: 1 }}
                        disabled={createMaterialMutation.isPending}
                      >
                        <Text style={{ fontWeight: "700" }}>Cancel</Text>
                      </Button>
                    </View>
                    {createMaterialMutation.isError && (
                      <Text style={{ color: "red", marginTop: 8 }}>
                        Failed to add material.
                      </Text>
                    )}
                  </View>
                ) : (
                  <MaterialSelector
                    materials={materials}
                    value={form.materialId}
                    onChange={(v) => setForm((f) => ({ ...f, materialId: v }))}
                    onAddNew={() => setAddNewMaterialMode(true)}
                    disabled={!!editId}
                  />
                )}
              </CardContent>
            </Card>

            {/* Only show the rest of the form if a material is selected */}
            {form.materialId && (
              <Card style={{ marginBottom: 24, backgroundColor: "#fff" }}>
                <CardHeader style={{ paddingBottom: 8 }}>
                  <CardTitle>Dry Standard Values</CardTitle>
                </CardHeader>
                <CardContent style={{ paddingTop: 0 }}>
                  <View
                    style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}
                  >
                    {/* Moisture Content Input */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          marginBottom: 4,
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Moisture Content (%)
                      </Text>
                      <Input
                        value={form.moistureContent}
                        onChangeText={(v) =>
                          setForm((f) => ({ ...f, moistureContent: v }))
                        }
                        keyboardType="numeric"
                        style={{ marginBottom: 0 }}
                      />
                    </View>
                    {/* Custom Variance Input */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          marginBottom: 4,
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Custom Variance (%)
                      </Text>
                      <Input
                        value={form.customVariance}
                        onChangeText={(v) =>
                          setForm((f) => ({ ...f, customVariance: v }))
                        }
                        keyboardType="numeric"
                        style={{ marginBottom: 0 }}
                      />
                    </View>
                  </View>
                  {/* Dry Goal Display */}
                  <View
                    style={{
                      padding: 16,
                      backgroundColor: "#f0f9ff",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#0ea5e9",
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#0c4a6e",
                        marginBottom: 4,
                      }}
                    >
                      Dry Goal (%)
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#0c4a6e",
                      }}
                    >
                      {isNaN(dryGoalValue) ? "-" : dryGoalValue.toFixed(2)}
                    </Text>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* Only show action buttons if a material is selected */}
            {form.materialId && (
              <>
                <Button
                  onPress={handleSubmit}
                  disabled={
                    createMutation.status === "pending" ||
                    updateProjectMaterialMutation.status === "pending"
                  }
                  style={{
                    width: "100%",
                    paddingVertical: 16,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                  >
                    {editId
                      ? updateProjectMaterialMutation.status === "pending"
                        ? "Saving..."
                        : "Edit"
                      : createMutation.status === "pending"
                        ? "Adding..."
                        : "Add"}
                  </Text>
                </Button>
                <Button
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={{ width: "100%", marginTop: 12, borderRadius: 12 }}
                >
                  <Text style={{ fontWeight: "700", fontSize: 16 }}>
                    Cancel
                  </Text>
                </Button>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
