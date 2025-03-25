import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  SafeAreaView,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Unlink, Search, X, ChevronRight } from "lucide-react-native";
import { connectFormToProject, disconnectFormFromProject, getFormConnections } from "../utils/formConnection";
import { BlurView } from "expo-blur";
import { api } from "@/lib/api";

interface Form {
  id: number;
  name: string;
  desc?: string;
}

interface FormConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: () => void;
  projectId: string;
}

export function FormConnectionModal({
  isOpen,
  onClose,
  onConnectionChange,
  projectId,
}: FormConnectionModalProps) {
  const [forms, setForms] = useState<Form[]>([]);
  const [connections, setConnections] = useState<{ formId: number; projectId: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnecting, setIsConnecting] = useState<{ [key: number]: boolean }>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      fetchForms();
      fetchConnections();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const fetchForms = async () => {
    try {
      const response = await api.get("/api/v1/organization/forms");
      console.log("🚀 ~ fetchForms ~ response:", JSON.stringify(response, null, 2))
      if (response.status !== 200) throw new Error("Failed to fetch forms");
      const data = response.data;
      setForms(data);
    } catch (error) {
        
      console.error("Error fetching forms:", error);
    }
  };

  const fetchConnections = async () => {
    try {
      const connections = await getFormConnections(projectId);
      setConnections(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleConnection = async (form: Form) => {
    if (!form.id) return;

    setIsConnecting(prev => ({ ...prev, [form.id!]: true }));
    try {
      const isConnected = connections.some(c => c.formId === form.id);

      if (isConnected) {
        await disconnectFormFromProject({ formId: form.id, projectId });
      } else {
        await connectFormToProject({ formId: form.id, projectId });
      }

      await fetchConnections();
      onConnectionChange();
    } catch (error) {
      console.error("Error toggling connection:", error);
    } finally {
      setIsConnecting(prev => ({ ...prev, [form.id!]: false }));
    }
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (form.desc?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <Animated.View 
          style={{ 
            flex: 1,
            opacity: fadeAnim,
          }}
          className="bg-background/95"
        >
          <View className="flex-1">
            <View className="flex-row items-center justify-between p-4 border-b border-border/50">
              <View className="flex-row items-center space-x-3">
                <View className="bg-primary/10 p-2 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </View>
                <Text className="text-xl font-bold">Connect Forms</Text>
              </View>
              <TouchableOpacity 
                onPress={onClose}
                className="p-2 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <View className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <TextInput
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="pl-12 pr-4 py-3 bg-muted/50 border border-border/50 rounded-xl text-base"
                />
              </View>

              <ScrollView className="flex-1">
                {isLoading ? (
                  <View className="flex items-center justify-center h-64">
                    <ActivityIndicator size="large" color="#0000ff" />
                  </View>
                ) : filteredForms.length === 0 ? (
                  <View className="flex items-center justify-center h-64">
                    <View className="bg-muted/50 p-6 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </View>
                    <Text className="text-muted-foreground text-lg">No forms found</Text>
                    <Text className="text-muted-foreground/80 text-sm mt-2">Try adjusting your search</Text>
                  </View>
                ) : (
                  <View className="space-y-3">
                    {filteredForms.map((form) => {
                      const isConnected = connections.some(c => c.formId === form.id);
                      const isProcessing = isConnecting[form.id!];

                      return (
                        <Card
                          key={form.id}
                          className={`p-4 flex-row items-center justify-between ${
                            isConnected ? "border-primary/50 bg-primary/5" : "border-border/50"
                          }`}
                        >
                          <View className="flex-1 mr-4">
                            <View className="flex-row items-center space-x-3">
                              <View className={`p-2 rounded-lg ${
                                isConnected ? "bg-primary/10" : "bg-muted/50"
                              }`}>
                                <FileText className={`h-5 w-5 ${
                                  isConnected ? "text-primary" : "text-muted-foreground"
                                }`} />
                              </View>
                              <View className="flex-1">
                                <Text className="font-medium text-base mb-1">{form.name}</Text>
                                {form.desc && (
                                  <Text className="text-sm text-muted-foreground line-clamp-1">
                                    {form.desc}
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleToggleConnection(form)}
                            disabled={isProcessing}
                            className={`flex-row items-center space-x-2 px-4 py-2 rounded-full ${
                              isConnected 
                                ? "bg-primary/10" 
                                : "bg-muted/50"
                            }`}
                          >
                            {isProcessing ? (
                              <ActivityIndicator size="small" color="#0000ff" />
                            ) : (
                              <>
                                {isConnected ? (
                                  <Unlink className="h-4 w-4 text-primary" />
                                ) : (
                                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                )}
                                <Text className={`font-medium ${
                                  isConnected ? "text-primary" : "text-muted-foreground"
                                }`}>
                                  {isConnected ? "Connected" : "Connect"}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </Card>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
} 