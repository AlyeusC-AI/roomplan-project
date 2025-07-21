import React, { useState } from "react";
import {
  View,
  FlatList,
  Button,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetProjectMaterials,
  useGetMaterials,
  useCreateProjectMaterial,
  useDeleteProjectMaterial,
} from "@service-geek/api-client";

export default function DryStandardScreen() {
  const { projectId } = useLocalSearchParams();
  const router = useRouter();
  const {
    data: dryStandards,
    isLoading,
    isError,
  } = useGetProjectMaterials(projectId as string);
  const { data: materials } = useGetMaterials();
  const createMutation = useCreateProjectMaterial();
  const deleteMutation = useDeleteProjectMaterial();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    materialId: undefined as string | undefined,
    customVariance: "",
    initialMoisture: "",
    currentMoisture: "",
    dryGoal: "",
  });

  const handleAdd = () => {
    setForm({
      materialId: undefined,
      customVariance: "",
      initialMoisture: "",
      currentMoisture: "",
      dryGoal: "",
    });
    setModalVisible(true);
  };

  const handleSubmit = () => {
    if (!form.materialId) {
      Alert.alert("Please select a material");
      return;
    }
    createMutation.mutate(
      {
        projectId: projectId as string,
        materialId: form.materialId,
        customVariance: form.customVariance
          ? parseFloat(form.customVariance)
          : undefined,
        initialMoisture: form.initialMoisture
          ? parseFloat(form.initialMoisture)
          : undefined,
        currentMoisture: form.currentMoisture
          ? parseFloat(form.currentMoisture)
          : undefined,
        dryGoal: form.dryGoal ? parseFloat(form.dryGoal) : undefined,
      },
      {
        onSuccess: () => setModalVisible(false),
      }
    );
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

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (isError)
    return <Text style={{ color: "red" }}>Failed to load dry standards.</Text>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button title="Add Dry Standard" onPress={handleAdd} />
      <FlatList
        data={dryStandards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}
            onPress={() =>
              router.push(
                `dry-standard-detail?id=${item.id}&projectId=${projectId}`
              )
            }
          >
            <Text style={{ fontWeight: "bold" }}>{item.material.name}</Text>
            <Text>
              Variance: {item.customVariance ?? item.material.variance}%
            </Text>
            <Text>Initial Moisture: {item.initialMoisture ?? "-"}</Text>
            <Text>Current Moisture: {item.currentMoisture ?? "-"}</Text>
            <Text>Dry Goal: {item.dryGoal ?? "-"}</Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Button
                title="Delete"
                color="red"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            No dry standards yet.
          </Text>
        }
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
            Add Dry Standard
          </Text>
          <Text>Material</Text>
          <FlatList
            data={materials}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor:
                    form.materialId === item.id ? "#eee" : "#fff",
                }}
                onPress={() => setForm((f) => ({ ...f, materialId: item.id }))}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            horizontal
            style={{ marginVertical: 8 }}
          />
          <Text>Custom Variance (%)</Text>
          <Input
            value={form.customVariance}
            onChangeText={(v: string) =>
              setForm((f) => ({ ...f, customVariance: v }))
            }
            keyboardType="numeric"
          />
          <Text>Initial Moisture (%)</Text>
          <Input
            value={form.initialMoisture}
            onChangeText={(v: string) =>
              setForm((f) => ({ ...f, initialMoisture: v }))
            }
            keyboardType="numeric"
          />
          <Text>Current Moisture (%)</Text>
          <Input
            value={form.currentMoisture}
            onChangeText={(v: string) =>
              setForm((f) => ({ ...f, currentMoisture: v }))
            }
            keyboardType="numeric"
          />
          <Text>Dry Goal (%)</Text>
          <Input
            value={form.dryGoal}
            onChangeText={(v: string) => setForm((f) => ({ ...f, dryGoal: v }))}
            keyboardType="numeric"
          />
          <View style={{ flexDirection: "row", marginTop: 24 }}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <View style={{ width: 16 }} />
            <Button
              title="Add"
              onPress={handleSubmit}
              disabled={createMutation.status === 'pending'}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Simple Input component for demo (replace with your UI lib if needed)
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
