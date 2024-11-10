import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Heading,
  VStack,
  View,
  Pressable,
  ChevronUpIcon,
  ChevronDownIcon,
  Select,
  CheckIcon,
  Modal,
  Text,
  Actionsheet,
  Divider,
  Spinner,
} from "native-base";
import React, { useEffect, useState } from "react";
import { GridView, TextField } from "react-native-ui-lib";
import { useRecoilState } from "recoil";
import userSessionState from "../../atoms/user";
import { RootStackParamList } from "../../types/Navigation";
import { api } from "../../utils/api";

import { Linking, Platform, StyleSheet } from "react-native";
import { useDebounce } from "@servicegeek/utils";
import Collapsible from "react-native-collapsible";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// @ts-expect-error
import MapIcon from "../../../assets/icons/Map.svg";
// @ts-expect-error
import CameraIcon from "../../../assets/icons/Camera.svg";

// @ts-expect-error
import EnvelopeIcon from "../../../assets/icons/Envelope.svg";
// @ts-expect-error
import PhoneIcon from "../../../assets/icons/Phone.svg";
// @ts-expect-error
import ArrowLongRight from "../../../assets/icons/ArrowLongRight.svg";
import AssigneeSelect from "./AssigneeSelect";

const styles = StyleSheet.create({
  textfield: {
    fontSize: 18,
    borderBottomWidth: 1,
    marginTop: 8,
  },
  container: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default function ProjectData({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const [supabaseSession] = useRecoilState(userSessionState);
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
