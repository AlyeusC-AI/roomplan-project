import { Box, HStack, Image, Pressable, Spacer, Text, View } from "native-base";
import React from "react";
import { formatDistance } from "date-fns";
import { ColorSchemeType } from "native-base/lib/typescript/components/types";
import Address from "./Address";
import { Platform } from "react-native";
import { RouterOutputs } from "@restorationx/api";
import safelyGetImageUrl from "../utils/safelyGetImageKey";

// @ts-expect-error
import MapLogo from "../../assets/icons/Map.svg";

const getColorScheme = (
  status: RouterOutputs["mobile"]["getDashboardData"]["data"][0]["status"]
): ColorSchemeType => {
  if (status === "active") {
    return "green";
  }
  if (status === "inactive") {
    return "gray";
  }
  if (status === "incomplete") {
    return "red";
  }
  if (status === "completed") {
    return "darkBlue";
  }
  if (status === "inspection") {
    return "cyan";
  }
  if (status === "mitigation") {
    return "purple";
  }
  if (status === "review") {
    return "orange";
  }
};

const getBorderColor = (
  status: RouterOutputs["mobile"]["getDashboardData"]["data"][0]["status"]
): ColorSchemeType => {
  if (status === "active") {
    return "#4caf50";
  }
  if (status === "inactive") {
    return "#546e7a";
  }
  if (status === "incomplete") {
    return "red";
  }
  if (status === "completed") {
    return "primary.800";
  }
  if (status === "inspection") {
    return "#00838f";
  }
  if (status === "mitigation") {
    return "#9c27b0";
  }
  if (status === "review") {
    return "#ef6c00";
  }
};

export default function ProjectListItem({
  project,
  onPress,
  urlMap,
}: {
  project: RouterOutputs["mobile"]["getDashboardData"]["data"][0];
  onPress: (projectId: string, projectName: string) => void;
  urlMap: RouterOutputs["mobile"]["getDashboardData"]["urlMap"];
}) {
  return (
    <View m={1}>
      <Box
        alignItems="center"
        w="full"
        rounded={4}
        {...(Platform.OS === "ios" && { shadow: 4 })}
      >
        <Pressable
          onPress={() => onPress(project.publicId, project.clientName)}
          borderLeftWidth={4}
          borderLeftColor={getBorderColor(project.status)}
          overflow="hidden"
          rounded={4}
          shadow="4"
          {...(Platform.OS === "android" && { shadow: 4 })}
          w="full"
          bg="white"
          p="5"
        >
          <Box>
            <HStack alignItems="flex-start">
              <Text
                color="coolGray.800"
                fontWeight="medium"
                fontSize="xl"
                flexWrap="wrap"
                overflow="hidden"
                maxWidth="1/2"
              >
                {project.clientName}
              </Text>
              <Spacer />
              <HStack justifyContent="center" alignItems="center">
                <View
                  rounded="full"
                  w={3}
                  h={3}
                  opacity={50}
                  bg={getBorderColor(project.status)}
                  mr={2}
                />
                <Text
                  fontSize={12}
                  textTransform="uppercase"
                  color={getBorderColor(project.status)}
                >
                  {project.status}
                </Text>
              </HStack>
            </HStack>
            <HStack alignItems="center">
              <Text fontSize={14} color="coolGray.600">
                Created:{" "}
                {formatDistance(new Date(project.createdAt), Date.now(), {
                  addSuffix: true,
                })}
              </Text>
            </HStack>
            <HStack justifyContent="space-between" mt="4">
              <HStack color="coolGray.700" maxW="1/2">
                <MapLogo width={24} height={24} stroke="#1e88e5" />
                <View marginLeft={2}>
                  <Address address={project.location} />
                </View>
              </HStack>
              {project.images &&
                project.images.length > 0 &&
                safelyGetImageUrl(urlMap, project.images[0].key) && (
                  <View shadow="3">
                    <Image
                      source={{
                        uri: safelyGetImageUrl(urlMap, project.images[0].key),
                      }}
                      width="24"
                      height="24"
                      alt="Image"
                      rounded="md"
                    />
                  </View>
                )}
            </HStack>
          </Box>
        </Pressable>
      </Box>
    </View>
  );
}
