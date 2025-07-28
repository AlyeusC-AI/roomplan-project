import {
  FlatList,
  Box,
  Heading,
  VStack,
  HStack,
  Center,
  Pressable,
} from "native-base";
import React, { useCallback, useState } from "react";
import RoomReading from "@/components/project/reading";
import { useFocusEffect, useGlobalSearchParams, useRouter } from "expo-router";
import Empty from "@/components/project/empty";
import {
  Building,
  Plus,
  ChevronRight,
  Wifi,
  WifiOff,
  Trash2,
} from "lucide-react-native";

// Type assertions to fix ReactNode compatibility
const BuildingComponent = Building as any;
const PlusComponent = Plus as any;
const ChevronRightComponent = ChevronRight as any;
const WifiComponent = Wifi as any;
const WifiOffComponent = WifiOff as any;
const Trash2Component = Trash2 as any;
import { Button } from "@/components/ui/button";
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import AddRoomButton from "@/components/project/AddRoomButton";
import { Text } from "@/components/ui/text";
import {
  Room,
  RoomReading as RoomReadingType,
  useCreateRoomReading,
  useGetRoomReadings,
  useGetRooms,
  useDeleteRoom,
} from "@service-geek/api-client";
import { useOfflineReadingsStore } from "@/lib/state/offline-readings";
import { useNetworkStatus } from "@/lib/providers/QueryProvider";
import {
  useOfflineCreateRoomReading,
  useOfflineReadings,
} from "@/lib/hooks/useOfflineReadings";
import { toast } from "sonner-native";

const RoomReadingItem = ({
  room,
  onRoomDeleted,
}: {
  room: Room;
  onRoomDeleted: () => void;
}) => {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const { mutate: createRoomReading, isPending: isCreatingRoomReading } =
    useOfflineCreateRoomReading(projectId);
  const {
    data: roomReadings,
    isPending: isLoadingRoomReadings,
    refetch: refetchRoomReadings,
  } = useGetRoomReadings(room.id);
  const { isOffline } = useNetworkStatus();
  const { offlineReadings, offlineEdits, hasOfflineData } = useOfflineReadings(
    room.id
  );
  const [expanded, setExpanded] = useState(true);
  const { mutate: deleteRoom, isPending: isDeletingRoom } = useDeleteRoom();

  const handleDeleteRoom = () => {
    Alert.alert(
      "Delete Room",
      `Are you sure you want to delete the room '${room.name}'? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRoom(room.id, {
              onSuccess: () => {
                toast.success("Room deleted");
                onRoomDeleted();
              },
              onError: () => {
                toast.error("Failed to delete room");
              },
            });
          },
        },
      ]
    );
  };

  console.log("🚀 ~ RoomReadingItem ~ roomReadings:", roomReadings?.data);
  console.log("🚀 ~ RoomReadingItem ~ offlineReadings:", offlineReadings);
  console.log("🚀 ~ RoomReadingItem ~ hasOfflineData:", hasOfflineData);
  useFocusEffect(
    useCallback(() => {
      !isOffline && refetchRoomReadings();
    }, [])
  );
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

  // Only show offline readings when offline
  const visibleOfflineReadings = isOffline ? offlineReadings : [];

  return (
    <View className="mt-3">
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="center"
        direction="row"
        mb={0}
        style={{
          backgroundColor: "#f3f4f6",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottomLeftRadius: expanded ? 0 : 12,
          borderBottomRightRadius: expanded ? 0 : 12,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          paddingHorizontal: 12,
          paddingVertical: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => setExpanded((prev) => !prev)}
          style={{ flex: 1 }}
        >
          <HStack alignItems="center" space={2}>
            <ChevronRightComponent
              color="#1e40af"
              size={22}
              style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
            />
            <Heading size="md">{room.name}</Heading>
          </HStack>
        </TouchableOpacity>
        <Button
          onPress={() => {
            addReading();
          }}
          size="sm"
          variant="outline"
          style={{ marginRight: 8 }}
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
        <TouchableOpacity
          onPress={handleDeleteRoom}
          disabled={isDeletingRoom}
          style={{ marginLeft: 4 }}
        >
          <Trash2Component color="#ef4444" size={22} />
        </TouchableOpacity>
      </HStack>
      {expanded && (
        <VStack
          w="100%"
          space={4}
          style={{
            backgroundColor: "#f3f4f6",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: "#f3f4f6",
            borderTopWidth: 0,
          }}
        >
          {isLoadingRoomReadings ? (
            <Center w="full" py={4}>
              <ActivityIndicator />
            </Center>
          ) : roomReadings?.data?.length === 0 &&
            visibleOfflineReadings.length === 0 ? (
            <Center w="full" py={4}>
              <Heading size="sm" color="gray.400">
                No readings yet
              </Heading>
            </Center>
          ) : (
            <>
              {/* Show online readings */}
              {roomReadings?.data?.map((reading: RoomReadingType) => (
                <View
                  key={reading.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                  }}
                >
                  <RoomReading
                    room={room}
                    key={reading.id}
                    reading={reading}
                    projectId={projectId}
                    isOffline={false}
                  />
                </View>
              ))}

              {/* Show offline new readings only when offline */}
              {visibleOfflineReadings
                .filter((reading) => reading.type === "new")
                .map((reading) => (
                  <RoomReading
                    room={room}
                    key={reading.id}
                    reading={{
                      id: reading.id,
                      roomId: reading.roomId,
                      date: reading.date,
                      temperature: reading.temperature,
                      humidity: reading.humidity,
                      wallReadings: [],
                      genericRoomReading: [],
                      createdAt: reading.createdAt,
                      updatedAt: reading.createdAt,
                    }}
                    projectId={projectId}
                    isOffline={true}
                  />
                ))}
            </>
          )}
        </VStack>
      )}
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
  const [refreshFlag, setRefreshFlag] = useState(0);

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
        title="No Rooms"
        description="Create a room to add readings to it."
        buttonText="Create a room"
        icon={<BuildingComponent height={50} width={50} />}
        secondaryIcon={
          <PlusComponent height={20} width={20} color="#fff" className="ml-4" />
        }
        onPress={onCreateRoom}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          paddingTop: 16,
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                padding: 16,

                backgroundColor: "#fff",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1e293b",
                    paddingTop: 8,
                  }}
                >
                  Readings
                </Text>
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
            </View>

            {/* Room Readings List */}
            <FlatList
              data={filteredRooms}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RoomReadingItem
                  room={item}
                  onRoomDeleted={() => setRefreshFlag((prev) => prev + 1)}
                />
              )}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 32,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
}
