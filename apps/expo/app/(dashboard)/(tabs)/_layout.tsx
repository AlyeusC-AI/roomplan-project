import { router, Tabs } from "expo-router";
import {
  Calendar,
  CircleHelp,
  Cog,
  House,
  Receipt,
  FileText,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        headerTintColor: "#FFFF",
        headerStyle: { backgroundColor: "#2563eb" },
        headerRight: () => (
          <View className="flex-row mr-3">
            <TouchableOpacity onPress={() => router.push("/chat")}>
              <CircleHelp style={{ marginRight: 10 }} color="#FFFF" size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/settings")}>
              <Cog color="#FFFF" size={24} />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <House size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="estimates"
        options={{
          title: "Estimates",
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color }) => <Receipt size={24} color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Cog size={24} color={color} />,
          href: null,
        }}
      />
    </Tabs>
  );
}
