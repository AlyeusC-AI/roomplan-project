import {
  FlatList,
  Box,
  Heading,
  Button,
  VStack,
  View,
  Flex,
  Text,
  HStack,
  Center,
  Spinner,
  Pressable,
  ChevronDownIcon,
  ChevronUpIcon,
} from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/Navigation";
import { Camera } from "react-native-vision-camera";
import RoomImages from "./RoomImages";
import { Fab } from "native-base";
import { useToast } from "native-base";

// @ts-expect-error
import CameraIcon from "../../../assets/icons/Camera.svg";
import { api, RouterOutputs } from "../../utils/api";
import { useRecoilState } from "recoil";
import userSessionState from "../../atoms/user";
import Collapsible from "react-native-collapsible";
import { useIsFocused } from "@react-navigation/native";

const CollapsibleRoomView = ({
  room,
  urlMap,
}: {
  room: NonNullable<RouterOutputs["mobile"]["getProjectImages"]["rooms"]>[0];
  urlMap: NonNullable<RouterOutputs["mobile"]["getProjectImages"]["urlMap"]>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <VStack space="3">
      <View key={room.publicId}>
        <Box w="full" mb="2">
          <Pressable
            onPress={() => setIsCollapsed((o) => !o)}
            px={2}
            py={4}
            borderWidth={1}
            borderColor="gray.200"
            rounded="md"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            mb={4}
          >
            <Heading size="sm" color="blue.500" ml={2}>
              {room.name}
            </Heading>
            {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </Pressable>
          <Collapsible collapsed={isCollapsed}>
            <RoomImages
              inferences={room.inferences}
              roomName={room.name}
              urlMap={urlMap}
            />
          </Collapsible>
        </Box>
      </View>
    </VStack>
  );
};

export default function ProjectPhotos({
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

  const getProjectImagesQuery =
    api.mobile.getProjectImages.useQuery(queryParams);
  const toast = useToast();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (
      isFocused &&
      (!getProjectImagesQuery.isFetching || !getProjectImagesQuery.isLoading)
    ) {
      console.log("refetching");
      getProjectImagesQuery.refetch();
    }
    // Put Your Code Here Which You Want To Refresh or Reload on Coming Back to This Screen.
  }, [isFocused]);

  const onPress = async () => {
    try {
      await Camera.requestCameraPermission();
      navigation.navigate("Camera", {
        projectId: projectPublicId,
        rooms: getProjectImagesQuery.data?.rooms || [],
        organizationId: getProjectImagesQuery.data?.organizationId || "",
      });
    } catch (error) {
      console.error("Cannot open camera");
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not open the camera. It's possible camera access was denied
              for this application. If the issue persists, please contact
              support@servicegeek.com
            </Text>
          </HStack>
        ),
        bottom: "16",
      });
    }
  };

  const onCreateRoom = async () => {
    navigation.navigate("Create Room", { projectId: projectPublicId });
  };

  const totalPhotos = useMemo(
    () =>
      getProjectImagesQuery.data?.rooms.reduce(
        (p, c) =>
          p + c.inferences.reduce((pi, ci) => pi + (ci.imageKey ? 1 : 0), 0),
        0
      ),
    [getProjectImagesQuery.data?.rooms]
  );

  return (
    <Box
      flex={1}
      alignItems="flex-start"
      h="full"
      pt={4}
      px={2}
      backgroundColor="white"
    >
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="flex-start"
        direction="row"
        mb={4}
      >
        <View>
          <Heading size="md">{totalPhotos} photos</Heading>
        </View>
        <Button
          onPress={() => onCreateRoom()}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          Add Room
        </Button>
      </HStack>

      {!getProjectImagesQuery.isLoading &&
        getProjectImagesQuery.data?.rooms.length === 0 && (
          <Center h="3/6" w="full">
            <Heading>There are no images yet</Heading>
            <Text textAlign="center" fontSize="16">
              Upload images to associate with this project. Images of rooms can
              be automatically assigned a room
            </Text>
            <Button
              onPress={onPress}
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt={4}
            >
              <Flex direction="row">
                <View mr="3">
                  <CameraIcon height={20} width={20} color="#fff" />
                </View>
                <Text color="white">Start Taking Pictures</Text>
              </Flex>
            </Button>
          </Center>
        )}
      <FlatList
        refreshing={getProjectImagesQuery.isLoading}
        onRefresh={getProjectImagesQuery.refetch}
        data={getProjectImagesQuery?.data?.rooms || []}
        keyExtractor={(room) => room.publicId}
        renderItem={({ item: room }) => (
          <CollapsibleRoomView
            room={room}
            urlMap={getProjectImagesQuery?.data?.urlMap || {}}
          />
        )}
        w="full"
        h="full"
      />
      {(getProjectImagesQuery?.data?.rooms || []).length > 0 && (
        <Fab
          onPress={onPress}
          renderInPortal={false}
          shadow={6}
          size="lg"
          icon={<CameraIcon height={20} width={20} color="#fff" />}
        />
      )}
    </Box>
  );
}
