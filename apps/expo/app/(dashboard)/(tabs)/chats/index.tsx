import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";
import {
  useGetUserChats,
  useGetOrganizationMembers,
  useActiveOrganization,
  useCurrentUser,
  chatService,
  ChatType,
  OrganizationMembership,
} from "@service-geek/api-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { formatDistanceToNow } from "date-fns";

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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
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
  membersSection: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  membersList: {
    paddingHorizontal: 16,
  },
  memberItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
  chatsSection: {
    flex: 1,
  },
  chatItem: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
  },
  chatPreview: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 18,
  },
  chatType: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
    textTransform: "uppercase",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#15438e",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

interface ChatItemProps {
  chat: any;
  onPress: (chat: any) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, onPress }) => {
  const { data: currentUser } = useCurrentUser();

  const getChatName = (chat: any) => {
    if (chat.type === ChatType.PRIVATE) {
      const otherParticipant = chat.participants?.find(
        (p: any) => p.user.id !== currentUser?.id
      );
      return otherParticipant
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : "Private Chat";
    }

    if (chat.type === ChatType.PROJECT && chat.project) {
      // Use client name for project chats, fallback to project name
      return chat.project.clientName || chat.project.name || "Project Chat";
    }

    return chat.name || "Unnamed Chat";
  };

  const getChatAvatar = (chat: any) => {
    if (chat.type === ChatType.PRIVATE) {
      const otherParticipant = chat.participants?.find(
        (p: any) => p.user.id !== currentUser?.id
      );
      return otherParticipant?.user.avatar;
    }
    // For group/project chats, you might want to show a group icon or first participant's avatar
    return chat.participants?.[0]?.user.avatar;
  };

  const getLastMessage = (chat: any) => {
    if (!chat.lastMessage) return "No messages yet";

    const message = chat.lastMessage;
    const senderName = message.user ? `${message.user.firstName}: ` : "";

    let content = "";
    if (message.type === "IMAGE") {
      content = "📷 Image";
    } else if (message.type === "FILE") {
      content = "📎 File";
    } else if (message.type === "SYSTEM") {
      content = message.content;
    } else {
      content = message.content;
    }

    const fullMessage = senderName + content;
    return fullMessage.length > 50
      ? `${fullMessage.substring(0, 50)}...`
      : fullMessage;
  };

  const getChatTypeLabel = (chat: any) => {
    switch (chat.type) {
      case ChatType.PRIVATE:
        return "Private";
      case ChatType.GROUP:
        return "Group";
      case ChatType.PROJECT:
        return "Project";
      default:
        return "Chat";
    }
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={() => onPress(chat)}>
      <View style={styles.chatAvatar}>
        <Avatar style={{ height: 48, width: 48, borderRadius: 24 }}>
          {getChatAvatar(chat) ? (
            <AvatarImage source={{ uri: getChatAvatar(chat) }} />
          ) : (
            <AvatarFallback>
              <Text
                style={{ color: "#64748b", fontSize: 16, fontWeight: "600" }}
              >
                {getChatName(chat).charAt(0)}
              </Text>
            </AvatarFallback>
          )}
        </Avatar>
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {getChatName(chat)}
          </Text>
          {chat.lastMessageAt && (
            <Text style={styles.chatTime}>
              {formatDistanceToNow(new Date(chat.lastMessageAt), {
                addSuffix: true,
              })}
            </Text>
          )}
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {getLastMessage(chat)}
        </Text>
        <Text style={styles.chatType}>{getChatTypeLabel(chat)}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface MemberItemProps {
  member: OrganizationMembership;
  onPress: (member: any) => void;
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onPress }) => {
  console.log("🚀 ~ddddddd member:", member);
  return (
    <TouchableOpacity style={styles.memberItem} onPress={() => onPress(member)}>
      <View style={styles.memberAvatar}>
        <Avatar style={{ height: 48, width: 48, borderRadius: 24 }}>
          {member.user.avatar ? (
            <AvatarImage source={{ uri: member.user.avatar }} />
          ) : (
            <AvatarFallback>
              <Text
                style={{ color: "#64748b", fontSize: 12, fontWeight: "600" }}
              >
                {`${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`}
              </Text>
            </AvatarFallback>
          )}
        </Avatar>
      </View>
      <Text style={styles.memberName} numberOfLines={1}>
        {member.user.firstName}
      </Text>
    </TouchableOpacity>
  );
};

export default function ChatListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetUserChats();
  const { data: members, isLoading: membersLoading } =
    useGetOrganizationMembers();
  const { data: currentUser } = useCurrentUser();

  const handleStartPrivateChat = useCallback(
    async (member: any) => {
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
    },
    [router]
  );

  const handleChatPress = useCallback(
    (chat: any) => {
      if (chat.type === ChatType.PROJECT && chat.projectId) {
        // Navigate to project chat
        router.push(`/projects/${chat.projectId}/(tabs)/chat`);
      } else {
        // Navigate to regular chat
        router.push(`/chats/${chat.id}`);
      }
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchChats();
    } catch (error) {
      console.error("Failed to refresh chats:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchChats]);

  const filteredChats =
    chats?.data?.filter((chat: any) => {
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const chatName =
        chat.type === ChatType.PRIVATE
          ? chat.participants?.find((p: any) => p.user.id !== currentUser?.id)
              ?.user.firstName +
            " " +
            chat.participants?.find((p: any) => p.user.id !== currentUser?.id)
              ?.user.lastName
          : chat.type === ChatType.PROJECT && chat.project
            ? chat.project.clientName || chat.project.name || ""
            : chat.name || "";

      // Check if search matches chat name
      if (chatName.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check if search matches last message content
      if (chat.lastMessage?.content?.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Check if search matches sender name in last message
      if (
        chat.lastMessage?.user?.firstName
          ?.toLowerCase()
          .includes(searchLower) ||
        chat.lastMessage?.user?.lastName?.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      return false;
    }) || [];

  const filteredMembers =
    members?.data?.filter((member: OrganizationMembership) => {
      // Filter out the current user
      if (
        (currentUser && member.user.id === currentUser.id) ||
        member.status !== "ACTIVE"
      ) {
        return false;
      }

      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const memberName = `${member.user.firstName} ${member.user.lastName}`;

      return memberName.toLowerCase().includes(searchLower);
    }) || [];

  if (chatsLoading || membersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#15438e" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View> */}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats and members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <FlatList
        data={[
          { type: "members", data: filteredMembers },
          { type: "chats", data: filteredChats },
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }: { item: any }) => {
          if (item.type === "members" && item.data.length > 0) {
            return (
              <View style={styles.membersSection}>
                <Text style={styles.membersTitle}>Quick Chat</Text>
                <FlatList
                  data={item.data}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(member) => member.user.id}
                  renderItem={({
                    item: member,
                  }: {
                    item: OrganizationMembership;
                  }) => (
                    <MemberItem
                      member={member}
                      onPress={handleStartPrivateChat}
                    />
                  )}
                  contentContainerStyle={styles.membersList}
                />
              </View>
            );
          } else if (item.type === "chats") {
            if (item.data.length === 0) {
              return (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 48, color: "#94a3b8" }}>💬</Text>
                  <Text style={styles.emptyStateText}>
                    {searchQuery
                      ? "No chats found matching your search"
                      : "No chats yet. Start a conversation!"}
                  </Text>
                </View>
              );
            }

            return (
              <View style={styles.chatsSection}>
                {item.data.map((chat: any) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    onPress={handleChatPress}
                  />
                ))}
              </View>
            );
          }
          return null;
        }}
      />

      {/* New Chat Button */}
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => router.push("/chats/new")}
      >
        <Text style={{ color: "#ffffff", fontSize: 24, fontWeight: "bold" }}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}
