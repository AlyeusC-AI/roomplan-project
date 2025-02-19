import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Box,
  Heading,
  VStack,
  View,
  Pressable,
  Divider,
  Spinner,
  useToast,
} from "native-base";
import React, { useEffect, useState } from "react";
import { userStore } from "@/lib/state/user";
import { RootStackParamList } from "../../types/Navigation";
import { api } from "../utils/api";
import * as Clipboard from "expo-clipboard";

import { Linking } from "react-native";
import { useDebounce } from "../utils/debounce";

import AssigneeSelect from "../components/project/assignee";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Cog,
  EllipsisVertical,
  Mail,
  Map,
  Phone,
  StickyNote,
} from "lucide-react-native";

export default function ProjectOverview({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const { session: supabaseSession } = userStore((state) => state);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const toast = useToast();

  const debouncedName = useDebounce(name);
  const debouncedNumber = useDebounce(number);
  const debouncedEmail = useDebounce(email);
  const debouncedAddress = useDebounce(location);
  const projectPublicId = (route?.params as { projectId: string })
    .projectId as string;

  const updateProjectInformation =
    api.mobile.updateProjectInformation.useMutation();
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId,
  };

  useEffect(() => {
    updateProjectInformation.mutate({
      ...queryParams,
      clientName: debouncedName,
    });
  }, [debouncedName]);

  useEffect(() => {
    updateProjectInformation.mutate({
      ...queryParams,
      clientPhoneNumber: debouncedNumber,
    });
  }, [debouncedNumber]);

  useEffect(() => {
    updateProjectInformation.mutate({
      ...queryParams,
      clientEmail: debouncedEmail,
    });
  }, [debouncedEmail]);

  useEffect(() => {
    updateProjectInformation.mutate({
      ...queryParams,
      location: debouncedAddress,
    });
  }, [debouncedAddress]);

  const projectOverviewDataQuery =
    api.mobile.getProjectOverviewData.useQuery(queryParams);
  const { lat, lng } = projectOverviewDataQuery.data?.project || {};

  const openInMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${projectOverviewDataQuery.data?.project?.location}`
    );
  };

  const copyText = async (str?: string) => {
    if (!str) return;
    try {
      await Clipboard.setStringAsync(str);
      toast.show({
        description: "Copied to clipboard!",
        bottom: "16",
        duration: 2000,
      });
    } catch (e) {
      console.error("could not copy");
    }
  };

  const assignees =
    projectOverviewDataQuery.data?.project?.projectAssignees || [];
  const allMembers = projectOverviewDataQuery.data?.teamMembers || [];

  if (projectOverviewDataQuery.isLoading && !projectOverviewDataQuery.data)
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
        <View
          display="flex"
          flexDirection="row"
          w="full"
          justifyContent="space-between"
          my={2}
        >
          <Heading size="md">
            {projectOverviewDataQuery?.data?.project?.clientName}
          </Heading>
          <Pressable
            onPress={() =>
              navigation.navigate("Edit Project", {
                projectId: projectPublicId,
              })
            }
          >
            <EllipsisVertical height={24} width={24} color="#000" />
          </Pressable>
        </View>
        <Pressable
          onPress={openInMaps}
          onLongPress={() =>
            copyText(projectOverviewDataQuery?.data?.project?.location)
          }
          display="flex"
          flexDirection="row"
        >
          <Map height={24} width={24} />
          <Heading size="sm" color="blue.500" ml={2}>
            {projectOverviewDataQuery?.data?.project?.location || ""}
          </Heading>
        </Pressable>
        {projectOverviewDataQuery.data?.project?.clientEmail ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `mailto:${projectOverviewDataQuery?.data?.project?.clientEmail}`
              )
            }
            onLongPress={() =>
              copyText(projectOverviewDataQuery?.data?.project?.clientEmail)
            }
            display="flex"
            flexDirection="row"
          >
            <Mail height={24} width={24} />
            <Heading size="sm" color="blue.500" ml={2}>
              {projectOverviewDataQuery?.data?.project?.clientEmail || ""}
            </Heading>
          </Pressable>
        ) : (
          <View display="flex" flexDirection="row">
            <Mail height={24} width={24} />
            <Heading size="sm" color="blue.500" ml={2}>
              --
            </Heading>
          </View>
        )}
        {projectOverviewDataQuery.data?.project?.clientPhoneNumber ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `tel:${projectOverviewDataQuery?.data?.project?.clientPhoneNumber}`
              )
            }
            onLongPress={() =>
              copyText(
                projectOverviewDataQuery?.data?.project?.clientPhoneNumber
              )
            }
            display="flex"
            flexDirection="row"
          >
            <Phone height={24} width={24} />
            <Heading size="sm" color="blue.500" ml={2}>
              {projectOverviewDataQuery?.data?.project?.clientPhoneNumber || ""}
            </Heading>
          </Pressable>
        ) : (
          <View display="flex" flexDirection="row">
            <Phone height={24} width={24} />
            <Heading size="sm" color="blue.500" ml={2}>
              --
            </Heading>
          </View>
        )}
        <AssigneeSelect
          projectAssignees={assignees}
          teamMembers={allMembers}
          projectPublicId={projectPublicId}
        />
        <Divider mb={1} />
        <Pressable
          w="full"
          onPress={() =>
            navigation.navigate("Photos", {
              projectId: projectPublicId,
              projectName:
                projectOverviewDataQuery?.data?.project?.clientName || "",
            })
          }
        >
          <View
            w="full"
            borderWidth={1}
            borderColor="gray.200"
            p={4}
            rounded="md"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
          >
            <View display="flex" flexDirection="row" alignItems="center">
              <Camera height={24} width={24} />
              <Heading size="sm" ml={4}>
                View Photos
              </Heading>
            </View>
            <View color="gray.900">
              <ArrowRight height={24} width={24} color="#525252" />
            </View>
          </View>
        </Pressable>
        <Pressable
          w="full"
          onPress={() =>
            navigation.navigate("Edit Insurance", {
              projectId: projectPublicId,
              projectName:
                projectOverviewDataQuery?.data?.project?.clientName || "",
            })
          }
        >
          <View
            w="full"
            borderWidth={1}
            borderColor="gray.200"
            p={4}
            rounded="md"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
          >
            <View display="flex" flexDirection="row" alignItems="center">
              <Cog height={24} width={24} />
              <Heading size="sm" ml={4}>
                Insurance Adjuster
              </Heading>
            </View>
            <View color="gray.900">
              <ArrowRight height={24} width={24} color="#525252" />
            </View>
          </View>
        </Pressable>
        <Pressable
          w="full"
          onPress={() =>
            navigation.navigate("Readings", {
              projectId: projectPublicId,
              projectName:
                projectOverviewDataQuery?.data?.project?.clientName || "",
            })
          }
        >
          <View
            w="full"
            borderWidth={1}
            borderColor="gray.200"
            p={4}
            rounded="md"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
          >
            <View display="flex" flexDirection="row" alignItems="center">
              <BookOpen height={24} width={24} />
              <Heading size="sm" ml={4}>
                View Room Readings
              </Heading>
            </View>
            <View color="gray.900">
              <ArrowRight height={24} width={24} color="#525252" />
            </View>
          </View>
        </Pressable>
        <Pressable
          w="full"
          mb={1}
          onPress={() =>
            navigation.navigate("Notes", {
              projectId: projectPublicId,
              projectName:
                projectOverviewDataQuery?.data?.project?.clientName || "",
            })
          }
        >
          <View
            w="full"
            borderWidth={1}
            borderColor="gray.200"
            p={4}
            rounded="md"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
          >
            <View display="flex" flexDirection="row" alignItems="center">
              <StickyNote height={24} width={24} />
              <Heading size="sm" ml={4}>
                View Room Notes
              </Heading>
            </View>
            <View color="gray.900">
              <ArrowRight height={24} width={24} color="#525252" />
            </View>
          </View>
        </Pressable>
        <Divider />
        {/* <ProjectNotes /> */}
      </VStack>
    </Box>
  );
}
