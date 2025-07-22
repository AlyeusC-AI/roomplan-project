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
  User,
  Clock,
  Share2,
  Edit2,
  FileClock,
  MoreVertical, // Add this import
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
  Image,
} from "react-native";
import { projectStore } from "@/lib/state/project";
import { userStore } from "@/lib/state/user";
import { useGetProjectById } from "@service-geek/api-client";
import DryStandardScreen from "./dry-standard";
import DryStandardDetailScreen from "./dry-standard-detail";
import { Colors } from "@/constants/Colors";
import ShareIcon from "@/assets/share.png";

// Type assertions for lucide-react-native icons
const ArrowLeftIcon = ArrowLeft as any;
const HouseIcon = House as any;
const ImagesIcon = Images as any;
const BookOpenIcon = BookOpen as any;
const StickyNoteIcon = StickyNote as any;
const ClipboardListIcon = ClipboardList as any;
const RulerIcon = Ruler as any;
const FileTextIcon = FileText as any;
const UserIcon = User as any;
const ClockIcon = FileClock as any;
const Share2Icon = Share2 as any;
const Edit2Icon = Edit2 as any;
const MoreVerticalIcon = MoreVertical as any; // Add this line

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
            <SafeAreaView style={{ backgroundColor: "#fff" }}>
              <StatusBar barStyle="dark-content" backgroundColor="#fff" />
              <View
                style={{
                  paddingTop:
                    Platform.OS === "android" ? StatusBar.currentHeight : 0,
                  backgroundColor: "#fff",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <View className="px-4 py-3 flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 flex-row items-center gap-2 rounded-full text-primary"
                  >
                    <ArrowLeftIcon color={Colors.light.primary} size={20} />
                    <Text
                      className="font-medium text-center text-lg"
                      style={{
                        color: Colors.light.primary,
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-black text-2xl font-semibold flex-1 text-center">
                    {route.name === "scope"
                      ? "Scope"
                      : project?.data.name || "Project"}
                  </Text>
                  <View style={{ width: 44 }} />
                  {/* Spacer to balance the back button */}
                </View>
                {/* Four options below */}
                <View className="flex-row justify-around py-2">
                  <TouchableOpacity className="gap-2">
                    <UserIcon
                      size={28}
                      fill={Colors.light.primary}
                      // color={"#f"}
                    />
                    <Text
                      className="text-black font-medium text-center"
                      style={{
                        color: Colors.light.primary,
                      }}
                    >
                      Users
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="gap-2">
                    <ClockIcon
                      size={28}
                      fill={Colors.light.primary}
                      color={"#fff"}
                    />
                    <Text
                      className="text-black font-medium text-center"
                      style={{
                        color: Colors.light.primary,
                      }}
                    >
                      Time
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="gap-2">
                    <Image
                      source={ShareIcon}
                      style={{
                        width: 28,
                        height: 28,
                        resizeMode: "contain",
                        tintColor: Colors.light.primary,
                        // marginBottom: 4,
                      }}
                    />
                    <Text
                      className="text-black font-medium text-center"
                      style={{
                        color: Colors.light.primary,
                      }}
                    >
                      Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "./details",
                        params: { activeTab: "loss" },
                      })
                    }
                    className="gap-2"
                  >
                    {/* <Edit2Icon
                      size={28}
                      fill={Colors.light.primary}
                      color={"#fff"}
                    /> */}
                    <MoreVerticalIcon size={28} color={Colors.light.primary} />
                    <Text
                      className="text-black font-medium text-center"
                      style={{
                        color: Colors.light.primary,
                      }}
                    >
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          ),
        tabBarIcon: ({ color }) => {
          if (route.name === "index") {
            return <HouseIcon size={24} color={color} />;
          }
          if (route.name === "pictures") {
            return <ImagesIcon size={24} color={color} />;
          }
          if (route.name === "readings") {
            return <BookOpenIcon size={24} color={color} />;
          }
          if (route.name === "notes/index") {
            return <StickyNoteIcon size={24} color={color} />;
          }
          if (route.name === "forms") {
            return <ClipboardListIcon size={24} color={color} />;
          }
          if (route.name === "scope") {
            return <RulerIcon size={24} color={color} />;
          }
          if (route.name === "documents") {
            return <FileTextIcon size={24} color={color} />;
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
