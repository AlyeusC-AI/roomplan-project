import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Pencil,
  Trash2,
  Printer,
  Maximize2,
  X,
} from "lucide-react-native";
import { userStore } from "@/lib/state/user";
import { toast } from "sonner-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import * as Linking from "expo-linking";
import {
  FormResponse,
  FormResponseField,
  useGenerateFormResponsesPdf,
  useGetProjectFormResponses,
} from "@service-geek/api-client";

const ResponseViewer = ({
  response,
  onClose,
  onEdit,
  onGeneratePDF,
  index,
}: {
  response: FormResponse;
  onClose: () => void;
  onEdit: () => void;
  onGeneratePDF: () => void;
  index: number;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderValue = (field: FormResponseField) => {
    try {
      const type = field.field.type.toLowerCase();
      const value = field.value;

      // Handle empty values
      if (!value) {
        return (
          <Text className="text-muted-foreground text-sm italic">
            No response provided
          </Text>
        );
      }

      // Handle images and signatures
      if (
        type === "image" ||
        type === "signature" ||
        value.startsWith("data:image")
      ) {
        try {
          let imageUrl = value;
          if (!value.startsWith("data:image")) {
            const data = JSON.parse(value);
            imageUrl = data.url || value;
            if (Array.isArray(data)) {
              return (
                <View className="flex-row flex-wrap gap-4 pt-2">
                  {data.map(({ url }, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedImage(url)}
                      className="relative w-[150px] h-[150px]"
                    >
                      <Image
                        source={{ uri: url }}
                        className="w-full h-full rounded-lg"
                        resizeMode="cover"
                      />
                      <View className="absolute inset-0 bg-black/50 opacity-0 justify-center items-center">
                        <Maximize2 size={24} color="white" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              );
            }
          }
          return (
            <Pressable
              onPress={() => setSelectedImage(imageUrl)}
              className="relative w-[200px] h-[200px] mt-2"
            >
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/50 opacity-0 justify-center items-center">
                <Maximize2 size={24} color="white" />
              </View>
            </Pressable>
          );
        } catch {
          return (
            <Text className="text-muted-foreground text-sm italic">
              Invalid image data
            </Text>
          );
        }
      }

      // Handle files
      if (type === "file" || value.startsWith("http")) {
        try {
          let fileUrl = value;
          let fileName = "Download File";
          if (!value.startsWith("http")) {
            const data = JSON.parse(value);
            fileUrl = data.url;
            fileName = data.name || fileName;
          }
          return (
            <TouchableOpacity
              onPress={() => Linking.openURL(fileUrl)}
              className="flex-row items-center gap-2"
            >
              <FileText size={16} className="text-primary" />
              <Text className="text-primary text-sm">{fileName}</Text>
            </TouchableOpacity>
          );
        } catch {
          return (
            <Text className="text-muted-foreground text-sm italic">
              Invalid file data
            </Text>
          );
        }
      }

      // Handle arrays (lists, checkboxes)
      try {
        const items = JSON.parse(value);
        if (Array.isArray(items)) {
          return (
            <View className="space-y-1">
              {items.map((item, index) => (
                <View key={index} className="flex-row items-center gap-2">
                  <Text className="text-muted-foreground">•</Text>
                  <Text className="text-sm">{item}</Text>
                </View>
              ))}
            </View>
          );
        }
      } catch {}

      // Default text display
      return <Text className="text-sm">{value}</Text>;
    } catch (error) {
      return (
        <Text className="text-destructive text-sm italic">
          Error displaying value
        </Text>
      );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <TouchableOpacity onPress={onClose} className="mr-3">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1">Response #{index + 1}</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity onPress={onGeneratePDF} className="p-2">
            <Printer size={20} className="text-foreground" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} className="p-2">
            <Pencil size={20} className="text-foreground" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="space-y-6">
          <View>
            <Text className="text-base font-semibold mb-2">
              {response.form.name}
            </Text>
            <Text className="text-sm text-muted-foreground">
              Submitted on{" "}
              {format(new Date(response.createdAt), "MMMM d, yyyy")} at{" "}
              {format(new Date(response.createdAt), "h:mm a")}
            </Text>
          </View>

          <Separator />

          <View className="space-y-4">
            {response.formResponseFields.map((field) => (
              <View key={field.id} className="space-y-2">
                <View className="flex-row items-center gap-2">
                  <Text className="font-medium text-sm">
                    {field.field.name}
                  </Text>
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal capitalize"
                  >
                    {field.field.type}
                  </Badge>
                </View>
                <View className="text-foreground">{renderValue(field)}</View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-center items-center"
          onPress={() => setSelectedImage(null)}
        >
          <View className="relative w-full h-full justify-center items-center">
            <Image
              source={{ uri: selectedImage || "" }}
              className="w-full h-full"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 p-2 rounded-full"
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default function ResponsesListScreen() {
  const router = useRouter();
  const { projectId, formId } = useLocalSearchParams();
  const user = userStore();
  const {
    data: formResponses,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useGetProjectFormResponses(projectId as string);
  const { mutateAsync: generateFormResponsesPdf } = useGenerateFormResponsesPdf(
    projectId as string
  );
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(
    null
  );

  const handleDownloadPDF = async (responseId: string) => {
    try {
      const response = await generateFormResponsesPdf([responseId]);

      const base64 = await FileSystem.readAsStringAsync(response.toString(), {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileUri = `${FileSystem.documentDirectory}response-${responseId}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleEditResponse = (responseId: string) => {
    router.push(
      `/projects/${projectId}/forms/${formId}/fill?responseId=${responseId}`
    );
  };

  const handleDeleteResponse = async (responseId: string) => {
    Alert.alert(
      "Delete Response",
      "Are you sure you want to delete this response?",
      [
        {
          text: "Cancel",
          style: "cancel",
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
              // setFormResponses((prev) =>
              //   prev.filter((r) => r.id !== responseId)
              // );
              toast.success("Response deleted successfully");
            } catch (error) {
              console.error("Error deleting response:", error);
              toast.error("Failed to delete response");
            }
          },
        },
      ]
    );
  };

  const handleGeneratePDF = async (
    responses: FormResponse[],
    title: string
  ) => {
    try {
      const response = await generateFormResponsesPdf(
        responses.map((r) => r.id)
      );

      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64Content = base64String.split(",")[1];
          resolve(base64Content);
        };
        reader.onerror = reject;
        reader.readAsDataURL(response);
      });

      const fileUri = `${FileSystem.documentDirectory}form-responses-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      await FileSystem.writeAsStringAsync(fileUri, base64 as string, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-muted-foreground">Loading responses...</Text>
      </View>
    );
  }

  if (selectedResponse) {
    return (
      <ResponseViewer
        response={selectedResponse}
        index={
          formResponses?.findIndex((r) => r.id === selectedResponse.id) || 0
        }
        onClose={() => setSelectedResponse(null)}
        onEdit={() => {
          setSelectedResponse(null);
          handleEditResponse(selectedResponse.id);
        }}
        onGeneratePDF={() =>
          handleGeneratePDF(
            [selectedResponse],
            `${selectedResponse.form.name} - Response #${selectedResponse.id}`
          )
        }
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center p-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} className="text-foreground" />
        </TouchableOpacity>
        <Text className="text-xl font-bold flex-1">Form Responses</Text>
        {formResponses && formResponses.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              handleGeneratePDF(formResponses || [], "Form Responses")
            }
            className="p-2"
          >
            <Printer size={24} className="text-foreground" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 p-4">
        {formResponses?.length === 0 ? (
          <View className="py-8 items-center">
            <Text className="text-muted-foreground">No responses yet</Text>
          </View>
        ) : (
          formResponses?.map((response, i) => (
            <Card key={response.id} className="mb-4 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold">
                    Response #{i + 1}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Submitted on {new Date(response.createdAt).toLocaleString()}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {response.formResponseFields.length} fields completed
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setSelectedResponse(response)}
                    className="p-2"
                  >
                    <Eye size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleGeneratePDF(
                        [response],
                        `${response.form.name} - Response #${i + 1}`
                      )
                    }
                    className="p-2"
                  >
                    <Printer size={20} className="text-muted-foreground" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleEditResponse(response.id)}
                    className="p-2"
                  >
                    <Pencil size={20} className="text-muted-foreground" />
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
