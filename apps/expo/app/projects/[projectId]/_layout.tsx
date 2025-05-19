import { Stack } from "expo-router";

export default function Project() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="rooms/create"
        options={{ presentation: "modal", headerTitle: "Create Room" }}
      />
      <Stack.Screen
        name="edit-insurance"
        options={{
          headerShown: true,
          headerTitle: "Edit Insurance",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="lidar/rooms"
        options={{
          headerShown: true,
          headerTitle: "Lidar Scan",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="lidar/scan"
        options={{ headerShown: false, headerTitle: "Lidar Scan" }}
      />
    </Stack>
  );
}
