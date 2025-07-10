import {
  ScrollView,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  Image,
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
  ChevronRight,
  LayoutGrid,
  Bot,
  Scan,
  Home,
  Image as ImageIcon,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { uiPreferencesStore } from "@/lib/state/ui-preferences";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner-native";
import { api } from "@/lib/api";
import {
  Project,
  useGetOrganizationMembers,
  useGetProjectById,
  useGetProjectMembers,
  useGetRooms,
} from "@service-geek/api-client";
import { Button } from "@/components/ui/button";
import ImageTagsModal from "@/components/pictures/ImageTagsModal";
import OfflineTasksManager from "@/components/project/OfflineTasksManager";
import DamageBadge from "@/components/project/damageBadge";
import AddRoomButton from "@/components/project/AddRoomButton";

// Utility to add opacity to hex color
function addOpacityToColor(color: string, opacityHex: string = "33") {
  if (!color) return color;
  // Only add opacity if color is in #RRGGBB format
  if (/^#([A-Fa-f0-9]{6})$/.test(color)) {
    return color + opacityHex;
  }
  return color;
}

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const { data: project, refetch } = useGetProjectById(projectId);
  console.log("🚀 ~ ProjectOverview ~ project:", project?.data.status);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const { projectViewMode, setProjectViewMode } = uiPreferencesStore();
  // Add state to control client info modal visibility
  const [showClientInfo, setShowClientInfo] = useState(false);
  // Add state to control directions modal visibility
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // Animation refs for button press effects
  const arrivalScale = useRef(new Animated.Value(1)).current;
  const startScale = useRef(new Animated.Value(1)).current;
  const completeScale = useRef(new Animated.Value(1)).current;
  const directionsScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const openInMaps = () => {
    animateButton(directionsScale);
    setTimeout(() => {
      setShowDirectionsModal(true);
    }, 200);
  };

  const openGoogleMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${project?.data.location}`
    );
    setShowDirectionsModal(false);
  };

  const openAppleMaps = () => {
    Linking.openURL(
      `http://maps.apple.com/?q=${encodeURIComponent(project?.data.location || "")}`
    );
    setShowDirectionsModal(false);
  };

  const copyAddress = async () => {
    if (project?.data.location) {
      await copyText(project.data.location);
      setShowDirectionsModal(false);
    }
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
      path: "./chat",
      Icon: MessageCircle,
      title: "Chat",
      description: "Project conversation",
    },
    {
      path: "./documents",
      Icon: File,
      title: "Files",
      description: "Manage project files",
    },
    {
      path: "./scope",
      Icon: Ruler,
      title: "Scope ",
      description: "Manage scope of work",
    },
    {
      path: "./forms",
      Icon: FileText,
      title: "Forms",
      description: "Manage project forms",
    },

    // {
    //   path: "./lidar/rooms",
    //   Icon: Video,
    //   title: "Lidar Scan",
    //   description: "View 3D scans",
    // },

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

  const { data: rooms, isLoading: loadingRooms } = useGetRooms(projectId);

  return (
    <ScrollView>
      <View className="flex-1 bg-background">
        {/* Enhanced Project Info Card */}
        <View className="px-4 pt-4 pb-2  bg-gray-300">
          <Card className="flex-row items-center mb-3  bg-gray-300 !border-0 !shadow-none">
            {/* Project Image */}
            {project?.data?.mainImage ? (
              <View className="w-[110px] h-[110px] rounded-xl overflow-hidden border border-border  justify-center items-center mr-4">
                <Animated.Image
                  source={{ uri: project.data.mainImage }}
                  style={{ width: 110, height: 110, resizeMode: "cover" }}
                />
              </View>
            ) : (
              <View className="w-[110px] h-[110px] rounded-xl overflow-hidden border border-border  justify-center items-center mr-4">
                <Text className="text-4xl font-bold text-gray-400 mb-1">
                  {project?.data?.name?.[0] || "?"}
                </Text>
              </View>
            )}
            {/* Project Info */}
            <View className="flex-1 min-w-0 bg-gray-300">
              <CardHeader className="p-0 mb-1 bg-gray-300">
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity onPress={() => setShowClientInfo(true)}>
                    <CardTitle className="text-3xl mb-1 truncate capitalize">
                      {project?.data?.name}
                    </CardTitle>
                  </TouchableOpacity>
                </View>
                <View className="flex-col flex-wrap gap-4 ">
                  {project?.data?.location && (
                    <CardDescription className="flex-row items-center">
                      <Text className="text-xs text-primary-dark">
                        {" "}
                        {project.data.location}
                      </Text>
                    </CardDescription>
                  )}
                  <View className="flex-row items-center gap-2">
                    {project?.data?.status?.label && (
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor:
                            (project.data.status.color?.toLowerCase() ===
                            "slate"
                              ? "slategray"
                              : project.data.status.color?.toLowerCase()) ||
                            "green",
                        }}
                      >
                        <Text
                          className="text-xs font-semibold text-white"
                          style={
                            {
                              // color: addOpacityToColor(project.data.status.color || ''),
                              color: project.data.status.color?.toLowerCase() === 'cyan' ? 'black' : "white"
                            }
                          }
                        >
                          {project.data.status.label.replace(/_/g, " ")}
                        </Text>
                      </View>
                    )}
                    {project?.data?.lossType && (
                      // <View className="flex-row items-center bg-blue-700 rounded px-2 py-0.5">
                      //   <Text className="text-xs text-white capitalize">
                      //     {project.data.lossType.replace(/_/g, " ")}
                      //   </Text>
                      // </View>
                      <DamageBadge lossType={project.data.lossType} />
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
                        {React.createElement(AlertTriangle as any, {
                          height: 16,
                          width: 16,
                          color: "#000",
                          className: "text-primary",
                        })}
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
                    {React.createElement(X as any, { size: 20, color: "#000" })}
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
                        {React.createElement(Files as any, {
                          size: 18,
                          color: "#000",
                          className: "text-primary-dark",
                        })}
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
                        {React.createElement(Files, {
                          size: 18,
                          color: "#000",
                          className: "text-primary-dark",
                        })}
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
                        {React.createElement(Files, {
                          size: 18,
                          color: "#000",
                          className: "text-primary-dark",
                        })}
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
                        Linking.openURL(
                          `sms:${project?.data?.clientPhoneNumber}`
                        )
                      }
                    >
                      {React.createElement(MessageSquare, {
                        size: 18,
                        color: "#000",
                        className: "mr-2",
                      })}
                      <Text>Message</Text>
                    </Button>
                    <Button
                      // variant="secondary"
                      variant="secondary"
                      className=" flex-row gap-2"
                      onPress={() =>
                        Linking.openURL(
                          `tel:${project?.data?.clientPhoneNumber}`
                        )
                      }
                    >
                      {React.createElement(Phone, {
                        size: 18,
                        color: "#000",
                        className: "mr-2",
                      })}
                      <Text>Call</Text>
                    </Button>

                    {project?.data?.clientEmail && (
                      <Button
                        // variant="secondary"
                        variant="secondary"
                        className=" flex-row gap-2 text-gray-500"
                        onPress={() =>
                          Linking.openURL(
                            `mailto:${project?.data?.clientEmail}`
                          )
                        }
                      >
                        {React.createElement(Mail, {
                          size: 18,
                          color: "#000",
                          className: "mr-2",
                        })}
                        <Text>Send Email</Text>
                      </Button>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Directions Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDirectionsModal}
          onRequestClose={() => setShowDirectionsModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50 mb-8">
            <View className="bg-background rounded-t-3xl p-5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-foreground">
                  Get Directions
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDirectionsModal(false)}
                  className="p-2"
                >
                  {React.createElement(X, { size: 20, color: "#000" })}
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                <TouchableOpacity
                  className="flex-row items-center p-4 bg-blue-50 rounded-lg"
                  onPress={openGoogleMaps}
                >
                  <View className="bg-blue-500 p-2 rounded-lg mr-3">
                    {React.createElement(Map, { size: 20, color: "#fff" })}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Google Maps
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Open in Google Maps app
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 bg-gray-50 rounded-lg"
                  onPress={openAppleMaps}
                >
                  <View className="bg-gray-500 p-2 rounded-lg mr-3">
                    {React.createElement(Map, { size: 20, color: "#fff" })}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Apple Maps
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Open in Apple Maps app
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center p-4 bg-green-50 rounded-lg"
                  onPress={copyAddress}
                >
                  <View className="bg-green-500 p-2 rounded-lg mr-3">
                    {React.createElement(Files, { size: 20, color: "#fff" })}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      Copy Address
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Copy address to clipboard
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <View
          className="bg-gray-300 px-4"
          style={{
            flexDirection: "row",
            // flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 10,
            paddingBottom: 10,
            gap: 10,
            width: "100%",
            flex: 1,
            // flexWrap: "wrap",

            // paddingVertical: 8,
          }}
        >
          <Animated.View
            style={{
              // width: "48%",
              marginBottom: 12,
              width: "23%",

              transform: [{ scale: arrivalScale }],
            }}
          >
            <TouchableOpacity
              className="bg-[#4338ca] rounded-lg overflow-hidden shadow-sm  "
              onPress={handleArrivalPress}
              activeOpacity={0.6}
            >
              <View className="flex-col items-center justify-center py-3 px-1 gap-2">
                {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                {React.createElement(MapPin, { size: 18, color: "#fff" })}
                <Text className="text-white font-semibold ">Arrival</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              // width: "48%",
              width: "23%",
              marginBottom: 12,
              transform: [{ scale: startScale }],
            }}
          >
            <TouchableOpacity
              className="bg-[#0e7490] rounded-lg overflow-hidden shadow-sm"
              onPress={handleStartPress}
              activeOpacity={0.6}
            >
              <View className="flex-col items-center justify-center py-3 px-1 gap-2">
                {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                {React.createElement(PlayCircle, { size: 18, color: "#fff" })}
                <Text className="text-white font-semibold ">Start</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              // width: "48%",
              width: "23%",
              marginBottom: 0,
              transform: [{ scale: completeScale }],
            }}
          >
            <TouchableOpacity
              className="bg-[#15803d] rounded-lg overflow-hidden shadow-sm"
              onPress={handleCompletePress}
              activeOpacity={0.6}
            >
              <View className="flex-col items-center justify-center py-3 px-1 gap-2">
                {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                {React.createElement(CheckCircle, {
                  size: 18,
                  color: "#fff",
                })}
                <Text className="text-white font-semibold ">Complete</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              // width: "48%",
              width: "23%",
              marginBottom: 0,
              transform: [{ scale: directionsScale }],
            }}
          >
            <TouchableOpacity
              className="bg-[#0369a1] rounded-lg overflow-hidden shadow-sm"
              onPress={openInMaps}
              activeOpacity={0.6}
            >
              <View className="flex-col items-center justify-center py-3 px-1 gap-2">
                {/* <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                  </View> */}
                {React.createElement(Map, { size: 18, color: "#fff" })}
                <Text className="text-white font-semibold ">Directions</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View className="px-4 ">
          {/* Action buttons with text below icons for better responsiveness */}

          <AssigneeSelect />

          {/* Offline Tasks Manager */}
          <OfflineTasksManager projectId={projectId} />

          <View className="gap-2 mt-4 mb-2 w-full">
            <TouchableOpacity
              className="bg-[#0ea5e9] rounded-lg w-full mb-2"
              onPress={() => {
                router.push({
                  pathname: "./lidar/rooms",
                  params: { projectId },
                });
              }}
              activeOpacity={0.85}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                minHeight: 48,
              }}
            >
              <View className="bg-white/20 rounded-full p-2 mr-3">
                {React.createElement(Scan, { size: 20, color: "#fff" })}
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  Floor Plan
                </Text>
                <Text className="text-white/80 text-xs mt-0.5">
                  Lidar scans
                </Text>
              </View>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 rounded-lg w-full"
              activeOpacity={1}
              disabled
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                minHeight: 48,
                opacity: 0.7,
              }}
            >
              <View className="bg-white/60 rounded-full p-2 mr-3">
                {React.createElement(Bot, { size: 20, color: "#6b7280" })}
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-semibold text-base">
                  Co-Pilot
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  Coming soon
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items Horizontal Scroll */}
          <View className="mt-4 mb-2">
            <Text className="text-lg font-semibold ml-1 mb-3">
              Quick Actions
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              className="flex-row"
            >
              {navigationItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="  "
                  style={{
                    width: 80,
                    height: 100,
                    padding: 12,
                  }}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                      return;
                    }
                    if (item.path) {
                      router.navigate({
                        pathname: item.path,
                        params: {
                          projectName: project?.data?.clientName || "",
                        },
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-1 items-center justify-center">
                    <View className="bg-primary/10 p-2 rounded-full mb-2">
                      {React.createElement(item.Icon as any, {
                        size: 24,
                        color: "#000",
                      })}
                    </View>
                    <Text
                      className="text-sm font-medium text-center text-foreground"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="w-full mt-2">
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text className="text-lg font-semibold ml-1">
                {rooms?.length || 0} Rooms
              </Text>
              <AddRoomButton
                showText={false}
                size="sm"
                className="rounded-full w-9 h-9 justify-center items-center bg-blue-50 border border-blue-200"
                onPress={() => router.push(`./rooms/create`)}
              />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {rooms?.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={{
                    width: "48%",
                    aspectRatio: 1,
                    marginBottom: 12,
                    borderRadius: 12,
                    height: 70,
                    backgroundColor: "#f3f4f6",
                  }}
                  onPress={() => router.push(`./rooms/${room.id}`)}
                  activeOpacity={0.85}
                >
                  {room.images && room.images.length > 0 ? (
                    <Image
                      source={{ uri: room.images[0].url }}
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "absolute",
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ImageIcon
                        size={36}
                        color="#9ca3af"
                        style={{ opacity: 0.6 }}
                      />
                    </View>
                  )}
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.45)",
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      className="text-base font-medium text-white"
                      numberOfLines={1}
                    >
                      {room.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* <View className="py-4">
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
          </View> */}
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
            {React.createElement(Icon as any, {
              height: 24,
              width: 24,
              color: "#000",
              className: "text-white",
            })}
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
            {React.createElement(Icon as any, {
              height: 22,
              width: 22,
              color: "#000",
            })}
          </View>
          <Text className="text-sm font-semibold text-center text-foreground">
            {title}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
