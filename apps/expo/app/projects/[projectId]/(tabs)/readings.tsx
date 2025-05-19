import { FlatList, Box, Heading, VStack, HStack, Center } from "native-base";
import React, { useEffect, useState } from "react";
import RoomReading from "@/components/project/reading";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import { Building, Plus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import AddRoomButton from "@/components/project/AddRoomButton";
import { Text } from "@/components/ui/text";
import {
  Room,
  RoomReading as RoomReadingType,
  useCreateRoomReading,
  useGetRoomReadings,
  useGetRooms,
} from "@service-geek/api-client";

const RoomReadingItem = ({ room }: { room: Room }) => {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const { mutate: createRoomReading, isPending: isCreatingRoomReading } =
    useCreateRoomReading();
  const { data: roomReadings } = useGetRoomReadings(room.id);
  console.log("🚀 ~ RoomReadingItem ~ roomReadings:", roomReadings?.data);

  const router = useRouter();
  const addReading = async () => {
    try {
      createRoomReading({
        roomId: room.id,
        date: new Date(),
        humidity: 0,
        temperature: 0,
        equipmentUsed: [],
      });
    } catch (error) {
      console.log(error);
      //   toast.error("Could not add reading");
    }
  };

  return (
    <View className="mt-3">
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="center"
        direction="row"
        mb={4}
      >
        <TouchableOpacity
          onPress={() =>
            router.push(
              `/projects/${projectId}/rooms/create?roomId=${room.id}&roomName=${room.name}`
            )
          }
        >
          <Heading size="md">{room.name}</Heading>
        </TouchableOpacity>
        <Button
          onPress={() => {
            addReading();
          }}
          size="sm"
          variant="outline"
        >
          {isCreatingRoomReading ? (
            <ActivityIndicator />
          ) : (
            <View className="flex-row items-center">
              <Plus color="#1e40af" height={18} width={18} />
              <Text className="ml-1 text-primary">Add Reading</Text>
            </View>
          )}
        </Button>
      </HStack>
      <VStack w="100%" space={2}>
        {roomReadings?.data?.length === 0 ? (
          <Center w="full" py={4}>
            <Heading size="sm" color="gray.400">
              No readings yet
            </Heading>
          </Center>
        ) : (
          roomReadings?.data?.map((reading: RoomReadingType) => (
            <RoomReading room={room} key={reading.id} reading={reading} />
          ))
        )}
      </VStack>
    </View>
  );
};

export default function RoomReadings() {
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const router = useRouter();
  const { data: rooms, isLoading: loading } = useGetRooms(projectId);

  const onCreateRoom = async () => {
    router.navigate({
      pathname: "../rooms/create",
      params: { projectId, projectName },
    });
  };

  if (!loading && rooms?.length === 0) {
    return (
      <Empty
        title="There are no rooms yet"
        description="Start by creating a new room to add readings."
        buttonText="Create a room"
        onPress={onCreateRoom}
        icon={<Building size={64} />}
        secondaryIcon={<Plus color="#FFF" height={24} width={24} />}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Box flex={1} bg="gray.50">
          <Box
            px={4}
            py={3}
            bg="white"
            borderBottomWidth={1}
            borderBottomColor="gray.100"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="lg">Room Readings</Heading>
              <AddRoomButton showText={false} size="sm" />
            </HStack>
          </Box>

          <FlatList
            refreshing={loading}
            // onRefresh={getReadings}
            data={rooms}
            keyExtractor={(room) => room.id}
            renderItem={({ item: room }) => (
              <RoomReadingItem room={room} key={room.id} />
            )}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            w="full"
            h="full"
          />
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
