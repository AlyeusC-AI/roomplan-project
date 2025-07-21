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
import { useGetProjectById } from "@service-geek/api-client";
import DryStandardScreen from "./dry-standard";
import DryStandardDetailScreen from "./dry-standard-detail";
import { Colors } from "@/constants/Colors";
export default function Layout() {
  const { projectId } = useGlobalSearchParams();

  const { data: project, isLoading } = useGetProjectById(projectId as string);

  if (isLoading) {
    return (
      <View className="flex items-center justify-center h-full w-full">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.light.primary,
        headerTintColor: "white",
        headerStyle: {
          backgroundColor: Colors.light.primary,
        },
        header: ({ navigation, route, options }) =>
          route.name === "chat" || route.name === "copilot" ? (
            <SafeAreaView style={{ backgroundColor: Colors.light.primary }}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.light.primary}
              />
            </SafeAreaView>
          ) : (
            <SafeAreaView style={{ backgroundColor: Colors.light.primary }}>
              <StatusBar barStyle="light-content" backgroundColor="# 2563eb" />
              <View
                style={{
                  paddingTop:
                    Platform.OS === "android" ? StatusBar.currentHeight : 0,
                  backgroundColor: "# 2563eb",
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
                        : project?.data.clientName || "Project"}
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
          if (route.name === "notes/index") {
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
        name="notes/index"
        options={{
          title: "Notes",
          // href: null,
        }}
      />
      <Tabs.Screen
        name="notes/_comps/noteCard"
        options={{
          // title: "Room Notes",
          href: null,
        }}
      />
      <Tabs.Screen
        name="notes/_comps/notesGallery"
        options={{
          title: "Room Notes",
          href: null,
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
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          href: null,
        }}
      />
      <Tabs.Screen
        name="filtered-images"
        options={{
          title: "Filtered Images",
          href: null,
        }}
      />
      <Tabs.Screen
        name="copilot"
        options={{
          title: "Copilot",
          href: null,
        }}
      />
      <Tabs.Screen
        name="dry-standard"
        options={{
          title: "Dry Standard",
          href: null,
        }}
      />
      <Tabs.Screen
        name="dry-standard-detail"
        options={{
          title: "Dry Standard Detail",
          href: null,
        }}
      />
    </Tabs>
  );
}
