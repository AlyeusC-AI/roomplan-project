import { ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

import AssigneeSelect from "@/components/project/assignee";
import {
  ArrowRight,
  Book,
  Camera,
  ClipboardCheck,
  Cog,
  Grid2X2,
  List,
  LucideIcon,
  Mail,
  Map,
  Phone,
  StickyNote,
  Video,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { projectStore } from "@/lib/state/project";
import { teamMemberStore } from "@/lib/state/team-members";
import { userStore } from "@/lib/state/user";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { toast } from "sonner-native";

type ViewMode = "list" | "grid";

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const members = teamMemberStore();
  const user = userStore();
  const project = projectStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const openInMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${project.project?.location}`
    );
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
      path: "./edit-insurance",
      Icon: Cog,
      title: "Insurance Adjuster",
      description: "Manage insurance details",
    },
    {
      path: "./lidar",
      Icon: Video,
      title: "Lidar Scan",
      description: "View 3D scans",
    },
    {
      path: "./pictures",
      Icon: Camera,
      title: "Photos",
      description: "Project documentation",
    },
    {
      path: "./readings",
      Icon: Book,
      title: "Readings",
      description: "View measurements",
    },
    {
      path: "./notes",
      Icon: StickyNote,
      title: "Notes",
      description: "Project notes",
    },
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

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 bg-background">
        <View className="w-full flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-foreground">
            {project.project?.clientName}
          </Text>
          <View className="flex-row overflow-hidden rounded-full border border-border">
            <TouchableOpacity
              className={`px-4 py-2 flex-row items-center ${viewMode === "list" ? "bg-primary" : "bg-transparent"}`}
              onPress={() => setViewMode("list")}
            >
              <List 
                size={16} 
                color={viewMode === "list" ? "#FFFFFF" : "#000000"} 
              />
              <Text className={`text-sm ml-2 font-medium ${viewMode === "list" ? "text-primary-foreground" : "text-foreground"}`}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 flex-row items-center ${viewMode === "grid" ? "bg-primary" : "bg-transparent"}`}
              onPress={() => setViewMode("grid")}
            >
              <Grid2X2 
                size={16} 
                color={viewMode === "grid" ? "#FFFFFF" : "#000000"} 
              />
              <Text className={`text-sm ml-2 font-medium ${viewMode === "grid" ? "text-primary-foreground" : "text-foreground"}`}>
                Grid
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4">
          <Card className="p-4 mb-4">
            <View className="space-y-3">
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
                  onLongPress={() => copyText(project.project?.clientPhoneNumber)}
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
          </Card>

          <AssigneeSelect
            projectAssignees={project.project?.assignees ?? []}
            teamMembers={members.members}
          />

          <View className="py-4">
            {viewMode === "list" ? (
              <View className="space-y-3 gap-2">
                {navigationItems.map((item, index) => (
                  <NavigationCell
                    key={index}
                    project={project.project}
                    path={item.path}
                    Icon={item.Icon}
                    title={item.title}
                    description={item.description}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {navigationItems.map((item, index) => (
                  <GridCell
                    key={index}
                    project={project.project}
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
      </ScrollView>
    </View>
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
            <Icon height={24} width={24} className="text-primary" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-foreground">{title}</Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
          <ArrowRight height={20} width={20} className="text-muted-foreground" />
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
            <Icon height={22} width={22} color="#0369a1" />
          </View>
          <Text className="text-sm font-semibold text-center text-foreground">
            {title}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
