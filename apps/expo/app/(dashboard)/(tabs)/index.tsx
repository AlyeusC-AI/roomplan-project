import DashboardHeader from "@/components/dashboard/Header";
import NoProjects from "@/components/dashboard/no-projects";
import ProjectCell from "@/components/project/cell";
import { userStore } from "@/utils/state/user";
import { api } from "@/utils/api";
import { Redirect, useNavigation, useRouter } from "expo-router";
import { Clipboard, Cog, Plus, PlusCircle } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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
import { projectsStore } from "@/utils/state/projects";
import { supabase } from "@/utils/supabase";

export default function Dashboard() {
  const { session, setSession } = userStore((state) => state);

  const { projects, setProjects } = projectsStore((state) => state);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const router = useRouter();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Dashboard" });
  }, [navigation]);

  const dashboardQuery = api.mobile.getDashboardData.useQuery({
    page: 0,
    jwt: session ? session.access_token : "null",
    searchTerm,
    userIdFilter: selectedUser
  }, {
    onSuccess(data) {
      if (searchTerm === "") {
        setProjects(data.data);
      }
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Redirect href="/login" />;
  }

  const noProjects =
    !dashboardQuery.isLoading &&
    dashboardQuery.data &&
    dashboardQuery.data.data.length === 0;

  if (dashboardQuery.data?.showOrganizationSetup) {
    return <Redirect href="/org-setup" />;
  }

  if (noProjects) {
    return <NoProjects />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerAction} />

            <View style={styles.headerAction}>
              <TouchableOpacity
                onPress={() => router.push("/settings")}
              >
                <Cog color="#1e40af" size={24} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.headerTitle}>Project Dashboard</Text>
          <DashboardHeader
            refetch={setSearchTerm}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={dashboardQuery.isFetching}
              onRefresh={dashboardQuery.refetch}
            />
          }
        >
          {(searchTerm === "" ? projects : dashboardQuery.data?.data ?? []).map(
            (project, index) => {
              return (
                <ProjectCell
                  project={project}
                  key={index}
                  urlMap={dashboardQuery.data?.urlMap}
                />
              );
            }
          )}
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
            backgroundColor: "#1e40af",
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
    marginBottom: 12,
  },
  headerTop: {
    marginHorizontal: -6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
  },
});

// import { useEffect, useState } from "react";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import { Box, FlatList } from "native-base";
// import React from "react";
// import { Fab } from "native-base";
// import { api } from "@/utils/api";
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
