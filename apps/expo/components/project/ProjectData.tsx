import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Box, Heading, VStack, View, Text, Spinner } from "native-base";
import React from "react";
import { userStore } from "../../../lib/state/user";
import { RootStackParamList } from "../../types/Navigation";
import { api } from "../../utils/api";

export default function ProjectData({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const { session: supabaseSession } = userStore((state) => state);
  const projectPublicId = (route?.params as { projectId: string })
    .projectId as string;
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId,
  };

  const projectDataQuery = api.mobile.getRoomData.useQuery(queryParams);

  if (projectDataQuery.isLoading && !projectDataQuery.data)
    return (
      <View
        h="full"
        w="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="lg" />
      </View>
    );
  return (
    <Box flex={1} bg="#fff" alignItems="flex-start" padding="4">
      <VStack
        w="full"
        justifyContent="space-between"
        alignItems="flex-start"
        space={2}
      >
        <Heading size="md">Rooms</Heading>
        {projectDataQuery.data?.roomData?.rooms.map((r) => {
          <View key={r.id}>
            <Text>{r.name}</Text>
          </View>;
        })}
      </VStack>
    </Box>
  );
}
