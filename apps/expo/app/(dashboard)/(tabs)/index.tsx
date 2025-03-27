import DashboardHeader from "@/unused/Header";
import NoProjects from "@/components/dashboard/no-projects";
import ProjectCell from "@/components/project/cell";
import { userStore } from "@/lib/state/user";
import {
  Redirect,
  useNavigation,
  useRouter,
  useFocusEffect,
} from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
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
import { projectsStore } from "@/lib/state/projects";
import { supabase } from "@/lib/supabase";
// import { Platform } from "react-native";
// import Constants from "expo-constants";

// const buildNumber = Constants.expoVersion;

interface Project {
  id: string;
  name: string;
  description?: string;
  // Add other project properties as needed
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export default function Dashboard() {
  const { session, setSession } = userStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { projects, setProjects } = projectsStore((state) => state);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [total, setTotal] = useState(0);
  console.log("🚀 ~ Dashboard ~ total:", total);
  const [page, setPage] = useState(0);
  console.log("🚀 ~ Dashboard ~ page:", page);
  const limit = 100;
  const hasMore = projects?.length < total;
  console.log("🚀 ~ Dashboard ~ hasMore:", hasMore);

  const router = useRouter();
  const navigation = useNavigation();

  // Add focus effect to refetch data
  useFocusEffect(
    useCallback(() => {
      if (projects?.length > 0) {
        fetchProjects(false); // Don't clear projects on focus refetch
      }
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Dashboard" });
  }, [navigation]);

  useEffect(() => {
    supabase.auth.setSession(session);

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      fetchProjects(false);
    });
  }, []);

  // Reset and fetch when search or user filter changes
  useEffect(() => {
    resetAndFetch();
  }, [searchTerm, selectedUser]);

  const resetAndFetch = useCallback(async () => {
    setPage(0);
    // setProjects([]);
    await fetchProjects(false);
  }, [searchTerm, selectedUser]);

  async function fetchProjects(isLoadingMore: boolean) {
    console.log("🚀 ~ fetchProjects ~ loading:", loading);

    if (loadingMore || loading) return;

    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const currentPage = isLoadingMore ? page : 0;
    console.log("🚀 ~ fetchProjects ~ currentPage:", currentPage);
    const offset = currentPage * limit;
    console.log("🚀 ~ fetchProjects ~ offset:", offset);

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects?${
          searchTerm.length > 0 ? `query=${searchTerm}&` : ""
        }limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${session?.access_token}`,
          },
        }
      );
      const data: ProjectsResponse = await res.json();
      console.log("🚀 ~ fetchProjects ~ res:", data);

      if (isLoadingMore) {
        setProjects(
          [...projects, ...data.projects].reduce((acc, curr) => {
            const existingIndex = acc.findIndex((p) => p.id === curr.id);
            if (existingIndex !== -1) {
              acc[existingIndex] = curr;
            } else {
              acc.push(curr);
            }
            return acc;
          }, [])
        );
      } else {
        setProjects(data.projects);
      }
      setLoading(false);

      setTotal(data.total);
    } catch (err) {
      setLoading(false);

      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const loadMore = useCallback(() => {
    console.log("🚀 ~ loadMore ~ loadingMore:", loadingMore);

    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
      fetchProjects(true);
    }
  }, [loadingMore, hasMore]);

  const renderFooter = () => {
    if (!loadingMore || !hasMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#2563eb" />
        <Text style={styles.loadingMoreText}>Loading more projects...</Text>
      </View>
    );
  };

  const renderItem = ({ item: project }: { item: Project }) => (
    <ProjectCell project={project} />
  );

  if (!session) {
    return <Redirect href="/login" />;
  }

  const renderEmpty = () => {
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

  if (loading && !projects?.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <DashboardHeader
            refetch={setSearchTerm}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
          <Text>
            v1.2.66 
            {/* ({buildNumber}) */}
          </Text>
          <View
            style={styles.headerTitle}
            className="mt-4 flex flex-row items-center space-x-8"
          >
            <Text className="font-bold text-3xl mx-2">My Projects</Text>
            <ChevronRight color="#2563eb" />
          </View>
        </View>

        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => `project-${item?.id}`}
          contentContainerStyle={[
            styles.content,
            !projects?.length && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={resetAndFetch} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />

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
    paddingBottom: 20,
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
  /** Header */
  header: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#1d1d1d",
    marginTop: 15,
  },
  loadingMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingMoreText: {
    color: "#6b7280",
    fontSize: 14,
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
    backgroundColor: "#1e88e5",
    borderRadius: 100,
  },
});

// import { useEffect, useState } from "react";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import React from "react";
// import ProjectListItem from "@/components/project/project-cell";
// import DashboardHeader from "@/components/dashboard/Header";
// import { userStore } from "@/utils/state/user";
// import { useNavigation, useRouter } from "expo-router";
// import NoProjects from "@/components/dashboard/no-projects";
// import { Plus } from "lucide-react-native";

// export default function Dashboard() {
//   const { session: supabaseSession } = userStore((state) => state);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedUser, setSelectedUser] = useState("");

//   const router = useRouter();

//   const onPress = (projectId: string, projectName: string) => {
//     // navigation.navigate("Project", { projectName, projectId });
//   };

//   const onCreateProject = () => {
//     // navigation.navigate("CreateProject");
//   };

//   const navigation = useNavigation();

//   useEffect(() => {
//     navigation.setOptions({ headerTitle: "Dashboard" });
//   }, [navigation]);

//   const dashboardQuery = api.mobile.getDashboardData.useQuery({
//     page: 0,
//     jwt: supabaseSession ? supabaseSession["access_token"] : "null",
//     searchTerm,
//     userIdFilter: selectedUser,
//   });

//   const noProjects =
//     !dashboardQuery.isLoading &&
//     dashboardQuery.data &&
//     dashboardQuery.data.data.length === 0;

//   if (dashboardQuery.data?.showOrganizationSetup) {
//     return router.push("/org-setup");
//   }

//   if (noProjects) {
//     return <NoProjects />;
//   }

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <>
//           <DashboardHeader
//             isFetchingProjects={dashboardQuery.isLoading}
//             teamMembers={dashboardQuery.data?.teamMembers || []}
//             refetch={(s: string) => setSearchTerm(s)}
//             selectedUser={selectedUser}
//             setSelectedUser={setSelectedUser}
//           />
//           {/* <FlatList
//             data={dashboardQuery.data?.data}
//             keyExtractor={(item) => item.publicId}
//             renderItem={({ item }) => (

//             )}
//             w="full"
//             paddingX={4}
//             refreshing={dashboardQuery.isFetching}
//             onRefresh={dashboardQuery.refetch}
//           /> */}
//           <ProjectListItem
//                 projects={dashboardQuery.data?.data ?? []}
//                 onPress={onPress}
//                 urlMap={dashboardQuery.data?.urlMap}
//               />
//           <Fab
//             onPress={() => onCreateProject()}
//             renderInPortal={false}
//             shadow={2}
//             size="sm"
//             icon={<Plus size={26} color="white" />}
//           />
//         </>
//     </TouchableWithoutFeedback>
//   );
// }
