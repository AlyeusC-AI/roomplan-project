import React, { useState } from "react";
import { userStore } from "@/lib/state/user";
import {
  TouchableOpacity,
  ActivityIndicator,
  View,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useGetOrganizationMembers,
  useGetProjectMembers,
  useAddProjectMember,
  useRemoveProjectMember,
  useGetProjectById,
  User,
} from "@service-geek/api-client";
import { Colors } from "@/constants/Colors";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  UserCheckIcon,
  MoreHorizontal,
} from "lucide-react-native";
const ChevronLeftIcon = ChevronLeft as any;
const UserCheckIconComp = UserCheckIcon as any;
const MoreHorizontalIcon = MoreHorizontal as any;

const AssignUsersPage = () => {
  const router = useRouter();
  const {
    projectId,
    clientName: paramClientName,
    projectName: paramProjectName,
  } = useGlobalSearchParams<{
    projectId: string;
    clientName?: string;
    projectName?: string;
  }>();
  const { data: projectData } = useGetProjectById(projectId);
  const project = projectData?.data;
  const clientName = project?.clientName || paramClientName || "Client";
  const projectName = project?.name || paramProjectName || "Project";

  const { data: teamMembersData } = useGetOrganizationMembers();
  const teamMembers = teamMembersData?.data || [];
  const { data: projectMembersData, refetch: refetchProjectMembers } =
    useGetProjectMembers(projectId as string);
  const projectMembers = projectMembersData?.users || [];
  const addProjectMemberMutation = useAddProjectMember();
  const removeProjectMemberMutation = useRemoveProjectMember();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmUnassign, setConfirmUnassign] = useState<null | {
    userId: string;
    userName: string;
  }>(null);
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

  const isAssigned = (userId: string) =>
    projectMembers.some((pm: User) => pm.id === userId);

  const onAssignPress = async (userId: string, alreadyAssigned: boolean) => {
    if (!session?.access_token) return;
    setIsLoading(true);
    try {
      if (alreadyAssigned) {
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

  const handleUserRowPress = (
    member: any,
    assigned: boolean,
    fullName: string
  ) => {
    if (!assigned) {
      onAssignPress(member.user?.id, false);
    }
  };
  const handleMorePress = (member: any, fullName: string) => {
    setConfirmUnassign({ userId: member.user?.id, userName: fullName });
  };

  const renderUser = ({
    item: member,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const assigned = isAssigned(member.user?.id);
    const fullName =
      `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim();
    return (
      <>
        {index !== 0 && <View style={styles.divider} />}
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getUserInitials(member.user!)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {fullName || member.user?.email}
            </Text>
            {/* Show Last Activity instead of email */}
            <Text style={styles.userEmail}>
              Last activity: {member.user?.lastActivity || 0}
            </Text>
            {assigned && (
              <View style={styles.assignedBadgeRow}>
                <View style={styles.assignedBadge}>
                  <UserCheckIconComp size={16} color={Colors.light.primary} />
                  <Text style={styles.assignedBadgeText}>Assigned</Text>
                </View>
              </View>
            )}
          </View>
          {/* 3-dots button for assigned users */}
          {assigned && (
            <TouchableOpacity
              onPress={() =>
                handleMorePress(member, fullName || member.user?.email)
              }
              style={{ padding: 8 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MoreHorizontalIcon size={22} color={Colors.light.primary} />
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with back chevron, client name, and project name */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeftIcon size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.projectName}>{projectName}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>
      <FlatList
        data={[...teamMembers, ...teamMembers, ...teamMembers, ...teamMembers]}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No team members found.</Text>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity
        style={styles.assignButton}
        onPress={() => setIsModalOpen(true)}
      >
        <Text style={styles.assignButtonText}>Assign</Text>
      </TouchableOpacity>
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Users</Text>
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={Colors.light.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={{ maxHeight: 350, marginBottom: 16, width: "100%" }}>
                {filteredMembers.length === 0 ? (
                  <Text style={styles.emptyText}>No members found.</Text>
                ) : (
                  filteredMembers.map((member, index) => {
                    const assigned = isAssigned(member.user?.id);
                    const fullName =
                      `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim();
                    return (
                      <View key={member.id}>
                        {index !== 0 && <View style={styles.modalDivider} />}
                        <TouchableOpacity
                          style={styles.modalUserRow}
                          onPress={() =>
                            onAssignPress(member.user?.id || "", assigned)
                          }
                          disabled={
                            isLoading ||
                            (assigned && member.user?.id === currentUserId)
                          }
                        >
                          <View
                            style={
                              assigned
                                ? styles.modalIconCircleAssigned
                                : styles.modalIconCircleDashed
                            }
                          >
                            <Text
                              style={
                                assigned
                                  ? styles.modalCheckIcon
                                  : styles.modalPlusIcon
                              }
                            >
                              {assigned ? "✓" : "+"}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.userName}>
                              {fullName || member.user?.email}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Confirmation Modal for Unassign */}
      {confirmUnassign && (
        <Modal
          visible={!!confirmUnassign}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmUnassign(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Unassign User</Text>
              <Text style={{ marginBottom: 16, textAlign: "center" }}>
                Are you sure you want to unassign {confirmUnassign.userName}{" "}
                from this project?
              </Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: "#e5e7eb" }]}
                  onPress={() => setConfirmUnassign(null)}
                >
                  <Text
                    style={[
                      styles.closeButtonText,
                      { color: Colors.light.primary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={async () => {
                    setIsLoading(true);
                    await onAssignPress(confirmUnassign.userId, true);
                    setConfirmUnassign(null);
                  }}
                >
                  <Text style={styles.closeButtonText}>Unassign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    fontSize: 26,
    color: Colors.light.primary,
    fontWeight: "700",
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  clientName: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  projectName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginTop: 2,
    transform: "capitalize",
  },
  userCard: {
    // removed background and margin styles
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary + "22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  assignedBadgeUnder: {
    // replaced by assignedBadgeRow and assignedBadge
  },
  assignedBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: Colors.light.primary,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    gap: 4,
  },
  badgeIcon: {
    color: Colors.light.primary,
    fontSize: 13,
    marginRight: 2,
    fontWeight: "bold",
    marginTop: 1,
  },
  assignedBadgeText: {
    color: Colors.light.primary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 2,
  },
  assignButton: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  assignButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  searchInput: {
    width: "100%",
    marginBottom: 12,
  },
  modalUserRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    // width: "100%",
  },
  checkMark: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "bold",
    marginTop: 8,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 24,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: 56, // aligns with start of text after icon
  },
  modalIconCircleDashed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  modalIconCircleAssigned: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  modalPlusIcon: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -1,
  },
  modalCheckIcon: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "bold",
    marginTop: -1,
  },
});

export default AssignUsersPage;
