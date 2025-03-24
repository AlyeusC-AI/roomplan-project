import React from 'react';
import { View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClipboardList, FileText, ArrowRight, Edit2, Plus, CheckCircle2, AlertCircle } from "lucide-react-native";
import { toast } from "sonner-native";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFormsStore } from "@/lib/state/forms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const { width } = Dimensions.get('window');

export default function FormsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const { getForms, formsList: forms, responseCounts, loading } = useFormsStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const fetchForms = async (showLoading = true) => {
    await getForms(projectId as string);
    setIsRefreshing(false);
  };

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchForms(false);
  }, [projectId]);

  React.useEffect(() => {
    fetchForms();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  }, [projectId]);

  const handleFormPress = (formId: string, responseId?: string) => {
    const path = `/projects/${projectId}/forms/${formId}/fill`;
    if (responseId) {
      router.push(`${path}?responseId=${responseId}`);
    } else {
      router.push(path);
    }
  };

  const getFormStatusColor = (responseCount: number) => {
    return responseCount > 0 ? 'bg-green-100' : 'bg-orange-100';
  };

  const getFormStatusText = (responseCount: number) => {
    return responseCount > 0 ? 'text-green-700' : 'text-orange-700';
  };

  const getFormStatusIcon = (responseCount: number) => {
    return responseCount > 0 
      ? <Text><CheckCircle2 className="h-5 w-5 text-green-600" /></Text> 
      : <Text><AlertCircle className="h-5 w-5 text-orange-600" /></Text>;
  };

  if (loading && !isRefreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (forms?.length === 0) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 items-center justify-center p-4">
          <View className="bg-primary/10 p-8 rounded-full">
            <Text><ClipboardList className="h-20 w-20 text-primary" /></Text>
          </View>
          <Text className="mt-8 text-3xl font-bold text-center">No forms found</Text>
          <Text className="mt-3 text-lg text-muted-foreground text-center max-w-[80%]">
            Create your first form to start collecting responses
          </Text>
          {/* <Button 
            className="mt-6 bg-primary px-6 py-3 rounded-full"
            onPress={() => router.push(`/projects/${projectId}/forms/new`)}
          >
            <Text><Plus className="h-5 w-5 mr-2" /></Text>
            <Text>Create Form</Text>
          </Button> */}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
        className="px-4 py-6"
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Forms</Text>
          {/* <Button 
            className="bg-primary px-4 py-2 rounded-full"
            onPress={() => router.push(`/projects/${projectId}/forms/new`)}
          >
          <Plus className="h-4 w-4 mr-2" />
           <Text>New Form</Text>   
          </Button> */}
        </View>
        
        {forms?.map((form, index) => (
          <Animated.View 
            key={form.id}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: 12
            }}
          >
            <Card className={`overflow-hidden border-0 shadow-sm ${getFormStatusColor(responseCounts[form.id] || 0)}`}>
              <TouchableOpacity
                onPress={() => handleFormPress(form.id)}
                className="p-5"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-3">
                      <Text className="text-xl font-semibold">{form.name}</Text>
                      <View className={`flex-row items-center space-x-2 px-3 py-1 gap-4 rounded-full ${getFormStatusColor(responseCounts[form.id] || 0)}`}>
                        {getFormStatusIcon(responseCounts[form.id] || 0)}
                        <Text className={`font-medium ${getFormStatusText(responseCounts[form.id] || 0)}`}>
                          {responseCounts[form.id] > 0 
                            ? `${responseCounts[form.id]} responses` 
                            : 'No responses yet'}
                        </Text>
                      </View>
                    </View>
                    {form.description && (
                      <Text className="mt-2 text-base text-muted-foreground">
                        {form.description}
                      </Text>
                    )}
                    {responseCounts[form.id] === 0 && (
                      <Text className="mt-2 text-sm text-orange-600 font-medium">
                        Be the first to fill out this form!
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                      onPress={() => router.push(`/projects/${projectId}/forms/${form.id}/responses`)}
                      className="p-2 hover:bg-muted rounded-full"
                    >
                      <Text><FileText size={20} className="text-muted-foreground" /></Text>
                    </TouchableOpacity>
                    <Text><ArrowRight className="h-6 w-6 text-muted-foreground" /></Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
} 