import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { userStore } from "@/lib/state/user";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { roomsStore } from '@/lib/state/rooms';
import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';

const PLACEHOLDER_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <text x="40" y="50" font-family="Arial" font-size="12" text-anchor="middle" fill="#999">
    No Room Plan
  </text>
</svg>
`;

export function LidarRooms() {
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);

        const roomsRes = await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": supabaseSession?.access_token || "",
            },
          }
        );

        const roomsData = await roomsRes.json();
        console.log("🚀 ~ refreshData ~ roomsData:", roomsData);
        rooms.setRooms(roomsData.rooms);
      } catch (err) {
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    }

    if (pathname === `/projects/${projectId}/lidar/rooms`) {
      fetchRooms();
    }
  }, [projectId, pathname]);

  const handleAddRoom = () => {
    router.push({
      pathname: `/projects/${projectId}/lidar/scan`,
      params: {
        roomId: undefined,
        roomPlanSVG: undefined,
      },
    });
  };

  const handleRoomPress = (roomId: number, roomPlanSVG: string) => {
    router.push({
      pathname: `/projects/${projectId}/lidar/scan`,
      params: { roomId, roomPlanSVG },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-destructive text-center">{error}</Text>
        <Button variant="outline" className="mt-4" onPress={() => setLoading(true)}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="flex-row flex-wrap p-4">
        {/* Add New Room Card */}
        <View className="w-1/2 p-2 h-44">
          <TouchableOpacity 
            onPress={handleAddRoom}
          >
            <View className="h-full flex items-center justify-center border-dashed border-2 border-muted-foreground/50 rounded-lg">
              <View className="flex items-center justify-center">
                <Text className="text-5xl text-muted-foreground">+</Text>
                <Text className="text-muted-foreground mt-2">New Room</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Room Cards */}
        {rooms.rooms?.map((room) => (
          <View key={room.id} className="w-1/2 p-2 h-44">
            <View className="h-full border border-muted-foreground/20 rounded-lg">
              <TouchableOpacity onPress={() => handleRoomPress(room.id, room.roomPlanSVG)}>
                <View className="h-32 overflow-hidden bg-muted">
                  <View className="h-32 w-32 items-center justify-center mx-auto">
                    <SvgXml 
                      xml={room.roomPlanSVG || PLACEHOLDER_SVG} 
                      width="100%" 
                      height="100%" 
                      className={cn(
                        "relative",
                      )}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <View className="h-8 justify-center pl-2">
                <Text className="font-semibold" numberOfLines={1}>{room.name}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default LidarRooms;
