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
import React, { useEffect, useState, useCallback, useRef } from "react";
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
import { api } from "@/lib/api";
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
  // State
  const { session, setSession } = userStore((state) => state);
  const { projects, setProjects } = projectsStore((state) => state);
  const [loading, setLoading] = useState(false);
  console.log("🚀 ~ Dashboard ~ loading:", loading)
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;
  const hasMore = projects?.length < total;
  
  // // Refs to avoid stale closures
  // const sessionRef = useRef(session);
  // const searchTermRef = useRef(searchTerm);
  // const selectedUserRef = useRef(selectedUser);
  // const pageRef = useRef(page);
  // const projectsRef = useRef(projects);
  
  // // Update refs when values change
  // useEffect(() => {
  //   sessionRef.current = session;
  //   searchTermRef.current = searchTerm;
  //   selectedUserRef.current = selectedUser;
  //   pageRef.current = page;
  //   projectsRef.current = projects;
  // }, [session, searchTerm, selectedUser, page, projects]);

  const router = useRouter();
  const navigation = useNavigation();

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({ headerTitle: "Dashboard" });
  }, [navigation]);

  // Fetch projects function that doesn't depend on state variables directly
  const fetchProjects = useCallback(async (isLoadingMore: boolean|number) => {
    // Use refs instead of state directly to avoid dependency cycles
    // const currentSession = sessionRef.current;
    // const currentSearchTerm = searchTermRef.current;
    // const currentPage = isLoadingMore ? pageRef.current : 0;
    // const currentProjects = projectsRef.current || [];
    const currentSession = session;
    const currentSearchTerm = searchTerm;
    const currentPage = isLoadingMore || 0;
    const currentProjects = projects || [];
    console.log("🚀 ~ fetchProjects ~ currentPage:", currentPage)

    if (loadingMore || loading) return;
    if (!currentSession) {
      console.log("No session available, skipping fetch");
      return;
    }

    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const offset = currentPage * limit;

    try {
      const res = await api.get(
        `/api/v1/projects?${
          currentSearchTerm.length > 0 ? `query=${currentSearchTerm}&` : ""
        }limit=${limit}&offset=${offset}`
      );
      
      if (res.status !== 200) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data: ProjectsResponse = res.data;

      if (isLoadingMore) {
        setProjects(
          [...currentProjects, ...data.projects].reduce((acc: Project[], curr) => {
            const existingIndex = acc.findIndex((p) => p.id === curr.id);
            if (existingIndex !== -1) {
              acc[existingIndex] = curr;
            } else {
              acc.push(curr);
            }
            return acc;
          }, [] as Project[])
        );
      } else {
        setProjects(data.projects);
      }

      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [loading, loadingMore, limit]);

  // Initialize Supabase and load initial data
  useEffect(() => {
    const initializeData = async () => {
      if (session) {
        try {
          await supabase.auth.setSession(session);
          fetchProjects(false);
        } catch (error) {
          console.error("Error initializing:", error);
        }
      }
    };

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchProjects(false);
      }
    });

    initializeData();

    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        setPage(0);
        fetchProjects(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedUser, session]);

  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      if (projects?.length > 0 && session) {
        setLoading(false);
        fetchProjects(false);
      }
    }, [])
  );

  const resetAndFetch = useCallback(() => {
    setPage(0);
    fetchProjects(false);
  }, []);

  const loadMore = () => {
    console.log("🚀 ~ loadMore ~ hasMore:", hasMore,loadingMore)

    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
      fetchProjects(page+1);
    }
  };

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
          {/* <Text>
            v1.2.66 
          </Text> */}
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
          // onEndReachedThreshold={0.3}
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