import {
  FlatList,
  Box,
  Heading,
  VStack,
  HStack,
  Center,
  Pressable,
} from "native-base";
import React, { useState } from "react";
import RoomReading from "@/components/project/reading";
import { useGlobalSearchParams, useRouter } from "expo-router";
import Empty from "@/components/project/empty";
import {
  Building,
  Plus,
  ChevronDown,
  Wifi,
  WifiOff,
} from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const BuildingComponent = Building as any;
const PlusComponent = Plus as any;
const ChevronDownComponent = ChevronDown as any;
const WifiComponent = Wifi as any;
const WifiOffComponent = WifiOff as any;
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
import { useOfflineReadingsStore } from "@/lib/state/offline-readings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import { useOfflineCreateRoomReading } from "@/lib/hooks/useOfflineReadings";
import { toast } from "sonner-native";

const RoomReadingItem = ({ room }: { room: Room }) => {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const { mutate: createRoomReading, isPending: isCreatingRoomReading } =
    useOfflineCreateRoomReading(projectId);
  const { data: roomReadings, isPending: isLoadingRoomReadings } =
    useGetRoomReadings(room.id);
  const { isOffline } = useNetworkStatus();

  console.log("🚀 ~ RoomReadingItem ~ roomReadings:", roomReadings?.data);

  const router = useRouter();
  const addReading = async () => {
    try {
      createRoomReading({
        roomId: room.id,
        date: new Date(),
        humidity: 0,
        temperature: 0,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to create reading");
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
              <PlusComponent color="#1e40af" height={18} width={18} />
              <Text className="ml-1 text-primary">Add Reading</Text>
            </View>
          )}
        </Button>
      </HStack>
      <VStack w="100%" space={0}>
        {isLoadingRoomReadings ? (
          <Center w="full" py={4}>
            <ActivityIndicator />
          </Center>
        ) : roomReadings?.data?.length === 0 ? (
          <Center w="full" py={4}>
            <Heading size="sm" color="gray.400">
              No readings yet
            </Heading>
          </Center>
        ) : (
          <>
            {/* Show all readings (online and offline) */}
            {roomReadings?.data?.map((reading: RoomReadingType) => (
              <RoomReading
                room={room}
                key={reading.id}
                reading={reading}
                projectId={projectId}
              />
            ))}
          </>
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
  const { isOffline } = useNetworkStatus();
  const [selectedRoom, setSelectedRoom] = useState<string | "all" | null>(
    "all"
  );
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Set initial selected room when rooms data is loaded
  // React.useEffect(() => {
  //   if (rooms && rooms.length > 0 && !selectedRoom) {
  //     setSelectedRoom(rooms[0].id);
  //   }
  // }, [rooms]);

  const filteredRooms =
    selectedRoom === "all"
      ? rooms
      : rooms?.filter((room) => room.id === selectedRoom);

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
        icon={<BuildingComponent size={64} />}
        secondaryIcon={<PlusComponent color="#FFF" height={24} width={24} />}
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
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Heading size="lg">Room Readings</Heading>
                  {isOffline && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#fef2f2",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        gap: 4,
                      }}
                    >
                      <WifiOffComponent size={16} color="#ef4444" />
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#ef4444",
                          fontWeight: "500",
                        }}
                      >
                        Offline
                      </Text>
                    </View>
                  )}
                </View>
                <AddRoomButton showText={false} size="sm" />
              </HStack>

              <Pressable
                onPress={() => setShowRoomSelector(!showRoomSelector)}
                className="bg-blue-50 px-4 py-3 rounded-lg flex-row items-center justify-between"
              >
                <Text className="text-blue-700 font-medium">
                  {selectedRoom === "all"
                    ? "View All"
                    : rooms?.find((r) => r.id === selectedRoom)?.name}
                </Text>
                <ChevronDownComponent color="#1e40af" size={18} />
              </Pressable>

              {showRoomSelector && (
                <Box bg="white" rounded="lg" shadow={2}>
                  <Pressable
                    onPress={() => {
                      setSelectedRoom("all");
                      setShowRoomSelector(false);
                    }}
                    className={`px-4 py-3 border-b border-gray-100 ${
                      selectedRoom === "all" ? "bg-blue-50" : ""
                    }`}
                  >
                    <Text
                      className={`${
                        selectedRoom === "all"
                          ? "text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      View All
                    </Text>
                  </Pressable>
                  {rooms?.map((room) => (
                    <Pressable
                      key={room.id}
                      onPress={() => {
                        setSelectedRoom(room.id);
                        setShowRoomSelector(false);
                      }}
                      className={`px-4 py-3 border-b border-gray-100 ${
                        room.id === selectedRoom ? "bg-blue-50" : ""
                      }`}
                    >
                      <Text
                        className={`${
                          room.id === selectedRoom
                            ? "text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {room.name}
                      </Text>
                    </Pressable>
                  ))}
                </Box>
              )}
            </VStack>
          </Box>

          <FlatList
            refreshing={loading}
            data={filteredRooms}
            keyExtractor={(room) => room.id}
            renderItem={({ item: room }) => (
              <RoomReadingItem room={room} key={room.id} />
            )}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            w="full"
            h="full"
            // nestedScrollEnabled={true}
            // scrollEnabled={true}
            // removeClippedSubviews={false}
            // bounces={true}
            // overScrollMode="always"
            // scrollEventThrottle={16}
            // onScrollBeginDrag={() => {
            //   Keyboard.dismiss();
            // }}
          />
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
