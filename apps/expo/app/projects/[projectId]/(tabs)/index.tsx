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
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { projectStore } from "@/lib/state/project";
import { teamMemberStore } from "@/lib/state/team-members";
import { userStore } from "@/lib/state/user";
import { uiPreferencesStore } from "@/lib/state/ui-preferences";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { toast } from "sonner-native";

// Import Project type to fix linter errors
type Project = {
  clientName?: string;
  location?: string;
  clientEmail?: string;
  clientPhoneNumber?: string;
  assignees?: any[];
  damageType?: "fire" | "water" | "mold" | "other";
};

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const members = teamMemberStore();
  const user = userStore();
  const project = projectStore();
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
        `https://www.google.com/maps/search/?api=1&query=${project.project?.location}`
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

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/organization/members`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "auth-token": user.session?.access_token || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        members.setMembers(data.members);
      });
  }, []);

  const navigationItems = [
    {
      path: "./details",
      params: { activeTab: "insurance" },
      Icon: Cog,
      title: "Insurance Adjuster",
      description: "Manage insurance details",
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
      Icon: ClipboardCheck,
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

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 bg-background">
        <View className="w-full flex-row justify-between items-center">
          <TouchableOpacity
            // onPress={() => setShowClientInfo(true)}
            onPress={() => router.push({ pathname: "./details", params: { activeTab: "customer" } })}
            className="flex-row items-center"
          >
            <Text className="text-2xl font-bold text-foreground">
              {project.project?.clientName}
            </Text>
            <ChevronDown size={20} className="ml-2 text-foreground" />
          </TouchableOpacity>
          <View className="flex-row overflow-hidden rounded-full border border-border">
            <TouchableOpacity
              className={`px-4 py-2 flex-row items-center ${
                projectViewMode === "list" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setProjectViewMode("list")}
            >
              <List
                size={16}
                color={projectViewMode === "list" ? "#FFFFFF" : "#000000"}
              />
              <Text
                className={`text-sm ml-2 font-medium ${
                  projectViewMode === "list"
                    ? "text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 flex-row items-center ${
                projectViewMode === "grid" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setProjectViewMode("grid")}
            >
              <Grid2X2
                size={16}
                color={projectViewMode === "grid" ? "#FFFFFF" : "#000000"}
              />
              <Text
                className={`text-sm ml-2 font-medium ${
                  projectViewMode === "grid"
                    ? "text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                Grid
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">
                {project.project?.clientName}
              </Text>
              <TouchableOpacity
                onPress={() => setShowClientInfo(false)}
                className="p-2"
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {project.project?.damageType && (
                <View className="flex flex-row items-center">
                  <View className="bg-primary/10 p-2 rounded-lg">
                    <AlertTriangle height={20} width={20} className="text-primary" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-sm text-muted-foreground">Damage Type</Text>
                    <Text className="text-base text-foreground capitalize">
                      {project.project.damageType.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={openInMaps}
                onLongPress={() => copyText(project.project?.location)}
                className="flex flex-row items-center"
              >
                <View className="bg-primary/10 p-2 rounded-lg">
                  <Map height={20} width={20} className="text-primary" />
                </View>
                <Text className="text-base ml-3 text-foreground">
                  {project.project?.location || "No location"}
                </Text>
              </TouchableOpacity>

              {project.project?.clientEmail ? (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(`mailto:${project.project?.clientEmail}`)
                  }
                  onLongPress={() => copyText(project.project?.clientEmail)}
                  className="flex flex-row items-center"
                >
                  <View className="bg-primary/10 p-2 rounded-lg">
                    <Mail height={20} width={20} className="text-primary" />
                  </View>
                  <Text className="text-base ml-3 text-foreground">
                    {project.project?.clientEmail}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex flex-row items-center">
                  <View className="bg-primary/10 p-2 rounded-lg">
                    <Mail height={20} width={20} className="text-primary" />
                  </View>
                  <Text className="text-base ml-3 text-muted-foreground">
                    No email
                  </Text>
                </View>
              )}

              {project.project?.clientPhoneNumber ? (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(`tel:${project.project?.clientPhoneNumber}`)
                  }
                  onLongPress={() =>
                    copyText(project.project?.clientPhoneNumber)
                  }
                  className="flex flex-row items-center"
                >
                  <View className="bg-primary/10 p-2 rounded-lg">
                    <Phone height={20} width={20} className="text-primary" />
                  </View>
                  <Text className="text-base ml-3 text-foreground">
                    {project.project?.clientPhoneNumber}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex flex-row items-center">
                  <View className="bg-primary/10 p-2 rounded-lg">
                    <Phone height={20} width={20} className="text-primary" />
                  </View>
                  <Text className="text-base ml-3 text-muted-foreground">
                    No phone
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowClientInfo(false)}
              className="bg-primary mt-6 py-3 rounded-lg"
            >
              <Text className="text-center text-primary-foreground font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1">
        <View className="px-4">
          {/* Action buttons with text below icons for better responsiveness */}
          <View className="flex-row justify-between mb-4 py-5">
            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: arrivalScale }],
                marginHorizontal: 2,
              }}
            >
              <TouchableOpacity
                className="bg-[#4338ca] rounded-lg overflow-hidden shadow-sm"
                onPress={handleArrivalPress}
                activeOpacity={0.6}
              >
                <View className="items-center py-3 px-1">
                  <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                    <MapPin size={18} color="#fff" />
                  </View>
                  <Text className="text-white font-semibold text-xs">
                    Arrival
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: startScale }],
                marginHorizontal: 2,
              }}
            >
              <TouchableOpacity
                className="bg-[#0e7490] rounded-lg overflow-hidden shadow-sm"
                onPress={handleStartPress}
                activeOpacity={0.6}
              >
                <View className="items-center py-3 px-1">
                  <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                    <PlayCircle size={18} color="#fff" />
                  </View>
                  <Text className="text-white font-semibold text-xs">
                    Start
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: completeScale }],
                marginHorizontal: 2,
              }}
            >
              <TouchableOpacity
                className="bg-[#15803d] rounded-lg overflow-hidden shadow-sm"
                onPress={handleCompletePress}
                activeOpacity={0.6}
              >
                <View className="items-center py-3 px-1">
                  <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                    <CheckCircle size={18} color="#fff" />
                  </View>
                  <Text className="text-white font-semibold text-xs">
                    Complete
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                flex: 1,
                transform: [{ scale: directionsScale }],
                marginHorizontal: 2,
              }}
            >
              <TouchableOpacity
                className="bg-[#0369a1] rounded-lg overflow-hidden shadow-sm"
                onPress={openInMaps}
                activeOpacity={0.6}
              >
                <View className="items-center py-3 px-1">
                  <View className="w-9 h-9 rounded-full justify-center items-center mb-1.5 bg-white/20">
                    <Map size={18} color="#fff" />
                  </View>
                  <Text className="text-white font-semibold text-xs">
                    Directions
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <AssigneeSelect
            projectAssignees={project.project?.assignees ?? []}
            teamMembers={members.members}
          />

          <View className="py-4">
            {projectViewMode === "list" ? (
              <View className="space-y-3 gap-2">
                {navigationItems.map((item, index) => (
                  <NavigationCell
                    key={index}
                    project={project.project}
                    path={item.path}
                    params={item.params}
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
                    project={project.project}
                    path={item.path}
                    params={item.params}
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
      </ScrollView>
    </View>
  );
}

function NavigationCell({
  project,
  path,
  params,
  Icon,
  title,
  description,
  onPress,
}: {
  project: Project | null;
  path?: string;
  params?: { activeTab?: string };
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
              ...params,
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="p-4">
        <View className="flex-row items-center">
          <View className="bg-primary p-3 rounded-xl">
            <Icon height={24} width={24} className="text-white" color="#fff" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
          <ArrowRight
            height={20}
            width={20}
            className="text-muted-foreground"
          />
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
  params,
  onPress,
}: {
  project: Project | null;
  path?: string;
  params?: { activeTab?: string };
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  console.log("🚀 ~ params:", params)
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
              ...params,
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="overflow-hidden h-[110px]">
        <View className="items-center p-3 h-full justify-center">
          <View className="h-14 w-14 rounded-full bg-primary items-center justify-center mb-3">
            <Icon height={22} width={22} color="#fff" />
          </View>
          <Text className="text-sm font-semibold text-center text-foreground">
            {title}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
