import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import {
  useGetOrganizationMembers,
  useCurrentUser,
  chatService,
  ChatType,
} from "@service-geek/api-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    color: "#1e88e5",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  memberItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  memberEmail: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 16,
  },
});

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: currentUser } = useCurrentUser();
  const { data: members, isLoading } = useGetOrganizationMembers();

  const handleStartPrivateChat = async (member: any) => {
    try {
      toast.loading("Creating chat...");

      const chat = await chatService.createPrivateChat(member.user.id);

      toast.dismiss();
      toast.success("Chat created!");

      // Navigate to the chat
      router.push(`/chats/${chat.id}`);
    } catch (error) {
      console.error("Failed to create private chat:", error);
      toast.dismiss();
      toast.error("Failed to create chat");
    }
  };

  const handleCreateGroupChat = () => {
    Alert.prompt(
      "Create Group Chat",
      "Enter a name for the group chat:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: async (groupName) => {
            if (!groupName?.trim()) {
              toast.error("Please enter a group name");
              return;
            }

            try {
              toast.loading("Creating group chat...");

              // For now, create an empty group chat
              // You might want to add member selection later
              const chat = await chatService.createGroupChat(groupName, []);

              toast.dismiss();
              toast.success("Group chat created!");

              // Navigate to the chat
              router.push(`/chats/${chat.id}`);
            } catch (error) {
              console.error("Failed to create group chat:", error);
              toast.dismiss();
              toast.error("Failed to create group chat");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  // Filter out the current user from organization members
  const filteredMembers =
    members?.data?.filter((member: any) => {
      // Skip if this is the current user
      if (currentUser && member.user.id === currentUser.id) {
        return false;
      }

      // Apply search filter if query exists
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const memberName = `${member.user.firstName} ${member.user.lastName}`;
        const memberEmail = member.user.email;

        return (
          memberName.toLowerCase().includes(searchLower) ||
          memberEmail.toLowerCase().includes(searchLower)
        );
      }

      return true;
    }) || [];

  const renderMember = ({ item: member }: { item: any }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => handleStartPrivateChat(member)}
    >
      <View style={styles.memberAvatar}>
        <Avatar className="h-12 w-12">
          {member.user.avatar ? (
            <AvatarImage source={{ uri: member.user.avatar }} />
          ) : (
            <AvatarFallback>
              <Text
                style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}
              >
                {`${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`}
              </Text>
            </AvatarFallback>
          )}
        </Avatar>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.user.firstName} {member.user.lastName}
        </Text>
        <Text style={styles.memberEmail}>{member.user.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Group Chat Option */}
      <TouchableOpacity
        style={styles.memberItem}
        onPress={handleCreateGroupChat}
      >
        <View style={styles.memberAvatar}>
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              <Text
                style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}
              >
                👥
              </Text>
            </AvatarFallback>
          </Avatar>
        </View>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>Create Group Chat</Text>
          <Text style={styles.memberEmail}>
            Start a conversation with multiple people
          </Text>
        </View>
      </TouchableOpacity>

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.id}
        renderItem={renderMember}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, color: "#94a3b8" }}>👥</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "No members found matching your search"
                : "No organization members found"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
