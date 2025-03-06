import {
  FlatList,
  Box,
  Heading,
  VStack,
  HStack,
  Center,
} from "native-base";
import React, { useEffect, useState } from "react";
import RoomReading from "@/components/project/reading";
import { userStore } from "@/lib/state/user";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { toast } from "sonner-native";
import Empty from "@/components/project/empty";
import { Building, Plus } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { ActivityIndicator, View } from "react-native";
import { roomsStore } from "@/lib/state/rooms";
import { Database } from "@/types/database";
import { v4 } from "react-native-uuid/dist/v4";

declare global {
  type ReadingType = "generic" | "standard";
}

const RoomReadingItem = ({ room }: { room: RoomWithReadings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const addReading = async (
    data:
      | Database["public"]["Tables"]["RoomReading"]["Insert"]
      | Database["public"]["Tables"]["GenericRoomReading"]["Insert"],
    type: ReadingType
  ) => {
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
      console.log("🚀 ~ RoomReadingItem ~ res:", res)

      if (!res.ok) {
        throw new Error("Could not add reading");
      }

      const body = await res.json();

      console.log(body);

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
    <>
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="flex-start"
        direction="row"
        mb={4}
        // px={4}
      >
        <Heading>{room.name}</Heading>
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
        >
          {isAdding ? (
            <ActivityIndicator />
          ) : (
            <Plus color="#FFF" height={24} width={24} />
          )}
        </Button>
      </HStack>
      <VStack w="100%" mb="3">
        {room.RoomReading?.length === 0 && (
          <Center w="full">
            <Heading size="sm" mb="2" color="gray.400">
              There are no readings yet
            </Heading>
          </Center>
        )}
        {room.RoomReading?.map((reading) => (
          <RoomReading
            room={room}
            key={reading.publicId}
            reading={reading}
            addReading={addReading}
          />
        ))}
      </VStack>
    </>
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
        secondaryIcon={
          <Plus color="#FFF" height={24} width={24} />
        }
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
    <Box
      flex={1}
      alignItems="flex-start"
      h="full"
      pt={4}
      px={4}
      mt={4}
      backgroundColor="white"
    >
      {/* <FlatList
        refreshing={loading}
        onRefresh={getReadings}
        data={rooms.rooms}
        keyExtractor={(room) => room.publicId}
        renderItem={({ item: room }) => (
          <RoomReadingItem room={room} key={room.publicId} />
        )}
        w="full"
        h="full"
      /> */}
    </Box>
  );
}
