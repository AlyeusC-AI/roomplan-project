import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { projectStore } from "@/lib/state/project";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Mail,
  Eye,
  Trash2,
  AlertTriangle,
  X,
  ChevronRight,
  Plus,
} from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner-native";
import { api } from "@/lib/api";
import { BlurView } from "expo-blur";

interface Document {
  id: number;
  name: string;
  url: string;
  json: string;
  publicId: string;
  created_at: string;
  type?: "cos" | "auth";
}

export default function ProjectDocumentsPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { project } = projectStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<"cos" | "auth" | null>(
    null
  );
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (project?.id) {
      fetchDocuments();
    }
  }, [project?.id]);

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/v1/organization/documents?projectId=${project?.id}`
      );
      console.log(
        "🚀 ~ fetchDocuments ~ response:",
        JSON.stringify(response.data, null, 2)
      );
      if (response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (documentId: string, type?: "cos" | "auth") => {
    router.push(`/certificate?id=${documentId}${type ? `&type=${type}` : ""}`);
  };

  const handleCreateDocument = async (type: "cos" | "auth") => {
    try {
      await api.post(
        `/api/v1/organization/documents?projectId=${project?.publicId}`,
        {
          name: type === "cos" ? "COS" : "Work Auth",
          projectId: project?.publicId,
          json: JSON.stringify({
            name: type === "cos" ? "COS" : "Work Auth",
            type: type,
          }),
        }
      );

      toast.success("Document created successfully");
      setShowCreateDialog(false);
      setSelectedDocType(null);
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to create document");
      console.error(error);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await api.delete("/api/v1/organization/documents", {
        data: { id: documentId },
      });
      setDocuments(documents.filter((doc) => doc.id !== documentId));
      toast.success("Document deleted successfully");
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete document");
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;

    setIsSendingEmail(true);
    try {
      await api.post("/api/v1/organization/documents/email", {
        documentId: selectedDocument.id,
        projectId: project?.id,
      });

      toast.success("Document sent successfully");
      setShowEmailDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error("Failed to send document");
      console.error(error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Documents</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Manage your project documents
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateDialog(true)}
            className="bg-blue-600 p-4 rounded-full shadow-lg"
            style={{
              shadowColor: "#2563eb",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Plus className="w-6 h-6 text-white" color="white" />
          </TouchableOpacity>
        </View>

        {documents.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-blue-50 p-8 rounded-full mb-6">
              <FileText className="w-12 h-12 text-blue-600" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No documents yet
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
              Start by creating your first document
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateDialog(true)}
              className="bg-blue-600 px-8 py-4 rounded-xl shadow-sm"
              style={{
                shadowColor: "#2563eb",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text className="text-white font-medium">Create Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4 gap-2">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="p-5 bg-white rounded-xl border-0 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-gray-900 truncate mb-2">
                      {doc.name}
                    </Text>
                    <View className="flex-row items-center">
                      {/* <View className="bg-blue-50 p-2 rounded-full mr-3">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </View> */}
                      <Text className="text-sm text-gray-500">
                        Added{" "}
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                        })}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center space-x-3 gap-2">
                    <TouchableOpacity
                      onPress={() => handleViewDocument(doc.publicId, doc.type)}
                      className="bg-blue-50 p-3 rounded-full"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDocument(doc);
                        setShowEmailDialog(true);
                      }}
                      className="bg-blue-50 p-3 rounded-full"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDocumentToDelete(doc);
                        setShowDeleteDialog(true);
                      }}
                      className="bg-red-50 p-3 rounded-full"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Document Dialog */}
      <Modal
        visible={showCreateDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateDialog(false)}
      >
        <BlurView intensity={50} className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Create Document
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateDialog(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </View>
            <View className="space-y-4 gap-4">
              <TouchableOpacity
                onPress={() => handleCreateDocument("cos")}
                className="bg-blue-50 p-5 rounded-xl border border-blue-100"
              >
                <Text className="text-base font-medium text-gray-900">
                  Certificate of Satisfaction
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Create a new COS document
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCreateDocument("auth")}
                className="bg-blue-50 p-5 rounded-xl border border-blue-100"
              >
                <Text className="text-base font-medium text-gray-900">
                  Work Authorization
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Create a new work authorization document
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <BlurView intensity={50} className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="bg-yellow-50 p-2 rounded-full mr-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  Delete Document
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDeleteDialog(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </View>
            <Text className="text-base text-gray-600 mb-8">
              Are you sure you want to delete the document "
              {documentToDelete?.name}"? This action cannot be undone.
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setShowDeleteDialog(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-gray-900">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  documentToDelete && handleDeleteDocument(documentToDelete.id)
                }
                className="flex-1 bg-red-600 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-white">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Email Dialog */}
      <Modal
        visible={showEmailDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailDialog(false)}
      >
        <BlurView intensity={50} className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Send Document
              </Text>
              <TouchableOpacity
                onPress={() => setShowEmailDialog(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </View>
            <Text className="text-base text-gray-600 mb-8">
              Are you sure you want to send the document "
              {selectedDocument?.name}"?
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setShowEmailDialog(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-gray-900">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendEmail}
                disabled={isSendingEmail}
                className={`flex-1 py-4 rounded-xl ${isSendingEmail ? "bg-gray-300" : "bg-blue-600"}`}
              >
                {isSendingEmail ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator
                      size="small"
                      color="white"
                      className="mr-2"
                    />
                    <Text className="text-center font-medium text-white">
                      Sending...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center font-medium text-white">
                    Send
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Animated.View>
  );
}
