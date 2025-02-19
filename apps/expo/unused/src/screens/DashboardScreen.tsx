import { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { Box, Text, Center, Heading, FlatList, AddIcon } from "native-base";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Fab } from "native-base";
import { api } from "../utils/api";
import OrganizationSetup from "../components/dashboard/OrganizationSetup";
import ProjectListItem from "../components/ProjectListItem";
import DashboardHeader from "../components/dashboard/Header";
import { userStore } from "../../../lib/state/user";

export default function Dashboard({
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const { session: supabaseSession } = userStore((state) => state);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const onPress = (projectId: string, projectName: string) => {
    navigation.navigate("Project", { projectName, projectId });
  };

  const onCreateProject = () => {
    navigation.navigate("CreateProject");
  };

  const dashboardQuery = api.mobile.getDashboardData.useQuery({
    page: 0,
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    searchTerm,
    userIdFilter: selectedUser,
  });

  dashboardQuery.data?.teamMembers;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} bg="white" alignItems="flex-start">
        <>
          {dashboardQuery.data?.showOrganizationSetup ? (
            <OrganizationSetup
              isRefetching={dashboardQuery.isLoading}
              onComplete={() => {
                dashboardQuery.refetch();
              }}
            />
          ) : (
            <>
              <DashboardHeader
                isFetchingProjects={dashboardQuery.isLoading}
                teamMembers={dashboardQuery.data?.teamMembers || []}
                refetch={(s: string) => setSearchTerm(s)}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
              {!dashboardQuery.isLoading &&
                dashboardQuery.data &&
                dashboardQuery.data.data.length === 0 && (
                  <Center w="full" flex={1}>
                    <Heading>No Projects</Heading>
                    <Text my={4} textAlign="center">
                      Click the plus icon below to create your first project
                    </Text>
                  </Center>
                )}
              <FlatList
                data={dashboardQuery.data?.data}
                keyExtractor={(item) => item.publicId}
                renderItem={({ item }) => (
                  <ProjectListItem
                    key={item.publicId}
                    project={item}
                    onPress={onPress}
                    urlMap={dashboardQuery.data?.urlMap}
                  />
                )}
                w="full"
                paddingX={4}
                refreshing={dashboardQuery.isFetching}
                onRefresh={dashboardQuery.refetch}
              />
              <Fab
                onPress={() => onCreateProject()}
                renderInPortal={false}
                shadow={2}
                size="sm"
                icon={<AddIcon size={26} color="white" />}
              />
            </>
          )}
        </>
      </Box>
    </TouchableWithoutFeedback>
  );
}
