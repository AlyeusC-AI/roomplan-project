import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import {
  useGetOrganizationMembers,
  chatService,
  ChatType,
  OrganizationMembership,
  useCurrentUser,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  backButtonText: {
    color: "#15438e",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
    color: "#64748b",
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  sectionHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  memberItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  memberItemPressed: {
    backgroundColor: "#f8fafc",
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  memberStatus: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  groupChatItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  groupChatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  groupChatIcon: {
    fontSize: 24,
    color: "#ffffff",
  },
  chevronIcon: {
    fontSize: 18,
    color: "#cbd5e1",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    color: "#cbd5e1",
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    color: "#ef4444",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useGetOrganizationMembers();

  const handleStartPrivateChat = async (member: any) => {
    if (isCreatingChat) return;

    try {
      setIsCreatingChat(true);
      toast.loading("Creating chat...");

      // Backend will automatically add current user to participants
      const chat = await chatService.createPrivateChat(member.user.id);

      toast.dismiss();
      toast.success("Chat created successfully!");

      // Navigate to the chat
      router.push(`/chats/${chat.id}`);
    } catch (error) {
      console.error("Failed to create private chat:", error);
      toast.dismiss();
      toast.error("Failed to create chat. Please try again.");
    } finally {
      setIsCreatingChat(false);
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

            if (isCreatingChat) return;

            try {
              setIsCreatingChat(true);
              toast.loading("Creating group chat...");

              // Backend will automatically add current user to participants
              // For now, create an empty group chat (just the current user)
              // You might want to add member selection later
              const chat = await chatService.createGroupChat(groupName, []);

              toast.dismiss();
              toast.success("Group chat created successfully!");

              // Navigate to the chat
              router.push(`/chats/${chat.id}`);
            } catch (error) {
              console.error("Failed to create group chat:", error);
              toast.dismiss();
              toast.error("Failed to create group chat. Please try again.");
            } finally {
              setIsCreatingChat(false);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const filteredMembers =
    members?.data?.filter((member: OrganizationMembership) => {
      if (
        (currentUser && member.user.id === currentUser.id) ||
        member.status !== "ACTIVE"
      ) {
        return false;
      }
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const memberName = `${member.user.firstName} ${member.user.lastName}`;
      const memberEmail = member.user.email;

      return (
        memberName.toLowerCase().includes(searchLower) ||
        memberEmail.toLowerCase().includes(searchLower)
      );
    }) || [];

  const renderMember = ({ item: member }: { item: any }) => (
    <TouchableOpacity
      style={[styles.memberItem, isCreatingChat && styles.memberItemPressed]}
      onPress={() => handleStartPrivateChat(member)}
      disabled={isCreatingChat}
    >
      <View style={styles.memberAvatar}>
        <Avatar style={{ width: 48, height: 48, borderRadius: 24 }}>
          {member.user.avatar ? (
            <AvatarImage source={{ uri: member.user.avatar }} />
          ) : (
            <AvatarFallback style={{ width: 48, height: 48, borderRadius: 24 }}>
              <Text
                style={{ color: "#64748b", fontSize: 18, fontWeight: "600" }}
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
        {/* <Text style={styles.memberStatus}>Available</Text> */}
      </View>
      <Text style={styles.chevronIcon}>›</Text>
    </TouchableOpacity>
  );

  const renderGroupChatOption = () => (
    <TouchableOpacity
      style={[styles.groupChatItem, isCreatingChat && styles.memberItemPressed]}
      onPress={handleCreateGroupChat}
      disabled={isCreatingChat}
    >
      <View style={styles.groupChatAvatar}>
        <Text style={styles.groupChatIcon}>👥</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>Create Group Chat</Text>
        <Text style={styles.memberEmail}>
          Start a conversation with multiple people
        </Text>
      </View>
      <Text style={styles.chevronIcon}>›</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load members</Text>
          <Text style={styles.emptyStateSubtext}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Group Chat Option */}
      {/* {renderGroupChatOption()} */}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Organization Members ({filteredMembers.length})
        </Text>
      </View>

      {/* Members List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={(member) => member.id}
        renderItem={renderMember}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "No members found matching your search"
                : "No organization members found"}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Contact your administrator to add members"}
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
