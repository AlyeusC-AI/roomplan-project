import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ClipboardList,
  FileText,
  ArrowRight,
  Edit2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react-native";
import { toast } from "sonner-native";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormConnectionModal } from "./components/FormConnectionModal";
import {
  useCreateFormResponse,
  useGetForms,
  useGetFormsByProject,
  useGetProjectFormResponses,
} from "@service-geek/api-client";

const { width } = Dimensions.get("window");

export default function FormsScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const {
    data: forms,
    isLoading,
    refetch,
    isRefetching,
  } = useGetFormsByProject(projectId as string);
  const [isConnectionModalOpen, setIsConnectionModalOpen] =
    React.useState(false);

  const { data: responses, isLoading: isResponsesLoading } =
    useGetProjectFormResponses(projectId as string);
  const [responseCount, setResponseCount] = useState<{ [key: string]: number }>(
    {}
  );
  const { mutate: submitForm, isPending: isSubmitting } =
    useCreateFormResponse();

  useEffect(() => {
    if (forms && responses) {
      const responseCount = responses.reduce(
        (acc: { [key: string]: number }, response: any) => {
          acc[response.formId] = (acc[response.formId] || 0) + 1;
          return acc;
        },
        {}
      );
      setResponseCount(responseCount);
    }
  }, [forms, responses]);

  const handleFormPress = (formId: string, responseId?: string) => {
    const path = `/projects/${projectId}/forms/${formId}/fill`;
    if (responseId) {
      router.push(`${path}?responseId=${responseId}`);
    } else {
      router.push(path);
    }
  };

  const getFormStatusColor = (responseCount: number) => {
    return responseCount > 0 ? "bg-green-100" : "bg-orange-100";
  };

  const getFormStatusText = (responseCount: number) => {
    return responseCount > 0 ? "text-green-700" : "text-orange-700";
  };

  const getFormStatusIcon = (responseCount: number) => {
    return responseCount > 0 ? (
      <Text>
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      </Text>
    ) : (
      <Text>
        <AlertCircle className="h-5 w-5 text-orange-600" />
      </Text>
    );
  };

  if (isLoading && !isRefetching) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      {forms?.length == 0 ? (
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <View className="flex-1 items-center justify-center p-4">
            <View className="bg-primary/10 p-8 rounded-full">
              <Text>
                <ClipboardList className="h-20 w-20 text-primary" />
              </Text>
            </View>
            <Text className="mt-8 text-3xl font-bold text-center">
              No forms found
            </Text>
            <Text className="mt-3 text-lg text-muted-foreground text-center max-w-[80%]">
              Create your first form or connect existing forms to start
              collecting responses
            </Text>
            <Button
              className="mt-6 bg-primary px-6 py-3 rounded-full flex-row items-center gap-2"
              onPress={() => setIsConnectionModalOpen(true)}
            >
              <Text>
                <LinkIcon className="h-5 w-5" color="white" />
              </Text>
              <Text>Connect Forms</Text>
            </Button>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1 bg-background"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          <View className="px-4 py-8">
            <View className="flex-row justify-between items-start mb-10">
              <View className="flex-row items-center gap-3 flex-1 mr-4">
                <View className="bg-primary/10 p-2.5 rounded-xl">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-foreground">
                    Forms
                  </Text>
                  {/* <Text className="text-sm text-muted-foreground mt-1">Manage your project forms</Text> */}
                </View>
              </View>
              <Button
                className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm"
                onPress={() => setIsConnectionModalOpen(true)}
                variant="outline"
              >
                <LinkIcon className="h-3.5 w-3.5 " />
                <Text className="font-medium  text-sm">Connect Forms</Text>
              </Button>
            </View>

            {forms?.map((form, index) => (
              <View key={form.id}>
                <Card
                  className={`overflow-hidden border-0 mb-2 shadow-sm ${getFormStatusColor(
                    responseCount[form.id] || 0
                  )}`}
                >
                  <TouchableOpacity
                    onPress={() => handleFormPress(form.id)}
                    className="p-5"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-col items-start  ">
                          <Text className="text-xl font-semibold">
                            {form.name}
                          </Text>
                          <View
                            className={`flex-row items-center  py-1 gap-4 rounded-full ${getFormStatusColor(
                              responseCount[form.id] || 0
                            )}`}
                          >
                            {getFormStatusIcon(responseCount[form.id] || 0)}
                            <Text
                              className={`font-medium ${getFormStatusText(
                                responseCount[form.id] || 0
                              )}`}
                            >
                              {responseCount[form.id] > 0
                                ? `${responseCount[form.id]} responses`
                                : "No responses yet"}
                            </Text>
                          </View>
                        </View>
                        {form.description && (
                          <Text className="mt-2 text-base text-muted-foreground">
                            {form.description}
                          </Text>
                        )}
                        {responseCount[form.id] === 0 && (
                          <Text className="mt-2 text-sm text-orange-600 font-medium">
                            Be the first to fill out this form!
                          </Text>
                        )}
                      </View>
                      <View className="flex-row items-center space-x-3 gap-4">
                        <TouchableOpacity
                          onPress={() =>
                            router.push(
                              `/projects/${projectId}/forms/${form.id}/responses`
                            )
                          }
                          className="p-2 hover:bg-muted rounded-full"
                        >
                          <Text>
                            <FileText
                              size={20}
                              className="text-muted-foreground"
                            />
                          </Text>
                        </TouchableOpacity>
                        <Text>
                          <ArrowRight className="h-6 w-6 text-muted-foreground" />
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <FormConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        projectId={projectId as string}
      />
    </>
  );
}
