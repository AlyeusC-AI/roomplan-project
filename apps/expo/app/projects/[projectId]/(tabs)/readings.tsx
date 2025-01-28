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
  AddIcon,
} from "native-base";
import React, { useState } from "react";
import { useToast } from "native-base";
import { api, RouterOutputs } from "@/utils/api";

import RoomReading from "@/components/project/reading";
import { userStore } from "@/utils/state/user";
import { useLocalSearchParams } from "expo-router";

export const RoomReadingType = {
  dehumidifer: "dehumidifer",
};

export type UpdateRoomReadingData = {
  temperature?: string;
  relativeHumidity?: string;
  gpp?: string;
  moistureContentWall?: string;
  moistureContentFloor?: string;
};

export type UpdateGenericRoomReadingData = {
  temperature?: string;
  relativeHumidity?: string;
  value?: string;
};

const RoomReadingItem = ({
  addReading,
  readings,
  room,
  deleteReading,
  updateRoomReading,
  addGenericReading,
  updateGenericRoomReading,
}: {
  room: NonNullable<
    RouterOutputs["mobile"]["getRoomData"]["roomData"]
  >["rooms"][0];
  addReading: (publicId: string) => Promise<void>;
  readings: NonNullable<
    RouterOutputs["mobile"]["getRoomData"]["roomData"]
  >["rooms"][0]["roomReadings"];
  deleteReading: (roomId: string, readingId: string) => Promise<void>;
  updateRoomReading: (
    roomId: string,
    readingId: string,
    data: UpdateRoomReadingData
  ) => Promise<void>;
  addGenericReading: (roomId: string, readingId: string) => Promise<void>;
  updateGenericRoomReading: (
    roomId: string,
    readingId: string,
    genericReadingId: string,
    data: UpdateGenericRoomReadingData
  ) => Promise<void>;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const onAdd = async () => {
    setIsAdding(true);
    await addReading(room.publicId);
    setIsAdding(false);
  };

  return (
    <>
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="flex-start"
        direction="row"
        mb={4}
      >
        <View>
          <Heading>{room.name}</Heading>
        </View>
        <Button
          onPress={onAdd}
          display="flex"
          justifyContent="center"
          alignItems="center"
          rightIcon={
            isAdding ? (
              <Spinner />
            ) : (
              <AddIcon style={{ color: "#fff" }} height={24} width={24} />
            )
          }
        />
      </HStack>
      <VStack w="100%" mb="3">
        {readings.length === 0 && (
          <Center w="full">
            <Heading size="sm" mb="2" color="gray.400">
              There are no readings yet
            </Heading>
          </Center>
        )}
        {readings.map((reading, i) => (
          <RoomReading
            roomPublicId={room.publicId}
            key={reading.publicId}
            reading={reading}
            deleteReading={deleteReading}
            updateRoomReading={updateRoomReading}
            addGenericReading={addGenericReading}
            updateGenericRoomReading={updateGenericRoomReading}
          />
        ))}
      </VStack>
    </>
  );
};

export default function RoomReadings() {
  const toast = useToast();
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId, projectName } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId: projectName,
  };

  const roomData = api.mobile.getRoomData.useQuery(queryParams);
  const createNewRoomReadingMutation =
    api.mobile.createNewRoomReading.useMutation();
  const deleteRoomReadingMutation = api.mobile.deleteRoomReading.useMutation();
  const updateRoomReadingMutation = api.mobile.updateRoomReading.useMutation();
  const createGenericRoomReadingMutation =
    api.mobile.createNewGenericRoomReading.useMutation();
  const updateGenericRoomReadingMutation =
    api.mobile.updateGenericRoomReading.useMutation();

  const updateRoomReading = async (
    roomId: string,
    readingId: string,
    data: UpdateRoomReadingData
  ) => {
    try {
      await updateRoomReadingMutation.mutateAsync({
        ...queryParams,
        roomId,
        readingId,
        ...data,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">Could not delete reading</Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const updateGenericRoomReading = async (
    roomId: string,
    readingId: string,
    genericReadingId: string,
    data: UpdateGenericRoomReadingData
  ) => {
    try {
      await updateGenericRoomReadingMutation.mutateAsync({
        ...queryParams,
        roomId,
        readingId,
        genericReadingId,
        ...data,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">Could not delete reading</Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const deleteReading = async (roomId: string, readingId: string) => {
    try {
      await deleteRoomReadingMutation.mutateAsync({
        ...queryParams,
        roomId,
        readingId,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">Could not delete reading</Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const addReading = async (roomId: string) => {
    try {
      await createNewRoomReadingMutation.mutateAsync({
        ...queryParams,
        roomId,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not add reading. If this error persits, please contact
              support@servicegeek.com
            </Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const addGenericReading = async (roomId: string, readingId: string) => {
    try {
      await createGenericRoomReadingMutation.mutateAsync({
        ...queryParams,
        roomId,
        readingId,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not add reading. If this error persits, please contact
              support@servicegeek.com
            </Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const onCreateRoom = async () => {
    navigation.navigate("Create Room", { projectId });
  };

  const getReadings = (roomId: string) => {
    return (
      roomData.data?.roomData?.rooms.find((r) => r.publicId === roomId)
        ?.roomReadings || []
    );
  };

  return (
    <Box
      flex={1}
      alignItems="flex-start"
      h="full"
      pt={4}
      px={2}
      backgroundColor="white"
    >
      {!roomData.isLoading && roomData.data?.roomData?.rooms.length === 0 && (
        <Center h="3/6" w="full">
          <Heading>There are no rooms yet</Heading>
          <Button
            onPress={onCreateRoom}
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={4}
          >
            <Flex direction="row">
              <View mr="3">
                <AddIcon style={{ color: "#fff" }} height={24} width={24} />
              </View>
              <Text color="white">Create a room</Text>
            </Flex>
          </Button>
        </Center>
      )}

      <FlatList
        refreshing={roomData.isLoading}
        onRefresh={roomData.refetch}
        data={roomData.data?.roomData?.rooms || []}
        keyExtractor={(room) => room.publicId}
        renderItem={({ item: room }) => (
          <RoomReadingItem
            room={room}
            key={room.publicId}
            readings={getReadings(room.publicId)}
            addReading={addReading}
            deleteReading={deleteReading}
            updateRoomReading={updateRoomReading}
            addGenericReading={addGenericReading}
            updateGenericRoomReading={updateGenericRoomReading}
          />
        )}
        w="full"
        h="full"
      />
    </Box>
  );
}
