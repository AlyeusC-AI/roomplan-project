import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  Animated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { projectStore } from '@/lib/state/project';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { FileText, Mail, Eye, Trash2, AlertTriangle, X, ChevronRight } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner-native';
import { api } from '@/lib/api';
import { BlurView } from 'expo-blur';

interface Document {
  id: number;
  name: string;
  url: string;
  json: string;
  publicId: string;
  created_at: string;
}

export default function ProjectDocumentsPage() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { project } = projectStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchDocuments();
    fetchAllDocuments();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [project?.id]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/api/v1/organization/documents?projectId=${project?.id}`);
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await api.get('/api/v1/organization/documents');
      setAllDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch all documents');
      console.error(error);
    }
  };

  const handleViewDocument = (documentId: string) => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_BASE_URL}/documents/${documentId}?projectId=${project?.publicId}`);
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await api.delete('/api/v1/organization/documents', {
        data: { id: documentId }
      });
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setAllDocuments(allDocuments.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedDocument) return;

    setIsSendingEmail(true);
    try {
      await api.post('/api/v1/organization/documents/email', {
        documentId: selectedDocument.id,
        projectId: project?.id,
      });

      toast.success('Document sent successfully');
      setShowEmailDialog(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error('Failed to send document');
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
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className="flex-1 bg-background"
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {documents.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-primary/10 p-6 rounded-full mb-4">
              <FileText className="w-12 h-12 text-primary" />
            </View>
            <Text className="text-lg font-semibold text-foreground mb-2">No documents yet</Text>
            <Text className="text-sm text-muted-foreground text-center">
              Documents will appear here when added to the project
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className="p-4 border-0 shadow-sm bg-white"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-foreground truncate mb-1">
                      {doc.name}
                    </Text>
                    <View className="flex-row items-center">
                      <View className="bg-primary/10 p-1.5 rounded-full mr-2">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </View>
                      <Text className="text-sm text-muted-foreground">
                        Added {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                      onPress={() => handleViewDocument(doc.publicId)}
                      className="bg-primary/10 p-2.5 rounded-full"
                    >
                      <Eye className="w-5 h-5 text-primary" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setDocumentToDelete(doc);
                        setShowDeleteDialog(true);
                      }}
                      className="bg-red-500/10 p-2.5 rounded-full"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={showDeleteDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteDialog(false)}
      >
        <BlurView intensity={50} className="flex-1 justify-end">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="bg-yellow-500/10 p-2 rounded-full mr-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </View>
                <Text className="text-xl font-bold text-foreground">Delete Document</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowDeleteDialog(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </View>
            <Text className="text-base text-muted-foreground mb-8">
              Are you sure you want to delete the document "{documentToDelete?.name}"? This action cannot be undone.
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => setShowDeleteDialog(false)}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => documentToDelete && handleDeleteDocument(documentToDelete.id)}
                className="flex-1 bg-red-500 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-white">Delete</Text>
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
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-foreground">Send Document</Text>
              <TouchableOpacity 
                onPress={() => setShowEmailDialog(false)}
                className="bg-gray-100 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </TouchableOpacity>
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-muted-foreground mb-4">Select Document</Text>
              <ScrollView className="max-h-60">
                {allDocuments.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() => setSelectedDocument(doc)}
                    className={`p-4 rounded-xl mb-3 ${
                      selectedDocument?.id === doc.id ? 'bg-primary/10 border border-primary' : 'bg-gray-100'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text className="text-base font-medium text-foreground">{doc.name}</Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                          Added {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </Text>
                      </View>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => {
                  setShowEmailDialog(false);
                  setSelectedDocument(null);
                }}
                className="flex-1 bg-gray-100 py-4 rounded-xl"
              >
                <Text className="text-center font-medium text-foreground">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendEmail}
                disabled={!selectedDocument || isSendingEmail}
                className={`flex-1 py-4 rounded-xl ${
                  !selectedDocument || isSendingEmail ? 'bg-gray-300' : 'bg-primary'
                }`}
              >
                {isSendingEmail ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" className="mr-2" />
                    <Text className="text-center font-medium text-white">Sending...</Text>
                  </View>
                ) : (
                  <Text className="text-center font-medium text-white">Send</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Send Email Button */}
      <TouchableOpacity
        onPress={() => setShowEmailDialog(true)}
        className="absolute bottom-6 right-6 bg-primary p-5 rounded-full shadow-lg"
        style={{
          shadowColor: '#1e88e5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Mail className="w-6 h-6 text-white" color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
} 