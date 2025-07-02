import {
  ScrollView,
  TouchableOpacity,
  View,
  Animated,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

import AssigneeSelect from "@/components/project/assignee";
import ProjectTags from "@/components/project/ProjectTags";
import {
  ArrowRight,
  Book,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Cog,
  Grid2X2,
  List,
  LucideIcon,
  Mail,
  Map,
  MapPin,
  Phone,
  PlayCircle,
  StickyNote,
  Video,
  X,
  AlertTriangle,
  FileText,
  Scissors,
  Ruler,
  File,
  MessageSquare,
  MessageCircle,
  Files,
  Calendar,
  Edit2,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { uiPreferencesStore } from "@/lib/state/ui-preferences";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner-native";
import { api } from "@/lib/api";
import {
  Project,
  useGetOrganizationMembers,
  useGetProjectById,
  useGetProjectMembers,
} from "@service-geek/api-client";
import { Button } from "@/components/ui/button";
import ImageTagsModal from "@/components/pictures/ImageTagsModal";

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const { data: project, refetch } = useGetProjectById(projectId);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const { projectViewMode, setProjectViewMode } = uiPreferencesStore();
  // Add state to control client info modal visibility
  const [showClientInfo, setShowClientInfo] = useState(false);

  // Animation refs for button press effects
  const arrivalScale = useRef(new Animated.Value(1)).current;
  const startScale = useRef(new Animated.Value(1)).current;
  const completeScale = useRef(new Animated.Value(1)).current;
  const directionsScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const openInMaps = () => {
    animateButton(directionsScale);
    setTimeout(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${project?.data.location}`
      );
    }, 200);
  };

  const copyText = async (str?: string) => {
    if (!str) return;
    try {
      await Clipboard.setStringAsync(str);
      toast.success("Copied to clipboard!");
    } catch {
      console.error("could not copy");
    }
  };

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigationItems = [
    // {
    //   path: "./details",
    //   params: { activeTab: "insurance" },
    //   Icon: Cog,
    //   title: "Insurance Adjuster",
    //   description: "Manage insurance details",
    // },
    {
      path: "./documents",
      Icon: File,
      title: "Files",
      description: "Manage project files",
    },
    {
      path: "./scope",
      Icon: Ruler,
      title: "Scope of Work",
      description: "Manage scope of work",
    },
    {
      path: "./forms",
      Icon: FileText,
      title: "Forms",
      description: "Manage project forms",
    },

    {
      path: "./lidar/rooms",
      Icon: Video,
      title: "Lidar Scan",
      description: "View 3D scans",
    },

    // {
    //   path: "./pictures",
    //   Icon: Camera,
    //   title: "Photos",
    //   description: "Project documentation",
    // },
    // {
    //   path: "./readings",
    //   Icon: Book,
    //   title: "Readings",
    //   description: "View measurements",
    // },
    // {
    //   path: "./notes",
    //   Icon: StickyNote,
    //   title: "Notes",
    //   description: "Project notes",
    // },
    {
      Icon: Files,
      title: "Report",
      description: "Generate project report",
      onPress: () =>
        Linking.openURL(
          `${process.env.EXPO_PUBLIC_BASE_URL}/projects/${projectId}/report`
        ),
    },
    {
      path: "./chat",
      Icon: MessageCircle,
      title: "Chat",
      description: "Project conversation",
    },
  ];

  const handleArrivalPress = () => {
    animateButton(arrivalScale);
    setTimeout(() => {
      // Navigate to arrival notification screen
      router.push({
        pathname: "/notifications/arrival",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  const handleStartPress = () => {
    animateButton(startScale);
    setTimeout(() => {
      // Navigate to start work notification screen
      router.push({
        pathname: "/notifications/start-work",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  const handleCompletePress = () => {
    animateButton(completeScale);
    setTimeout(() => {
      // Navigate to complete work notification screen
      router.push({
        pathname: "/notifications/complete-work",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  return (
    <ScrollView >
      <View className="flex-1 bg-background">
        {/* Enhanced Project Info Card */}
        <View className="px-4 pt-4 pb-2">
          <Card className="flex-row items-center mb-3 bg-white !border-0 !shadow-none">
            {/* Project Image */}
            {project?.data?.mainImage ? (
              <View className="w-[120px] h-[120px] rounded-xl overflow-hidden border border-border bg-white justify-center items-center mr-4">
                <Animated.Image
                  source={{ uri: project.data.mainImage }}
                  style={{ width: 120, height: 120, resizeMode: 'cover' }}
                />
              </View>
            ) : (
              <View className="w-[120px] h-[120px] rounded-xl overflow-hidden border border-border bg-gray-100 justify-center items-center mr-4">
                <Text className="text-4xl font-bold text-gray-400">
                  {project?.data?.name?.[0] || "?"}
                </Text>
              </View>
            )}
            {/* Project Info */}
            <View className="flex-1 min-w-0">
              <CardHeader className="p-0 mb-1">
                <View className="flex-row items-center gap-4">

                  <TouchableOpacity onPress={() => setShowClientInfo(true)}>
                    <CardTitle className="text-3xl mb-1 truncate capitalize">{project?.data?.name}


                    </CardTitle>
                  </TouchableOpacity>
                </View>
                <View className="flex-col flex-wrap gap-3 mb-1">
                  {project?.data?.location && (
                    <CardDescription className="flex-row items-center">
                      <Text className="text-xs text-primary-dark"> {project.data.location}</Text>
                    </CardDescription>
                  )}
                  <View className="flex-row items-center gap-2">

                    {project?.data?.status?.label && (
                      <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${project.data.status.color}` || '#e0e7ff' }}>
                        <Text className="text-xs font-semibold text-white">{project.data.status.label}</Text>
                      </View>
                    )}
                    {project?.data?.lossType && (
                      <View className="flex-row items-center bg-blue-700 rounded px-2 py-0.5">
                        <Text className="text-xs text-white capitalize">{project.data.lossType.replace(/_/g, ' ')}</Text>
                      </View>
                    )}
                  <ProjectTags
                    tags={project?.data?.tags}
                    onAddTags={() => setShowTagsModal(true)}
                  />
                  </View>
                  <ImageTagsModal
                    visible={showTagsModal}
                    type="PROJECT"
                    onClose={() => setShowTagsModal(false)}
                    projectId={project?.data?.id}
                    currentTags={project?.data?.tags || []}
                    onTagsUpdated={() => {
                      refetch();
                    }}
                  />
                </View>
                {/* {project?.data?.dateOfLoss && (
                <CardDescription className="flex-row items-center mt-1">
                  <Text className="text-xs text-orange-700"> <Calendar size={18} /> Loss: {new Date(project.data.dateOfLoss).toLocaleDateString()}</Text>
                </CardDescription>
              )} */}
              </CardHeader>
            </View>
          </Card>
          {/* Client Info Button (TouchableOpacity) */}
          {/* <TouchableOpacity
          onPress={() => setShowClientInfo(true)}
          className="flex-row items-center mt-1"
        >
          <Text className="text-2xl font-bold text-foreground">
              {project?.data?.clientName}
            </Text>
            <ChevronDown size={20} className="ml-2 text-foreground" />
        </TouchableOpacity> */}
        </View>

        {/* Client Info Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showClientInfo}
          onRequestClose={() => setShowClientInfo(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-background rounded-t-3xl p-5">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-col items-start">

                  <Text className="text-xl font-bold text-foreground">
                    {project?.data?.clientName}
                  </Text>
                  {project?.data?.lossType && (
                    <View className="flex flex-row items-center">
                      <View className="bg-primary/10 p-2 rounded-lg">
                        <AlertTriangle
                          height={16}
                          width={16}
                          className="text-primary"
                        />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-sm text-muted-foreground">
                          Damage Type
                        </Text>
                        <Text className="text-base text-foreground capitalize">
                          {project?.data?.lossType.replace(/_/g, " ")}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setShowClientInfo(false);
                      router.push({
                        pathname: "./details",
                        params: { activeTab: "customer" },
                      });
                    }}
                  >
                    {/* <Cog size={16} className="mr-2" /> */}
                    <Text>Edit</Text>
                  </Button>
                  <TouchableOpacity
                    onPress={() => setShowClientInfo(false)}
                    className="p-2"
                  >
                    <X size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>


              <View className="">
                {/* <Text className="text-sm font-medium text-muted-foreground mb-3">
                  Contact Information
                </Text> */}

                <View className="space-y-3">
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Map height={20} width={20} className="text-primary" />
                      </View> */}
                      <Text className="text-base ml-3 text-foreground flex-1">
                        {project?.data?.location || "No location"}
                      </Text>
                    </View>
                    {project?.data?.location && (
                      <TouchableOpacity
                        onPress={() => copyText(project?.data?.location)}
                        className="p-2"
                      >
                        <Files
                          size={18}
                          className="text-primary-dark"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {project?.data?.clientEmail ? (
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {/* <View className="bg-primary/10 p-2 rounded-lg">
                          <Mail
                            height={20}
                            width={20}
                            className="text-primary"
                          />
                        </View> */}
                        <Text className="text-base ml-3 text-foreground flex-1">
                          {project?.data?.clientEmail}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => copyText(project?.data?.clientEmail)}
                        className="p-2"
                      >
                        <Files
                          size={18}
                          className="text-primary-dark"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex flex-row items-center">
                      {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Mail height={20} width={20} className="text-primary" />
                      </View> */}
                      <Text className="text-base ml-3 text-muted-foreground">
                        No email
                      </Text>
                    </View>
                  )}

                  {project?.data?.clientPhoneNumber ? (
                    <View className="flex flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {/* <View className="bg-primary/10 p-2 rounded-lg">
                          <Phone
                            height={20}
                            width={20}
                            className="text-primary"
                          />
                        </View> */}
                        <Text className="text-base ml-3 text-foreground flex-1">
                          {project?.data?.clientPhoneNumber}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          copyText(project?.data?.clientPhoneNumber)
                        }
                        className="p-2"
                      >
                        <Files
                          size={18}
                          className="text-primary-dark"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="flex flex-row items-center">
                      {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Phone
                          height={20}
                          width={20}
                          className="text-primary"
                        />
                      </View> */}
                      <Text className="text-base ml-3 text-muted-foreground">
                        No phone
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="my-6 space-y-2 ">
                {project?.data?.clientPhoneNumber && (
                  <View className="flex-row space-x-2 w-full justify-between">
                    <Button
                      // variant="secondary"
                      variant="secondary"
                      className=" flex-row gap-2"
                      onPress={() =>
                        Linking.openURL(`sms:${project?.data?.clientPhoneNumber}`)
                      }
                    >
                      <MessageSquare size={18} className="mr-2" />
                      <Text>Message</Text>
                    </Button>
                    <Button
                      // variant="secondary"
                      variant="secondary"
                      className=" flex-row gap-2"
                      onPress={() =>
                        Linking.openURL(`tel:${project?.data?.clientPhoneNumber}`)
                      }
                    >
                      <Phone size={18} className="mr-2" />
                      <Text>Call</Text>
                    </Button>

                    {project?.data?.clientEmail && (
                      <Button
                        // variant="secondary"
                        variant="secondary"
                        className=" flex-row gap-2 text-gray-500"
                        onPress={() =>
                          Linking.openURL(`mailto:${project?.data?.clientEmail}`)
                        }
                      >
                        <Mail size={18} className="mr-2" />
                        <Text>Send Email</Text>
                      </Button>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>


        <View className="px-4">
          {/* Action buttons with text below icons for better responsiveness */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingVertical: 20,
            }}
          >
            <Animated.View
              style={{
                width: "48%",
                marginBottom: 12,
                transform: [{ scale: arrivalScale }],
              }}
            >
              <TouchableOpacity
                className="bg-[#4338ca] rounded-lg overflow-hidden shadow-sm"
                onPress={handleArrivalPress}
                activeOpacity={0.6}
              >
                <View className="flex-row items-center justify-center py-3 px-1 gap-2">
                  {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                  <MapPin size={18} color="#fff" />
                  <Text className="text-white font-semibold ">
                    Arrival
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                width: "48%",
                marginBottom: 12,
                transform: [{ scale: startScale }],
              }}
            >
              <TouchableOpacity
                className="bg-[#0e7490] rounded-lg overflow-hidden shadow-sm"
                onPress={handleStartPress}
                activeOpacity={0.6}
              >
                <View className="flex-row items-center justify-center py-3 px-1 gap-2">
                  {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                  <PlayCircle size={18} color="#fff" />
                  <Text className="text-white font-semibold ">
                    Start
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                width: "48%",
                marginBottom: 0,
                transform: [{ scale: completeScale }],
              }}
            >
              <TouchableOpacity
                className="bg-[#15803d] rounded-lg overflow-hidden shadow-sm"
                onPress={handleCompletePress}
                activeOpacity={0.6}
              >
                <View className="flex-row items-center justify-center py-3 px-1 gap-2">
                  {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                  <CheckCircle size={18} color="#fff" />
                  <Text className="text-white font-semibold ">
                    Complete
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                width: "48%",
                marginBottom: 0,
                transform: [{ scale: directionsScale }],
              }}
            >
              <TouchableOpacity
                className="bg-[#0369a1] rounded-lg overflow-hidden shadow-sm"
                onPress={openInMaps}
                activeOpacity={0.6}
              >
                <View className="flex-row items-center justify-center py-3 px-1 gap-2">
                  {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                  <Map size={18} color="#fff" />
                  <Text className="text-white font-semibold ">
                    Directions
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <AssigneeSelect />

          <View className="py-4">
            {projectViewMode === "list" ? (
              <View className="space-y-3 gap-2">
                {navigationItems.map((item, index) => (
                  <NavigationCell
                    key={index}
                    project={project?.data!}
                    path={item.path}
                    Icon={item.Icon}
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-around ">
                {navigationItems.map((item, index) => (
                  <GridCell
                    key={index}
                    project={project?.data!}
                    path={item.path}
                    Icon={item.Icon}
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function NavigationCell({
  project,
  path,
  Icon,
  title,
  description,
  onPress,
}: {
  project: Project | null;
  path?: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="w-full"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (path) {
          router.navigate({
            pathname: path,
            params: {
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="p-4">
        <View className="flex-row items-center">
          <View className="bg-primary/10 p-3 rounded-xl">
            {React.createElement(Icon as any, { height: 24, width: 24, color: '#000', className: 'text-white' })}
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
          <Text style={{ fontSize: 20, marginLeft: 8 }}>→</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function GridCell({
  project,
  path,
  Icon,
  title,
  description,
  onPress,
}: {
  project: Project | null;
  path?: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  console.log("🚀 ~ params:", path);
  const router = useRouter();
  return (
    <TouchableOpacity
      className="w-[32%] mb-3"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (path) {
          router.navigate({
            pathname: path,
            params: {
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="overflow-hidden h-[110px]">
        <View className="items-center p-3 h-full justify-center">
          <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center mb-3">
            {React.createElement(Icon as any, { height: 22, width: 22, color: '#000' })}
          </View>
          <Text className="text-sm font-semibold text-center text-foreground">
            {title}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
