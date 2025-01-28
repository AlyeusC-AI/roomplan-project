import { Tabs } from "expo-router";
import { Calendar, Cog, House } from "lucide-react-native";

export default function Layout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#1e40af' }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Cog size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}