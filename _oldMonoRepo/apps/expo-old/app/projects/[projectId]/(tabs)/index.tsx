import { ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import * as Clipboard from "expo-clipboard";

import { Linking } from "react-native";

import AssigneeSelect from "@/components/project/assignee";
import {
  ArrowRight,
  Book,
  Camera,
  ClipboardCheck,
  Cog,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner-native";

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const members = teamMemberStore();
  const user = userStore();

  const project = projectStore();

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

  console.log(project.project);

  return (
    <View className="mx-4 mt-4">
      <View className="w-full flex-row justify-between my-2">
        <Text className="text-2xl font-bold">
          {project.project?.clientName}
        </Text>
      </View>
      <View className="w-full gap-y-2 my-3">
        <TouchableOpacity
          onPress={openInMaps}
          onLongPress={() => copyText(project.project?.location)}
          className="flex flex-row"
        >
          <Map height={24} width={24} />
          <Text className="text-lg font-bold ml-2 text-primary">
            {project.project?.location || ""}
          </Text>
        </TouchableOpacity>
        {project.project?.clientEmail ? (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`mailto:${project.project?.clientEmail}`)
            }
            onLongPress={() => copyText(project.project?.clientEmail)}
            className="flex flex-row"
          >
            <Mail height={24} width={24} />
            <Text className="text-lg font-bold ml-2 text-primary">
              {project.project?.clientEmail || ""}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex flex-row">
            <Mail height={24} width={24} />
            <Text className="text-lg font-bold ml-2 text-primary">--</Text>
          </View>
        )}
        {project.project?.clientPhoneNumber ? (
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`tel:${project.project?.clientPhoneNumber}`)
            }
            onLongPress={() => copyText(project.project?.clientPhoneNumber)}
            className="flex flex-row"
          >
            <Phone height={24} width={24} />
            <Text className="text-lg font-bold ml-2 text-primary">
              {project.project?.clientPhoneNumber || ""}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex flex-row">
            <Phone height={24} width={24} />
            <Text className="text-lg font-bold ml-2 text-primary">--</Text>
          </View>
        )}
        <AssigneeSelect
          projectAssignees={project.project?.assignees ?? []}
          teamMembers={members.members}
          projectPublicId={projectId}
        />
      </View>
      <Separator className="my-4" />

      <ScrollView>
        <View className="w-full gap-y-5 my-3">
          <NavigationCell
            project={project.project}
            path="./edit-insurance"
            Icon={Cog}
            title="Insurance Adjuster"
          />
          <NavigationCell
            project={project.project}
            path="./lidar"
            Icon={Video}
            title="Lidar Scan"
          />
          <NavigationCell
            project={project.project}
            path="./pictures"
            Icon={Camera}
            title="Photos"
          />
          <NavigationCell
            project={project.project}
            path="./readings"
            Icon={Book}
            title="Readings"
          />
          <NavigationCell
            project={project.project}
            path="./notes"
            Icon={StickyNote}
            title="Notes"
          />
          <NavigationCell
            project={project.project}
            Icon={ClipboardCheck}
            title="Report"
            onPress={() =>
              Linking.openURL(
                `${process.env.EXPO_PUBLIC_BASE_URL}/projects/${projectId}/report`
              )
            }
          />
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
  onPress,
}: {
  project: Project;
  path?: string;
  Icon: LucideIcon;
  title: string;
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
        router.navigate({
          pathname: path,
          params: {
            projectName: project?.clientName || "",
          },
        });
      }}
    >
      <Card className="flex flex-row items-center justify-between p-4">
        <View className="flex flex-row items-center">
          <Icon height={24} width={24} />
          <Text className="text-lg font-semibold ml-4">{title}</Text>
        </View>
        <ArrowRight height={24} width={24} color="#525252" />
      </Card>
    </TouchableOpacity>
  );
}
