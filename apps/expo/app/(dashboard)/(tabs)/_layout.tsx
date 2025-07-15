import { router, Tabs } from "expo-router";
import {
  Calendar,
  CircleHelp,
  Cog,
  House,
  Receipt,
  FileText,
  MessageCircle,
  ArrowLeft,
} from "lucide-react-native";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        headerTintColor: "#FFFF",
        headerStyle: { backgroundColor: "#2563eb" },
        header: ({ navigation, route, options }) =>
          route.name === "chats/[chatId]" || route.name === "chats/new" ? (
            <SafeAreaView style={{ backgroundColor: "#2563eb" }}>
              <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            </SafeAreaView>
          ) : (
            <SafeAreaView style={{ backgroundColor: "#2563eb" }}>
              <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
              <View
                style={{
                  paddingTop:
                    Platform.OS === "android" ? StatusBar.currentHeight : 0,
                  backgroundColor: "#2563eb",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <View className="px-4 py-3 flex-row items-center justify-between">
                  <View className="flex-row "></View>

                  <Text className="text-white text-lg font-semibold">
                    {options.title}
                  </Text>

                  <View className="flex-row mr-3">
                    <TouchableOpacity onPress={() => router.push("/chat")}>
                      <CircleHelp
                        style={{ marginRight: 10 }}
                        color="#FFFF"
                        size={24}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/settings")}>
                      <Cog color="#FFFF" size={24} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SafeAreaView>
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
      {/* chat */}
      <Tabs.Screen
        name="chats/index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats/new"
        options={{
          title: "New Chat",
          href: null,
        }}
      />
      <Tabs.Screen
        name="chats/[chatId]"
        options={{
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
