import React, { useState, useCallback } from "react";
import { userStore } from "@/lib/state/user";
import { Check, Users, Search } from "lucide-react-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { Text } from "../ui/text";
import { View } from "react-native";
import { Card } from "../ui/card";
import { useGlobalSearchParams } from "expo-router";
import { projectStore } from "@/lib/state/project";
import { User } from "@supabase/supabase-js";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
interface ProjectAssignee {
  userId: string;
  User?: {
    firstName?: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
  };
}

interface AssigneeSelectProps {
  projectAssignees: ProjectAssignee[];
  teamMembers: User[];
}

const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  projectAssignees,
  teamMembers,
}) => {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();
  const project = projectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = userStore((state) => state);
  const currentUserId = session?.user?.id;

  const selectedMembers = projectAssignees.filter((p) =>
    teamMembers.find((t) => t.id === p.userId)
  );

  const filteredMembers = teamMembers.filter((member) => {
    const userData = member.user_metadata || {};
    const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    const email = member.email || "";
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const onPress = useCallback(async (userId: string, isAlreadySelected: boolean) => {
    if (!session?.access_token) return;
    
    if (isAlreadySelected && userId === currentUserId) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api(
        `/api/v1/projects/${projectId}/assignee`,
        {
          method: isAlreadySelected ? "DELETE" : "POST",
          data: { userId },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update assignee");
      }

      await project.fetchProject(projectId as string);
    } catch (error: any) {
      console.error("Error updating assignee:", JSON.stringify(error.response, null, 2));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, session?.access_token, project, currentUserId]);

  const getUserInitials = (user: User) => {
    const metadata = user.user_metadata || {};
    if (metadata.firstName && metadata.lastName) {
      return `${metadata.firstName[0]}${metadata.lastName[0]}`;
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex flex-row items-center space-x-2 p-2 gap-2 rounded-lg hover:bg-gray-100">
        <Users height={24} width={24} className="text-black" color="#000" />
        <View className="flex-row items-center gap-2">
          {selectedMembers.length > 0 ? (
            <>
              <Text className=" text-primary font-medium">
                {selectedMembers[0].User?.firstName || selectedMembers[0].User?.email}
              </Text>
              {selectedMembers.length > 1 && (
                <Text className=" text-gray-500 ml-1">
                  +{selectedMembers.length - 1} more
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm text-gray-500">Select assignees</Text>
          )}
        </View>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <Text className="text-3xl font-bold mb-6">Team Members</Text>
          <View className=" flex-row items-center gap-2 px-5">
            <Search className=" text-gray-400" size={20} />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className=" h-12 text-lg w-full"
            />
          </View>
        </DialogHeader>
        <View className="mt-6 space-y-3">
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#1e88e5" />
            </View>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = projectAssignees.some((a) => a.userId === member.id);
              const metadata = member.user_metadata || {};
              const fullName = `${metadata.firstName || ""} ${metadata.lastName || ""}`.trim();

              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => onPress(member.id, isSelected)}
                  disabled={isLoading || (isSelected && member.id === currentUserId)}
                >
                  <Card
                    className={cn(
                      "flex-row items-center p-5 w-full mb-2",
                      isSelected && "bg-primary/5",
                      isSelected && member.id === currentUserId && "opacity-50"
                    )}
                  >
                    <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-primary font-medium text-lg">
                        {getUserInitials(member)}
                      </Text>
                    </View>
                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-medium text-lg">
                          {fullName || member.email}
                        </Text>
                        {member.id === currentUserId && (
                          <Text className="ml-2 text-sm text-gray-500">(You)</Text>
                        )}
                      </View>
                      {fullName && (
                        <Text className="text-sm text-gray-500 mt-1">{member.email}</Text>
                      )}
                    </View>
                    {isSelected && (
                      <View className="flex-row items-center">
                        {member.id === currentUserId ? (
                          <Text className="text-sm text-gray-500 mr-2">Required</Text>
                        ) : null}
                        <Check className="text-primary" size={24} />
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </DialogContent>
    </Dialog>
  );
};

export default AssigneeSelect;
