import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetProjectMaterial,
  useUpdateProjectMaterial,
  useDeleteProjectMaterial,
  useGetMaterials,
} from "@service-geek/api-client";

export default function DryStandardDetailScreen() {
  const { id, projectId } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: projectMaterial,
    isLoading,
    isError,
  } = useGetProjectMaterial(id as string);
  const { data: materials } = useGetMaterials();
  const updateMutation = useUpdateProjectMaterial();
  const deleteMutation = useDeleteProjectMaterial();

  const [form, setForm] = useState({
    materialId: "",
    customVariance: "",
    moistureContent: "",
    dryGoal: "",
  });

  useEffect(() => {
    if (projectMaterial) {
      setForm({
        materialId: projectMaterial.materialId,
        customVariance: projectMaterial.customVariance?.toString() ?? "",
        moistureContent: projectMaterial.moistureContent?.toString() ?? "",
        dryGoal: projectMaterial.dryGoal?.toString() ?? "",
      });
    }
  }, [projectMaterial]);

  const selectedMaterial =
    materials?.find((m) => m.id === form.materialId) ||
    projectMaterial?.material;
  const effectiveVariance =
    form.customVariance !== ""
      ? parseFloat(form.customVariance)
      : (selectedMaterial?.variance ?? 0);
  const moistureNum =
    form.moistureContent !== "" ? parseFloat(form.moistureContent) : 0;
  const dryGoalValue = moistureNum * (1 + effectiveVariance / 100);

  const handleUpdate = () => {
    updateMutation.mutate(
      {
        id: id as string,
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
        onSuccess: () => Alert.alert("Updated", "Dry standard updated!"),
      }
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this dry standard?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(id as string, {
              onSuccess: () =>
                router.replace(`/projects/${projectId}/(tabs)/dry-standard`),
            });
          },
        },
      ]
    );
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (isError || !projectMaterial)
    return <Text style={{ color: "red" }}>Failed to load dry standard.</Text>;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
        Dry Standard Details
      </Text>
      <Text>Material: {projectMaterial.material.name}</Text>
      <Text>Moisture Content (%)</Text>
      <Input
        value={form.moistureContent}
        onChangeText={(v) => setForm((f) => ({ ...f, moistureContent: v }))}
        keyboardType="numeric"
      />
      <Text>Custom Variance (%)</Text>
      <Input
        value={form.customVariance}
        onChangeText={(v) => setForm((f) => ({ ...f, customVariance: v }))}
        keyboardType="numeric"
      />
      <Text>Dry Goal (%)</Text>
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
      <View style={{ flexDirection: "row", marginTop: 24 }}>
        <Button
          title="Update"
          onPress={handleUpdate}
          disabled={updateMutation.status === "pending"}
        />
        <View style={{ width: 16 }} />
        <Button
          title="Delete"
          color="red"
          onPress={handleDelete}
          disabled={deleteMutation.status === "pending"}
        />
      </View>
      {/* Show dry standard if available */}
    </ScrollView>
  );
}

type InputProps = {
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
};
function Input({ value, onChangeText, keyboardType = "default" }: InputProps) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        marginVertical: 4,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{ minHeight: 32, padding: 8 }}
      />
    </View>
  );
}
