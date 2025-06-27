import React, { useState } from "react";
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
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  useGetOrganizationMembers,
  useGetProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  User,
} from "@service-geek/api-client";

const AssigneeSelect = () => {
  const { projectId } = useGlobalSearchParams<{ projectId: string }>();

  // Use the same API hooks as the web version
  const { data: teamMembersData } = useGetOrganizationMembers();
  const teamMembers = teamMembersData?.data || [];

  const { data: projectMembersData, refetch: refetchProjectMembers } =
    useGetProjectMembers(projectId as string);
  const projectMembers = projectMembersData?.users || [];

  const addProjectMemberMutation = useAddProjectMember();
  const removeProjectMemberMutation = useRemoveProjectMember();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = userStore((state) => state);
  const currentUserId = session?.user?.id;

  const filteredMembers = teamMembers.filter((member) => {
    const fullName =
      `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim();
    const email = member.user?.email || "";
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const onPress = async (userId: string, isAlreadySelected: boolean) => {
    if (!session?.access_token) return;

    if (isAlreadySelected && userId === currentUserId) {
      return;
    }

    setIsLoading(true);
    try {
      if (isAlreadySelected) {
        await removeProjectMemberMutation.mutateAsync({
          projectId: projectId as string,
          userId,
        });
      } else {
        await addProjectMemberMutation.mutateAsync({
          projectId: projectId as string,
          userId,
        });
      }
      await refetchProjectMembers();
    } catch (error) {
      console.error("Error updating assignee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="flex flex-row items-center space-x-2 p-2 gap-2 rounded-lg hover:bg-gray-100">
        <Users height={24} width={24} className="text-black" color="#000" />
        <View className="flex-row items-center gap-2">
          {projectMembers.length > 0 ? (
            <>
              <Text className="text-primary font-medium">
                {projectMembers[0]?.firstName || projectMembers[0]?.email}
              </Text>
              {projectMembers.length > 1 && (
                <Text className="text-gray-500 ml-1">
                  +{projectMembers.length - 1} more
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
          <View className="flex-row items-center gap-2 px-5">
            <Search className="text-gray-400" size={20} />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="h-12 text-lg w-full"
            />
          </View>
        </DialogHeader>
        <View className="mt-6 space-y-3">
          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#182e43" />
            </View>
          ) : (
            filteredMembers.map((member) => {
              const isSelected = projectMembers.some(
                (pm: User) => pm.id === member.user?.id
              );
              const fullName =
                `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim();

              return (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => onPress(member.user?.id || "", isSelected)}
                  disabled={
                    isLoading ||
                    (isSelected && member.user?.id === currentUserId)
                  }
                >
                  <Card
                    className={cn(
                      "flex-row items-center p-5 w-full mb-2",
                      isSelected && "bg-primary/5",
                      isSelected &&
                        member.user?.id === currentUserId &&
                        "opacity-50"
                    )}
                  >
                    <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-primary font-medium text-lg">
                        {getUserInitials(member.user!)}
                      </Text>
                    </View>
                    <View className="ml-4 flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-medium text-lg">
                          {fullName || member.user?.email}
                        </Text>
                        {member.user?.id === currentUserId && (
                          <Text className="ml-2 text-sm text-gray-500">
                            (You)
                          </Text>
                        )}
                      </View>
                      {fullName && (
                        <Text className="text-sm text-gray-500 mt-1">
                          {member.user?.email}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View className="flex-row items-center">
                        {member.user?.id === currentUserId ? (
                          <Text className="text-sm text-gray-500 mr-2">
                            Required
                          </Text>
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
