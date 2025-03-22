import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Download, Eye, FileText, Pencil, Trash2 } from "lucide-react-native";
import { userStore } from "@/lib/state/user";
import { toast } from "sonner-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFormsStore } from "@/lib/state/forms";
import { api } from "@/lib/api";

interface FormResponse {
  id: number;
  created_at: string;
  date: string;
  formId: number;
  projectId: number;
  form: any;
  fields: {
    id: number;
    field: any;
    value: string;
    created_at: string;
    formFieldId: number;
    formResponseId: number;
  }[];
}

export default function ResponsesListScreen() {
  const router = useRouter();
  const { projectId, formId } = useLocalSearchParams();
  const user = userStore();
  const { responses, getForms } = useFormsStore();
  const [loading, setLoading] = useState(true);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      // Fetch forms which includes responses data
      await getForms(projectId as string);
      
      // Filter responses for the current form
      const currentFormResponses = responses.filter(
        response => response.formId === Number(formId)
      );
      
      setFormResponses(currentFormResponses);
    } catch (error) {
      console.error('Error fetching responses:', error);
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (responseId: number) => {
    try {
      const response = await api.get(
        `/api/v1/projects/${projectId}/forms/${formId}/responses/${responseId}/pdf`,
        {
          responseType: 'blob'
        }
      );

      const base64 = await FileSystem.readAsStringAsync(response.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileUri = `${FileSystem.documentDirectory}response-${responseId}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleEditResponse = (responseId: number) => {
    router.push(`/projects/${projectId}/forms/${formId}/fill?responseId=${responseId}`);
  };

  const handleDeleteResponse = async (responseId: number) => {
    Alert.alert(
      "Delete Response",
      "Are you sure you want to delete this response?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(
                `/api/v1/projects/${projectId}/forms/${formId}/responses/${responseId}`
              );

              // Update local state and store
              setFormResponses(prev => prev.filter(r => r.id !== responseId));
              toast.success('Response deleted successfully');
            } catch (error) {
              console.error('Error deleting response:', error);
              toast.error('Failed to delete response');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading responses...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mr-3"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1">Form Responses</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {formResponses.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground">No responses yet</Text>
          </View>
        ) : (
          formResponses.map((response) => (
            <Card key={response.id} className="mb-4 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold">
                    Response #{response.id}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Submitted on {new Date(response.date).toLocaleString()}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {response.fields.length} fields completed
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => handleDownloadPDF(response.id)}
                    className="p-2"
                  >
                    <Download size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push(`/projects/${projectId}/forms/${formId}/responses/${response.id}`)}
                    className="p-2"
                  >
                    <Eye size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditResponse(response.id)}
                    className="p-2"
                  >
                    <Pencil size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteResponse(response.id)}
                    className="p-2"
                  >
                    <Trash2 size={20} className="text-destructive" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
} 