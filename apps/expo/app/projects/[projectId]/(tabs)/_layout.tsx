import React, { useEffect } from "react";

import {
  ArrowLeft,
  BookOpen,
  House,
  Images,
  StickyNote,
  ClipboardList,
  Ruler,
  FileText,
} from "lucide-react-native";
import { router, Tabs, useGlobalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { projectStore } from "@/lib/state/project";
import { userStore } from "@/lib/state/user";

export default function Layout() {
  const { projectId } = useGlobalSearchParams();
  const [loading, setLoading] = React.useState(true);
  const { fetchProject, project } = projectStore();

  useEffect(() => {
    fetchProject(projectId as string).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#1e88e5",
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: "#1e88e5",
        },
        header: ({ navigation, route, options }) => (
          <SafeAreaView style={{ backgroundColor: "#1e88e5" }}>
            <StatusBar barStyle="light-content" backgroundColor="#1e88e5" />
            <View
              style={{
                paddingTop:
                  Platform.OS === "android" ? StatusBar.currentHeight : 0,
                backgroundColor: "#1e88e5",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <View className="px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 p-2 bg-white/10 rounded-full"
                  >
                    <ArrowLeft color="white" size={20} />
                  </TouchableOpacity>
                  <Text className="text-white text-lg font-semibold">
                    {route.name === "scope"
                      ? "Scope"
                      : project?.clientName || "Project"}
                  </Text>
                </View>
                {route.name === "index" && (
                  <TouchableOpacity
                    // onPress={() => router.push({ pathname: "./edit" })}
                    onPress={() =>
                      router.push({
                        pathname: "./details",
                        params: { activeTab: "loss" },
                      })
                    }
                    className="bg-white/10 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-medium">Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        ),
        tabBarIcon: ({ color }) => {
          if (route.name === "index") {
            return <House size={24} color={color} />;
          }
          if (route.name === "pictures") {
            return <Images size={24} color={color} />;
          }
          if (route.name === "readings") {
            return <BookOpen size={24} color={color} />;
          }
          if (route.name === "notes") {
            return <StickyNote size={24} color={color} />;
          }
          if (route.name === "forms") {
            return <ClipboardList size={24} color={color} />;
          }
          if (route.name === "scope") {
            return <Ruler size={24} color={color} />;
          }
          if (route.name === "documents") {
            return <FileText size={24} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
        }}
      />
      <Tabs.Screen
        name="pictures"
        options={{
          title: "Photos",
          // freezeOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="readings"
        options={{
          title: "Readings",
          freezeOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
        }}
      />
      <Tabs.Screen
        name="scope"
        options={{
          title: "Scope",
          href: null,
        }}
      />
      <Tabs.Screen
        name="forms"
        options={{
          title: "Forms",
          href: null,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          href: null,
        }}
      />
    </Tabs>
  );
}
