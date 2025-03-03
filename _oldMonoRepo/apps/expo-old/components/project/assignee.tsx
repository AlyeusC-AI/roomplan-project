import React, { useState } from "react";
import { userStore } from "@/lib/state/user";
import { Check, Users } from "lucide-react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TouchableOpacity } from "react-native";
import { Text } from "../ui/text";
import { View } from "react-native";
import { Card } from "../ui/card";
import { useGlobalSearchParams } from "expo-router";
import { projectStore } from "@/lib/state/project";

const AssigneeSelect = ({
  projectAssignees,
  teamMembers,
}: {
  projectAssignees: Assignee[];
  teamMembers: User[];
}) => {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const project = projectStore();
  const [isOpen, setIsOpen] = useState(false);
  const selectedMembers = projectAssignees.filter((p) =>
    teamMembers.find((t) => t.id === p.userId)
  );
  const { session } = userStore((state) => state);

  const onPress = (userId: string, isAlreadySelected: boolean) => {
    if (isAlreadySelected) {
      fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/assignees`,
        {
          method: "DELETE",
          headers: {
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );
      project.removeAssignee(userId);
    } else {
      fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/assignees`,
        {
          method: "POST",
          headers: {
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      )
      .then((res) => res.json())
      .then((data) => {
        project.addAssignee(data.assignee);
      });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DialogTrigger className="flex flex-row" onPress={() => setIsOpen(true)}>
        <Users height={24} width={24} />
        <View className="ml-2">
          {selectedMembers.map((m) => (
            <Text className="text-lg text-primary font-bold" key={m.userId}>
              {m.User?.firstName || m.User?.email}
            </Text>
          ))}
        </View>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <Text className="font-bold text-4xl">Team Members</Text>
        </DialogHeader>
        {teamMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            onPress={() =>
              onPress(
                member.id,
                !!projectAssignees.find((a) => a.userId === member.id)
              )
            }
          >
            <Card className="flex flex-row justify-between p-5 w-full">
              {!member.firstName ? (
                <Text>{member.email}</Text>
              ) : (
                <Text>{`${member.firstName} ${member.lastName}`}</Text>
              )}
              {projectAssignees.find((a) => a.userId === member.id) && (
                <Check className="ml-6" color="#1e88e5" />
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default AssigneeSelect;
