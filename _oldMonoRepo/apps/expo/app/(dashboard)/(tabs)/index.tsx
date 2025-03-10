import DashboardHeader from "@/unused/Header";
import NoProjects from "@/components/dashboard/no-projects";
import ProjectCell from "@/components/project/cell";
import { userStore } from "@/lib/state/user";
import { Redirect, useNavigation, useRouter } from "expo-router";
import { ChevronRight, Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { projectsStore } from "@/lib/state/projects";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { session, setSession } = userStore((state) => state);

  const [loading, setLoading] = useState(true);
  const { projects, setProjects } = projectsStore((state) => state);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const router = useRouter();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Dashboard" });
  }, [navigation]);

  useEffect(() => {
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   setSession(session);
    //   fetchProjects();
    // });

    supabase.auth.setSession(session);

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      fetchProjects();
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedUser]);

  function fetchProjects() {
    setLoading(true);
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects?${
        searchTerm.length > 0 && `query=${searchTerm}`
      }`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": `${session?.access_token}`,
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setProjects(data.projects);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error(err);
        // router.replace("/login");
      });
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const noProjects = projects && projects.length === 0;

  if (noProjects && searchTerm.length === 0) {
    return <NoProjects />;
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
          <View
            style={styles.headerTitle}
            className="mt-4 flex flex-row items-center space-x-8"
          >
            <Text className=" font-bold text-3xl mx-2">My Projects</Text>
            <ChevronRight color="#2563eb" />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchProjects} />
          }
        >
          {projects &&
            projects.map((project, index) => {
              return <ProjectCell project={project} key={index} />;
            })}
        </ScrollView>
        <TouchableOpacity
          onPress={() => router.push("/projects/new-project")}
          style={{
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
          }}
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
