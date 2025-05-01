import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Check, Search, Users, X } from "lucide-react-native";
import { Box, Input, Text } from "native-base";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { teamMemberStore } from "@/lib/state/team-members";

interface MemberSelectorProps {
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
}

export default function MemberSelector({
  selectedUserIds,
  onChange,
}: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { members } = teamMemberStore();

  const filteredMembers = members.filter((member) => {
    const userData = member.user_metadata || {};
    const fullName =
      `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
    const email = member.email || "";
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelect = (userId: string) => {
    const isSelected = selectedUserIds.includes(userId);
    if (isSelected) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const getUserInitials = (user: any) => {
    const metadata = user.user_metadata || {};
    if (metadata.firstName && metadata.lastName) {
      return `${metadata.firstName[0]}${metadata.lastName[0]}`;
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  const getUserName = (user: any) => {
    const metadata = user.user_metadata || {};
    const fullName =
      `${metadata.firstName || ""} ${metadata.lastName || ""}`.trim();
    return fullName || user.email;
  };

  return (
    <Box>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between px-3 py-2 rounded-md bg-background border border-input"
      >
        <View className="flex-row items-center gap-2">
          <Users size={20} color="#64748b" />
          <Text
            className={cn(
              "text-sm",
              selectedUserIds.length > 0
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {selectedUserIds.length > 0
              ? `${selectedUserIds.length} member${selectedUserIds.length > 1 ? "s" : ""} selected`
              : "Select members to notify"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {selectedUserIds.length > 0 && (
            <Text className="text-sm text-muted-foreground">
              {selectedUserIds.length}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Box style={styles.modalContainer}>
          <View className="flex-row justify-between items-center mb-4">
            <Text style={styles.modalTitle}>Select Members to Notify</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <X color="#64748b" size={20} />
            </TouchableOpacity>
          </View>

          <Box mb={4}>
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftElement={
                <Search size={20} color="#64748b" style={{ marginLeft: 12 }} />
              }
              className="bg-background border border-input rounded-md"
            />
          </Box>

          <ScrollView style={{ maxHeight: 400 }}>
            {filteredMembers.map((member) => {
              const isSelected = selectedUserIds.includes(member.userId);
              return (
                <TouchableOpacity
                  key={member.userId}
                  onPress={() => handleSelect(member.userId)}
                  className={cn(
                    "flex-row items-center justify-between px-4 py-3",
                    isSelected ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                      <Text className="text-primary font-medium text-lg">
                        {getUserInitials(member)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-sm font-medium">
                        {getUserName(member)}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {member.email}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color="#1d4ed8" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Box>
      </Modal>
    </Box>
  );
}

const styles = {
  modalContainer: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1d",
  },
} as const;
