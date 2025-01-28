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
import React from "react";
import { userStore } from "@/utils/state/user";
import { api } from "@/utils/api";
import * as Clipboard from "expo-clipboard";

import { Linking } from "react-native";

import AssigneeSelect from "@/components/project/assignee";
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
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";

export default function ProjectOverview() {
  const { session: supabaseSession } = userStore((state) => state);

  const { projectId, projectName } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const toast = useToast();

  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId: projectId,
  };

  const projectOverviewDataQuery =
    api.mobile.getProjectOverviewData.useQuery(queryParams);

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
        {projectOverviewDataQuery.data?.project?.lat &&
          projectOverviewDataQuery.data?.project?.lng && (
            <MapView
              scrollEnabled={false}
              style={{
                height: 100,
                width: "90%",
                marginHorizontal: 16,
                marginTop: 10,
                borderRadius: 12,
              }}
              initialRegion={{
                latitude: parseFloat(
                  projectOverviewDataQuery.data?.project?.lat
                ),
                longitude: parseFloat(
                  projectOverviewDataQuery.data?.project?.lng
                ),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(
                    projectOverviewDataQuery.data?.project?.lat
                  ),
                  longitude: parseFloat(
                    projectOverviewDataQuery.data?.project?.lng
                  ),
                }}
                title={projectOverviewDataQuery.data.project.clientName ?? ""}
              />
            </MapView>
          )}
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
          projectPublicId={projectId}
        />
        <Divider mb={1} />
        <Pressable
          w="full"
          onPress={() =>
            router.push({
              pathname: "./photos",
              params: {
                projectName:
                  projectOverviewDataQuery?.data?.project?.clientName || "",
              },
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
            router.push({
              pathname: "../edit-insurance",
              params: {
                projectName:
                  projectOverviewDataQuery?.data?.project?.clientName || "",
              },
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
            router.push({
              pathname: "./readings",
              params: {
                projectName:
                  projectOverviewDataQuery?.data?.project?.clientName || "",
              },
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
            router.push({
              pathname: "./notes",
              params: {
                projectName:
                  projectOverviewDataQuery?.data?.project?.clientName || "",
              },
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
