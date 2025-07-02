import DashboardHeader from "@/unused/Header";
import NoProjects from "@/components/dashboard/no-projects";
import ProjectCell from "@/components/project/cell";
import { SubscriptionStatus } from "@/components/subscription-status";
import {
  Redirect,
  useNavigation,
  useRouter,
  useFocusEffect,
} from "expo-router";
import {
  ChevronRight,
  Building2,
  ChevronLeft,
  Plus,
} from "lucide-react-native";
import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useGetProjects, Project, useLogout } from "@service-geek/api-client";
import {
  useCurrentUser,
  useActiveOrganization,
} from "@service-geek/api-client";
import type { PaginatedResponse } from "@service-geek/api-client/src/types/common";
import { OrganizationSwitcher } from "@/components/OrganizationSwitcher";
// import { Platform } from "react-native";
// import Constants from "expo-constants";

// const buildNumber = Constants.expoVersion;

export default function Dashboard() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  // const [orgModalVisible, setOrgModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const limit = 20;
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const router = useRouter();

  // useEffect(() => {
  //   if (!user && !isLoadingUser) {
  //     router.replace({ pathname: "/login" });
  //   }
  // }, [user]);
  const [filterObj, setFilterObj] = useState({
    search: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    assigneeIds: [],
  });
  const [filterDialogState, setFilterDialogState] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    assigneeId: "",
  });
  const activeOrganization = useActiveOrganization();
  const result = useGetProjects({
    pagination: {
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
      search: searchTerm,
      assigneeIds: filterObj.assigneeIds,
      startDate: filterObj?.startDate
        ? filterObj?.startDate?.toISOString()
        : undefined,
      endDate: filterObj?.endDate
        ? filterObj?.endDate?.toISOString()
        : undefined,
    },
  });
  const data = result.data as PaginatedResponse<Project> | undefined;
  const isLoading = result.isLoading;
  const isError = result.isError;
  console.log("🚀 ~ Dashboard ~ user:", user, isLoadingUser, isLoading);

  const navigation = useNavigation();
  // const { mutate: logout } = useLogout();

  // Set navigation title
  useEffect(() => {
    // logout();
    navigation.setOptions({ headerTitle: "Dashboard" });
  }, [navigation]);

  const resetAndFetch = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    try {
      await result.refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [result]);

  const filterTabsList = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Started",
      value: "stared",
    },
    {
      label: "My Projects",
      value: "My Projects",
    },
    {
      label: "Archived",
      value: "Archived",
    },
  ];

  // Reset pagination when organization changes
  // useEffect(() => {
  //   if (activeOrganization) {
  //     resetAndFetch();
  //   }
  // }, [activeOrganization]);

  // const handlePageChange = (newPage: number) => {
  //   if (newPage >= 1 && newPage <= (data?.meta?.totalPages || 1)) {
  //     setPage(newPage);
  //   }
  // };

  const renderItem = ({ item: project }: { item: Project }) => (
    <ProjectCell project={project} />
  );

  // const renderPaginationControls = () => {
  //   if (!data?.meta || data.meta.totalPages <= 1) return null;

  //   const { page: currentPage, totalPages, total } = data.meta;
  //   const startItem = (currentPage - 1) * limit + 1;
  //   const endItem = Math.min(currentPage * limit, total);

  //   return (
  //     <View style={styles.paginationWrapper}>
  //       <View style={styles.paginationContent}>
  //         <Text style={styles.paginationInfoText}>
  //           {startItem}-{endItem} of {total}
  //         </Text>

  //         <View style={styles.paginationControls}>
  //           <TouchableOpacity
  //             onPress={() => handlePageChange(currentPage - 1)}
  //             disabled={currentPage === 1 || isLoading}
  //             style={[
  //               styles.pageButton,
  //               styles.pageButtonCompact,
  //               currentPage === 1 && styles.pageButtonDisabled,
  //             ]}
  //           >
  //             <ChevronLeft
  //               size={16}
  //               color={currentPage === 1 ? "#9CA3AF" : "#2563eb"}
  //             />
  //           </TouchableOpacity>

  //           {totalPages <= 3 ? (
  //             // Show all pages if 3 or fewer
  //             Array.from({ length: totalPages }, (_, i) => i + 1).map(
  //               (pageNum) => (
  //                 <TouchableOpacity
  //                   key={pageNum}
  //                   onPress={() => handlePageChange(pageNum)}
  //                   style={[
  //                     styles.pageButton,
  //                     styles.pageButtonCompact,
  //                     pageNum === currentPage && styles.pageButtonActive,
  //                   ]}
  //                 >
  //                   <Text
  //                     style={[
  //                       styles.pageButtonText,
  //                       pageNum === currentPage && styles.pageButtonTextActive,
  //                     ]}
  //                   >
  //                     {pageNum}
  //                   </Text>
  //                 </TouchableOpacity>
  //               )
  //             )
  //           ) : (
  //             // Smart pagination for more than 3 pages
  //             <>
  //               {currentPage > 1 && (
  //                 <TouchableOpacity
  //                   onPress={() => handlePageChange(currentPage - 1)}
  //                   style={[styles.pageButton, styles.pageButtonCompact]}
  //                 >
  //                   <Text style={styles.pageButtonText}>{currentPage - 1}</Text>
  //                 </TouchableOpacity>
  //               )}

  //               <TouchableOpacity
  //                 style={[
  //                   styles.pageButton,
  //                   styles.pageButtonCompact,
  //                   styles.pageButtonActive,
  //                 ]}
  //               >
  //                 <Text
  //                   style={[styles.pageButtonText, styles.pageButtonTextActive]}
  //                 >
  //                   {currentPage}
  //                 </Text>
  //               </TouchableOpacity>

  //               {currentPage < totalPages && (
  //                 <TouchableOpacity
  //                   onPress={() => handlePageChange(currentPage + 1)}
  //                   style={[styles.pageButton, styles.pageButtonCompact]}
  //                 >
  //                   <Text style={styles.pageButtonText}>{currentPage + 1}</Text>
  //                 </TouchableOpacity>
  //               )}
  //             </>
  //           )}

  //           <TouchableOpacity
  //             onPress={() => handlePageChange(currentPage + 1)}
  //             disabled={currentPage === totalPages || isLoading}
  //             style={[
  //               styles.pageButton,
  //               styles.pageButtonCompact,
  //               currentPage === totalPages && styles.pageButtonDisabled,
  //             ]}
  //           >
  //             <ChevronRight
  //               size={16}
  //               color={currentPage === totalPages ? "#9CA3AF" : "#2563eb"}
  //             />
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // if (!user || !isLoadingUser) {
  //   return <Redirect href="/login" />;
  // }

  const renderEmpty = () => {
    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Error loading projects. Please try again.
          </Text>
          <TouchableOpacity onPress={resetAndFetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchTerm.length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No projects found matching "{searchTerm}"
          </Text>
        </View>
      );
    }
    return <NoProjects />;
  };

  if (isLoading && !data?.data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View
            style={styles.headerTitle}
            className="mb-4 flex flex-row items-center "
          >
            {/* <TouchableOpacity
              onPress={() => setOrgModalVisible(true)}
              style={styles.orgButton}
            >
              <Building2 size={16} color="#2563eb" style={{ marginRight: 4 }} />
              <Text style={styles.orgButtonText}>
                {activeOrganization?.name || "Select Org"}
              </Text>
              <ChevronRight
                size={16}
                color="#2563eb"
                style={{ marginLeft: 2 }}
              />
            </TouchableOpacity> */}
            <Text className="font-bold text-3xl mx-2">Projects</Text>
          </View>
          <DashboardHeader
            refetch={setSearchTerm}
            selectedUser=""
            setSelectedUser={() => {}}
            filterObj={filterObj}
            setFilterObj={setFilterObj}
            filterDialogState={filterDialogState}
            setFilterDialogState={setFilterDialogState}
          />
        </View>
        {/* <OrganizationSwitcher
          visible={orgModalVisible}
          onClose={() => setOrgModalVisible(false)}
        /> */}
        <SubscriptionStatus />

        <View style={styles.mainContainer}>
          <FlatList
            data={data?.data}
            renderItem={renderItem}
            keyExtractor={(item) => `project-${item?.id}`}
            contentContainerStyle={[
              styles.content,
              !data?.data?.length && styles.emptyContent,
            ]}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={resetAndFetch}
                colors={["#2563eb"]}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
          {/* {renderPaginationControls()} */}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/projects/new-project")}
          style={styles.fabButton}
        >
          <Plus size={30} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 50,
    flexGrow: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#1d1d1d",
    marginTop: 15,
  },

  orgButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f6ff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orgButtonText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 14,
  },
  mainContainer: {
    flex: 1,
    position: "relative",
  },
  paginationWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 80,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paginationContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationInfoText: {
    fontSize: 13,
    color: "#6b7280",
    marginRight: 8,
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pageButton: {
    minWidth: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  pageButtonCompact: {
    minWidth: 24,
    height: 24,
  },
  pageButtonActive: {
    backgroundColor: "#2563eb",
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  pageButtonTextActive: {
    color: "#ffffff",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#2563eb",
    borderRadius: 6,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  fabButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    position: "absolute",
    bottom: 20,
    right: 15,
    height: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    backgroundColor: "#2563eb",
    borderRadius: 100,
  },
  fabButtonText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "bold",
  },
});
