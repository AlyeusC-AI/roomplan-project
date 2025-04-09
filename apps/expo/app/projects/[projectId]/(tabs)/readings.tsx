import { FlatList, Box, Heading, VStack, HStack, Center } from "native-base";
import React, { useEffect, useState } from "react";
import RoomReading from "@/components/project/reading";
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import { Building, Plus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { ActivityIndicator, View, TouchableOpacity, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { roomsStore } from "@/lib/state/rooms";
import { Database } from "@/types/database";
import { v4 } from "react-native-uuid/dist/v4";
import AddRoomButton from "@/components/project/AddRoomButton";
import { Text } from "@/components/ui/text";
import { ReadingType } from "@/types/app";

const RoomReadingItem = ({ room }: { room: RoomWithReadings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const router = useRouter();
  const addReading = async (data: any, type: ReadingType) => {
    try {
      setIsAdding(true);
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            type,
            data,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Could not add reading");
      }

      const body = await res.json();

      if (type === "standard") {
        roomsStore.getState().addReading(room.id, body.reading);
      }

      return body;
    } catch {
      toast.error("Could not add reading");
    } finally {
      setIsAdding(false);
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
        <TouchableOpacity onPress={() => router.push(`/projects/${projectId}/rooms/create?roomId=${room.publicId}&roomName=${room.name}`)}>
          <Heading size="md">{room.name}</Heading>
        </TouchableOpacity>
        <Button
          onPress={() => {
            addReading(
              {
                projectId: room.projectId,
                publicId: v4(),
                roomId: room.id,
              },
              "standard"
            );
          }}
          size="sm"
          variant="outline"
        >
          {isAdding ? (
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
        {room.RoomReading?.length === 0 ? (
          <Center w="full" py={4}>
            <Heading size="sm" color="gray.400">
              No readings yet
            </Heading>
          </Center>
        ) : (
         
          room.RoomReading?.map((reading) => (
            <RoomReading
              room={room}
              key={reading.publicId}
              reading={reading}
              addReading={addReading}
            />
          ))

        )}
      </VStack>
    </View>
  );
};

export default function RoomReadings() {
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId, projectName } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const [loading, setLoading] = useState(true);
  const rooms = roomsStore();
  const router = useRouter();

  const onCreateRoom = async () => {
    router.navigate({
      pathname: "../rooms/create",
      params: { projectId, projectName },
    });
  };

  const getReadings = () => {
    setLoading(true);
    fetch(
      `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": supabaseSession?.access_token || "",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        rooms.setRooms(data.rooms);
        setLoading(false);
        console.log(data);
      });
  };

  useEffect(() => {
    getReadings();
  }, []);

  if (!loading && rooms.rooms?.length === 0) {
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
            onRefresh={getReadings}
            data={rooms.rooms}
            keyExtractor={(room) => room.publicId}
            renderItem={({ item: room }) => (
              <RoomReadingItem room={room} key={room.publicId} />
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
