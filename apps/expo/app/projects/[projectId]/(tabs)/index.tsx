import {
  ScrollView,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Easing,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

import AssigneeSelect from "@/components/project/assignee";
import ProjectTags from "@/components/project/ProjectTags";
import {
  ArrowRight,
  Book,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Cog,
  Grid2X2,
  List,
  LucideIcon,
  Mail,
  Map,
  MapPin,
  Phone,
  PlayCircle,
  StickyNote,
  Video,
  X,
  AlertTriangle,
  FileText,
  Scissors,
  Ruler,
  File,
  MessageSquare,
  MessageCircle,
  Files,
  Calendar,
  Edit2,
  ChevronRight,
  LayoutGrid,
  Bot,
  Scan,
  Home,
  Image as ImageIcon,
  ChevronRightIcon,
  Plus,
  CircleDot,
  Smile,
  ChevronDownIcon,
  CircleEllipsis,
  ChevronRightCircle,
  Timer,
  Truck,
  MessageSquareText,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { uiPreferencesStore } from "@/lib/state/ui-preferences";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner-native";
import { api } from "@/lib/api";
import {
  Project,
  useGetOrganizationMembers,
  useGetProjectById,
  useGetProjectMembers,
  useGetRooms,
  useGetChambers,
} from "@service-geek/api-client";
import { Button } from "@/components/ui/button";
import ImageTagsModal from "@/components/pictures/ImageTagsModal";
import OfflineTasksManager from "@/components/project/OfflineTasksManager";
import DamageBadge from "@/components/project/damageBadge";
import AddRoomButton from "@/components/project/AddRoomButton";
import StatusBadge from "@/components/project/statusBadge";
import FloatingButtonOption from "@/components/project/floatingButtonOption";
import ChambersEmpty from "@/components/project/ChambersEmpty";
import { Separator } from "@/components/ui/separator";
import CustomerFace from "@/assets/customerFace.png";
import { Colors } from "@/constants/Colors";

// Utility to add opacity to hex color
function addOpacityToColor(color: string, opacityHex: string = "33") {
  if (!color) return color;
  // Only add opacity if color is in #RRGGBB format
  if (/^#([A-Fa-f0-9]{6})$/.test(color)) {
    return color + opacityHex;
  }
  return color;
}

export default function ProjectOverview() {
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();

  const { data: project, refetch } = useGetProjectById(projectId);
  console.log("🚀 ~ ProjectOverview ~ project:", project?.data.status);
  const [showTagsModal, setShowTagsModal] = useState(false);

  const { projectViewMode, setProjectViewMode } = uiPreferencesStore();
  // Add state to control client info modal visibility
  const [showClientInfo, setShowClientInfo] = useState(false);
  // Add state to control directions modal visibility
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  // Add state for street view image
  const [streetViewImageUrl, setStreetViewImageUrl] = useState<string | null>(
    null
  );
  const [isLoadingStreetView, setIsLoadingStreetView] = useState(false);

  // Animation refs for button press effects
  const arrivalScale = useRef(new Animated.Value(1)).current;
  const startScale = useRef(new Animated.Value(1)).current;
  const completeScale = useRef(new Animated.Value(1)).current;
  const directionsScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const lat = 40.689247;
  const lng = -74.044502;
  // Function to get Google Street View image
  const getStreetViewImage = async () => {
    if (
      !project?.data?.location ||
      !process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    ) {
      return;
    }

    try {
      setIsLoadingStreetView(true);
      let streetViewUrl = "";
      if (project.data.lat && project.data.lng) {
        streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${project.data.lat},${project.data.lng}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      } else {
        streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(project.data.location)}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      }
      console.log("Street View URL:", streetViewUrl);
      setStreetViewImageUrl(streetViewUrl);
    } catch (error) {
      console.error("Error getting street view image:", error);
    } finally {
      setIsLoadingStreetView(false);
    }
  };

  // Load street view image when project data is available
  useEffect(() => {
    if (project?.data?.location) {
      getStreetViewImage();
    }
  }, [project?.data?.location]);

  // Function to open street view in Google Maps app
  const openStreetViewInMaps = () => {
    if (!project?.data?.location) return;

    if (project.data.lat && project.data.lng) {
      // Use coordinates for more precise location
      Linking.openURL(
        `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${project.data.lat},${project.data.lng}`
      );
    } else {
      // Use address
      Linking.openURL(
        `https://www.google.com/maps/@?api=1&map_action=pano&query=${encodeURIComponent(project.data.location)}`
      );
    }
  };

  const openInMaps = () => {
    animateButton(directionsScale);
    setTimeout(() => {
      setShowDirectionsModal(true);
    }, 200);
  };

  const openGoogleMaps = () => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${project?.data.location}`
    );
    setShowDirectionsModal(false);
  };

  const openAppleMaps = () => {
    Linking.openURL(
      `http://maps.apple.com/?q=${encodeURIComponent(project?.data.location || "")}`
    );
    setShowDirectionsModal(false);
  };

  const copyAddress = async () => {
    if (project?.data.location) {
      await copyText(project.data.location);
      setShowDirectionsModal(false);
    }
  };

  const copyText = async (str?: string) => {
    if (!str) return;
    try {
      await Clipboard.setStringAsync(str);
      toast.success("Copied to clipboard!");
    } catch {
      console.error("could not copy");
    }
  };

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const navigationItems = [
    {
      path: "./chat",
      Icon: MessageCircle,
      title: "Chat",
      description: "Project conversation",
      color: "#2563eb", // blue
    },
    {
      path: "./documents",
      Icon: (props: any) => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {React.createElement(File as any, { ...props })}
        </View>
      ),
      title: "Files",
      description: "Manage project files",
      color: "#059669", // green
    },
    {
      path: "./scope",
      Icon: Ruler,
      title: "Scope ",
      description: "Manage scope of work",
      color: "#f59e42", // orange
    },
    {
      path: "./forms",
      Icon: FileText,
      title: "Forms",
      description: "Manage project forms",
      color: "#a21caf", // purple
    },
    {
      Icon: Files,
      title: "Report",
      description: "Generate project report",
      color: "#e11d48", // red
      onPress: () =>
        Linking.openURL(
          `${process.env.EXPO_PUBLIC_BASE_URL}/projects/${projectId}/report`
        ),
    },
    // {
    //   path: "./dry-standard",
    //   Icon: CheckCircle as any,
    //   title: "Dry Standard",
    //   description: "Manage dry standard goals",
    //   color: "#0ea5e9", // sky blue
    // },
  ];

  const handleArrivalPress = () => {
    animateButton(arrivalScale);
    setTimeout(() => {
      // Navigate to arrival notification screen
      router.push({
        pathname: "/notifications/arrival",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  const handleStartPress = () => {
    animateButton(startScale);
    setTimeout(() => {
      // Navigate to start work notification screen
      router.push({
        pathname: "/notifications/start-work",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  const handleCompletePress = () => {
    animateButton(completeScale);
    setTimeout(() => {
      // Navigate to complete work notification screen
      router.push({
        pathname: "/notifications/complete-work",
        params: {
          projectId: projectId,
        },
      });
    }, 200);
  };

  const { data: rooms, isLoading: loadingRooms } = useGetRooms(projectId);
  const { data: chambers, isLoading: loadingChambers } =
    useGetChambers(projectId);
  const [viewMode, setViewMode] = useState<"rooms" | "chambers">("rooms");

  const tabWidth = (Dimensions.get("window").width - 32) / 2; // 16px margin on each side
  const indicatorAnim = useRef(
    new Animated.Value(viewMode === "rooms" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(indicatorAnim, {
      toValue: viewMode === "rooms" ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [viewMode]);

  // Type assertion for Lucide icons for React Native compatibility
  const MapPinIcon = MapPin as any;
  const PlayCircleIcon = PlayCircle as any;
  const CheckCircleIcon = CheckCircle as any;
  const MapIcon = Map as any;
  const ScanIcon = Scan as any;
  const BotIcon = Bot as any;
  const ChevronRightIcon = ChevronRight as any;
  const PlusIcon = Plus as any;
  const SmileIcon = Smile as any;
  const MailIcon = Mail as any;
  const MessageSquareTextIcon = MessageSquareText as any;
  const PhoneIcon = Phone as any;
  const TruckIcon = Truck as any;
  const TimerIcon = Timer as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Card style={styles.notificationsCard}>
              <CardHeader style={styles.notificationsCardHeader}>
                <CircleDot
                  size={20}
                  style={{ marginBottom: 8 }}
                  color={Colors.light.text}
                />
                <CardTitle style={styles.notificationsCardTitle}>
                  Customer Notifications
                </CardTitle>
              </CardHeader>
              <Separator className="my-2" />
              <View style={styles.notificationsButtonRow}>
                {/* ARRIVAL BUTTON */}
                <Animated.View
                  style={[
                    styles.notificationButton,
                    { transform: [{ scale: arrivalScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      // backgroundColor: "#f3f4f6", // light gray
                      borderRadius: 12,
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleArrivalPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 14,
                        paddingHorizontal: 4,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#f3f4f6",
                          borderRadius: 999,
                          padding: 8,
                          marginBottom: 6,
                        }}
                      >
                        <TruckIcon size={30} color={Colors.light.primary} />
                      </View>
                      <Text
                        style={{
                          // color: Colors.light.primary,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        On My Way
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {/* START BUTTON */}
                <Animated.View
                  style={[
                    styles.notificationButton,
                    { transform: [{ scale: startScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      // backgroundColor: "#f3f4f6",
                      borderRadius: 12,
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleStartPress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 14,
                        paddingHorizontal: 4,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#f3f4f6",
                          borderRadius: 999,
                          padding: 8,
                          marginBottom: 6,
                        }}
                      >
                        <TimerIcon size={30} color={Colors.light.primary} />
                      </View>
                      <Text
                        style={{
                          // color: Colors.light.primary,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        Start
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {/* COMPLETE BUTTON */}
                <Animated.View
                  style={[
                    styles.notificationButton,
                    { transform: [{ scale: completeScale }] },
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      // backgroundColor: "#f3f4f6",
                      borderRadius: 12,
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={handleCompletePress}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 14,
                        paddingHorizontal: 4,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#f3f4f6",
                          borderRadius: 999,
                          padding: 8,
                          marginBottom: 6,
                        }}
                      >
                        <CheckCircleIcon
                          size={30}
                          color={Colors.light.primary}
                        />
                      </View>
                      <Text
                        style={{
                          // color: Colors.light.primary,
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        Complete
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Card>
            {/* Enhanced Project Info Card */}

            <Card style={styles.projectCard}>
              {/* CardTitle at the top: Customer Name */}
              <View style={styles.cardTitleContainer}>
                <CardTitle style={styles.cardTitle}>
                  <Image source={CustomerFace} style={styles.customerFace} />
                  <Text style={styles.customerText}>Customer</Text>
                </CardTitle>
              </View>

              {/* Street View Image (full width, below title) */}
              <TouchableOpacity
                onPress={openStreetViewInMaps}
                activeOpacity={0.9}
                style={styles.streetViewTouchable}
              >
                {isLoadingStreetView ? (
                  <View style={styles.streetViewLoadingContainer}>
                    <ActivityIndicator
                      size="large"
                      color={Colors.light.primary}
                    />
                    <Text style={styles.streetViewLoadingText}>
                      Loading street view...
                    </Text>
                  </View>
                ) : streetViewImageUrl ? (
                  <View style={styles.streetViewImageContainer}>
                    <Animated.Image
                      source={{ uri: streetViewImageUrl }}
                      style={styles.streetViewImage}
                    />
                    {/* Overlay: House Details in bottom right */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        backgroundColor: "rgba(255,255,255,0.5)", // more transparent
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        shadowColor: "#000",
                        shadowOpacity: 0.08,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {/* Beds */}
                      <View style={{ alignItems: "center", minWidth: 40 }}>
                        <Text style={{ fontWeight: "700", fontSize: 15 }}>
                          {project?.data?.beds ?? "-"}
                        </Text>
                        <Text style={{ color: "#64748b", fontSize: 11 }}>
                          Beds
                        </Text>
                      </View>
                      {/* Divider */}
                      <View
                        style={{
                          width: 1,
                          height: 28,
                          backgroundColor: "#e5e7eb",
                          marginHorizontal: 10,
                        }}
                      />
                      {/* Baths */}
                      <View style={{ alignItems: "center", minWidth: 40 }}>
                        <Text style={{ fontWeight: "700", fontSize: 15 }}>
                          {project?.data?.baths ?? "-"}
                        </Text>
                        <Text style={{ color: "#64748b", fontSize: 11 }}>
                          Baths
                        </Text>
                      </View>
                      {/* Divider */}
                      <View
                        style={{
                          width: 1,
                          height: 28,
                          backgroundColor: "#e5e7eb",
                          marginHorizontal: 10,
                        }}
                      />
                      {/* Sq. Ft. */}
                      <View style={{ alignItems: "center", minWidth: 50 }}>
                        <Text style={{ fontWeight: "700", fontSize: 15 }}>
                          {project?.data?.squareFeet ?? "-"}
                        </Text>
                        <Text style={{ color: "#64748b", fontSize: 11 }}>
                          Sq. Ft.
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : project?.data?.mainImage ? (
                  <View style={styles.streetViewImageContainer}>
                    <Animated.Image
                      source={{ uri: project.data.mainImage }}
                      style={styles.streetViewImage}
                    />
                    {/* Overlay indicating it's a project image */}
                    <View style={styles.projectImageOverlay}>
                      <Text style={styles.projectImageOverlayText}>
                        Project Image
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.streetViewFallback}>
                    <Text style={styles.streetViewFallbackText}>
                      {project?.data?.name?.[0] || "?"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Info Section */}
              <View style={styles.infoSection}>
                {/* Project Name Row: Justify between message and call icons */}
                <View style={styles.projectNameRow}>
                  <View style={styles.projectNameLeft}>
                    {/* Project Name (clickable) */}
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "./details",
                          params: { activeTab: "customer" },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.projectNameText} numberOfLines={1}>
                        {project?.data?.name}
                      </Text>
                    </TouchableOpacity>

                    {/* Status, Damage, Tags */}
                    <View style={styles.statusDamageTagsRow}>
                      {/* {project?.data?.status?.label && (
                      <StatusBadge status={project.data.status} />
                    )} */}
                      {project?.data?.lossType && (
                        <DamageBadge lossType={project.data.lossType} />
                      )}
                      {/* <ProjectTags
                      tags={project?.data?.tags}
                      onAddTags={() => setShowTagsModal(true)}
                    /> */}
                    </View>
                  </View>
                  <View style={styles.projectNameRight}>
                    {/* Message Icon */}
                    <TouchableOpacity
                      disabled={!project?.data?.clientPhoneNumber}
                      onPress={() => {
                        if (project?.data?.clientPhoneNumber) {
                          Linking.openURL(
                            `sms:${project.data.clientPhoneNumber}`
                          );
                        }
                      }}
                      style={[
                        styles.iconButton,
                        { opacity: project?.data?.clientPhoneNumber ? 1 : 0.4 },
                      ]}
                    >
                      <MessageSquareTextIcon
                        size={22}
                        color={Colors.light.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={!project?.data?.clientEmail}
                      onPress={() => {
                        if (project?.data?.clientEmail) {
                          Linking.openURL(`mailto:${project.data.clientEmail}`);
                        }
                      }}
                      style={[
                        styles.iconButton,
                        { opacity: project?.data?.clientEmail ? 1 : 0.4 },
                      ]}
                    >
                      <MailIcon size={22} color={Colors.light.primary} />
                    </TouchableOpacity>
                    {/* Call Icon */}
                    <TouchableOpacity
                      disabled={!project?.data?.clientPhoneNumber}
                      onPress={() => {
                        if (project?.data?.clientPhoneNumber) {
                          Linking.openURL(
                            `tel:${project.data.clientPhoneNumber}`
                          );
                        }
                      }}
                      style={[
                        styles.iconButton,
                        { opacity: project?.data?.clientPhoneNumber ? 1 : 0.4 },
                      ]}
                    >
                      <PhoneIcon size={22} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Customer Email and Phone */}
                {/* {project?.data?.clientEmail ? (
                  <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 2 }} numberOfLines={1}>{project.data.clientEmail}</Text>
                ) : null}
                {project?.data?.clientPhoneNumber ? (
                  <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }} numberOfLines={1}>{project.data.clientPhoneNumber}</Text>
                ) : null} */}
                {/* Location Row: Justify between location text and icon */}
                <View style={styles.locationRow}>
                  {project?.data?.location && (
                    <View style={styles.locationRowInner}>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {project.data.location}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDirectionsModal(true)}
                        style={styles.locationIconButton}
                      >
                        <MapPinIcon size={22} color={Colors.light.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setShowClientInfo(true)}
                  style={styles.customerInfoButton}
                >
                  <Text style={styles.customerInfoButtonText} numberOfLines={1}>
                    Customer Information
                  </Text>
                  {React.createElement(ChevronRightCircle as any, {
                    size: 22,
                    color: Colors.light.primary,
                  })}
                </TouchableOpacity>
              </View>
            </Card>
            {/* Client Info Button (TouchableOpacity) */}
            {/* <TouchableOpacity
          onPress={() => setShowClientInfo(true)}
          className="flex-row items-center mt-1"
        >
          <Text className="text-2xl font-bold text-foreground">
              {project?.data?.clientName}
            </Text>
            <ChevronDown size={20} className="ml-2 text-foreground" />
        </TouchableOpacity> */}

            <ImageTagsModal
              visible={showTagsModal}
              type="PROJECT"
              onClose={() => setShowTagsModal(false)}
              projectId={project?.data?.id}
              currentTags={project?.data?.tags || []}
              onTagsUpdated={() => {
                refetch();
              }}
            />
            {/* Client Info Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showClientInfo}
              onRequestClose={() => setShowClientInfo(false)}
            >
              <View className="flex-1 justify-end bg-black/50">
                <View className="bg-background rounded-t-3xl p-5">
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl font-bold text-foreground capitalize">
                        {project?.data?.name}
                      </Text>
                      {/* {project?.data?.lossType && (
                        <DamageBadge lossType={project.data.lossType} />
                      )} */}
                    </View>
                    <View className="flex-row items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => {
                          setShowClientInfo(false);
                          router.push({
                            pathname: "./details",
                            params: { activeTab: "customer" },
                          });
                        }}
                      >
                        {/* <Cog size={16} className="mr-2" /> */}
                        <Text>Edit</Text>
                      </Button>
                      <TouchableOpacity
                        onPress={() => setShowClientInfo(false)}
                        className="p-2"
                      >
                        {React.createElement(X as any, {
                          size: 20,
                          color: "#000",
                        })}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="">
                    {/* <Text className="text-sm font-medium text-muted-foreground mb-3">
                  Contact Information
                </Text> */}

                    <View className="space-y-3">
                      <View className="flex flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                          {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Map height={20} width={20} className="text-primary" />
                      </View> */}
                          <Text className="text-base ml-3 text-foreground flex-1">
                            {project?.data?.location || "No location"}
                          </Text>
                        </View>
                        {project?.data?.location && (
                          <TouchableOpacity
                            onPress={() => copyText(project?.data?.location)}
                            className="p-2"
                          >
                            {React.createElement(Files as any, {
                              size: 18,
                              color: "#000",
                              className: "text-primary-dark",
                            })}
                          </TouchableOpacity>
                        )}
                      </View>

                      {project?.data?.clientEmail ? (
                        <View className="flex flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            {/* <View className="bg-primary/10 p-2 rounded-lg">
                          <Mail
                            height={20}
                            width={20}
                            className="text-primary"
                          />
                        </View> */}
                            <Text className="text-base ml-3 text-foreground flex-1">
                              {project?.data?.clientEmail}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => copyText(project?.data?.clientEmail)}
                            className="p-2"
                          >
                            {React.createElement(Files as any, {
                              size: 18,
                              color: "#000",
                              className: "text-primary-dark",
                            })}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex flex-row items-center">
                          {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Mail height={20} width={20} className="text-primary" />
                      </View> */}
                          <Text className="text-base ml-3 text-muted-foreground">
                            No email
                          </Text>
                        </View>
                      )}

                      {project?.data?.clientPhoneNumber ? (
                        <View className="flex flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            {/* <View className="bg-primary/10 p-2 rounded-lg">
                          <Phone
                            height={20}
                            width={20}
                            className="text-primary"
                          />
                        </View> */}
                            <Text className="text-base ml-3 text-foreground flex-1">
                              {project?.data?.clientPhoneNumber}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() =>
                              copyText(project?.data?.clientPhoneNumber)
                            }
                            className="p-2"
                          >
                            {React.createElement(Files as any, {
                              size: 18,
                              color: "#000",
                              className: "text-primary-dark",
                            })}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="flex flex-row items-center">
                          {/* <View className="bg-primary/10 p-2 rounded-lg">
                        <Phone
                          height={20}
                          width={20}
                          className="text-primary"
                        />
                      </View> */}
                          <Text className="text-base ml-3 text-muted-foreground">
                            No phone
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="my-6 space-y-2 ">
                    {project?.data?.clientPhoneNumber && (
                      <View className="flex-row space-x-2 w-full justify-between">
                        <Button
                          style={{
                            backgroundColor: "#f3f4f6",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                          className="flex-1 mr-2"
                          onPress={() =>
                            Linking.openURL(
                              `sms:${project?.data?.clientPhoneNumber}`
                            )
                          }
                        >
                          {React.createElement(MessageSquare, {
                            size: 18,
                            color: "#f3f4f6",
                            fill: "#374151",
                            style: { marginRight: 6 },
                          })}
                          <Text style={{ color: "#374151" }}>Message</Text>
                        </Button>
                        <Button
                          style={{
                            backgroundColor: "#f3f4f6",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                          className="flex-1 mx-1"
                          onPress={() =>
                            Linking.openURL(
                              `tel:${project?.data?.clientPhoneNumber}`
                            )
                          }
                        >
                          {React.createElement(PhoneIcon, {
                            size: 18,
                            color: "#f3f4f6",
                            fill: "#374151",
                            style: { marginRight: 6 },
                          })}
                          <Text style={{ color: "#374151" }}>Call</Text>
                        </Button>

                        {project?.data?.clientEmail && (
                          <Button
                            style={{
                              backgroundColor: "#f3f4f6",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                            className="flex-1 ml-2"
                            onPress={() =>
                              Linking.openURL(
                                `mailto:${project?.data?.clientEmail}`
                              )
                            }
                          >
                            {React.createElement(MailIcon, {
                              size: 18,
                              color: "#f3f4f6",
                              fill: "#374151",
                              style: { marginRight: 6 },
                            })}
                            <Text style={{ color: "#374151" }}>Send Email</Text>
                          </Button>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Modal>

            {/* Directions Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showDirectionsModal}
              onRequestClose={() => setShowDirectionsModal(false)}
            >
              <View className="flex-1 justify-end bg-black/50 mb-8">
                <View className="bg-background rounded-t-3xl p-5">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-foreground">
                      Get Directions
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowDirectionsModal(false)}
                      className="p-2"
                    >
                      {React.createElement(X, { size: 20, color: "#000" })}
                    </TouchableOpacity>
                  </View>

                  <View className="space-y-3">
                    <TouchableOpacity
                      className="flex-row items-center p-4 bg-blue-50 rounded-lg"
                      onPress={openGoogleMaps}
                    >
                      <View className="bg-blue-500 p-2 rounded-lg mr-3">
                        {React.createElement(Map, { size: 20, color: "#fff" })}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          Google Maps
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Open in Google Maps app
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center p-4 bg-gray-50 rounded-lg"
                      onPress={openAppleMaps}
                    >
                      <View className="bg-gray-500 p-2 rounded-lg mr-3">
                        {React.createElement(Map, { size: 20, color: "#fff" })}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          Apple Maps
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Open in Apple Maps app
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center p-4 bg-green-50 rounded-lg"
                      onPress={copyAddress}
                    >
                      <View className="bg-green-500 p-2 rounded-lg mr-3">
                        {React.createElement(Files as any, {
                          size: 20,
                          color: "#fff",
                        })}
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          Copy Address
                        </Text>
                        <Text className="text-sm text-muted-foreground">
                          Copy address to clipboard
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View className="px-4 ">
              {/* Action buttons with text below icons for better responsiveness */}

              {/* <AssigneeSelect /> */}

              {/* Offline Tasks Manager */}
              <OfflineTasksManager projectId={projectId} />

              <View style={styles.actionButtonGroup}>
                <TouchableOpacity
                  className="bg-white rounded-lg w-full mb-2"
                  onPress={() => {
                    router.push({
                      pathname: "./lidar/rooms",
                      params: { projectId },
                    });
                  }}
                  activeOpacity={0.85}
                  style={styles.actionButton}
                >
                  <View style={styles.actionButtonIconContainer}>
                    <ScanIcon size={20} color={Colors.light.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base">Floor Plan</Text>
                    <Text className="text-xs mt-0.5">Lidar scans</Text>
                  </View>
                  <ChevronRightIcon size={20} color={Colors.light.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white rounded-lg w-full"
                  activeOpacity={1}
                  // disabled
                  style={styles.actionButton}
                  onPress={() =>
                    router.push({
                      pathname: `./copilot`,
                      params: { projectId },
                    })
                  }
                >
                  <View style={styles.actionButtonIconContainer}>
                    {React.createElement(Bot as any, {
                      size: 20,
                      color: Colors.light.primary,
                    })}
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base">Co-Pilot</Text>
                    <Text className="text-xs mt-0.5">
                      Project & Room Checklist
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>

              {/* Navigation Items Horizontal Scroll */}
              <View className="mt-6 mb-4">
                <Text className="text-lg font-bold ml-1 mb-3">
                  Quick Actions
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // contentContainerStyle={{ paddingHorizontal: 16 }}
                  className="flex-row"
                >
                  {navigationItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="  "
                      style={{
                        width: 80,
                        height: 100,
                        padding: 18,
                      }}
                      onPress={() => {
                        if (item.onPress) {
                          item.onPress();
                          return;
                        }
                        if (item.path) {
                          router.navigate({
                            pathname: item.path,
                            params: {
                              projectName: project?.data?.clientName || "",
                            },
                          });
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="flex-1 items-center justify-center">
                        <View
                          className="shadow-sm"
                          style={{
                            backgroundColor: "white",
                            borderRadius: 999,
                            padding: 10,
                            marginBottom: 6,
                          }}
                        >
                          {React.createElement(item.Icon as any, {
                            size: 30,
                            color: item.color,
                          })}
                        </View>
                        <Text numberOfLines={2}>{item.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="w-full mt-2">
                {/* Enhanced Toggle between Rooms and Chambers */}
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleRow}>
                    {/* Sliding Indicator */}
                    <Animated.View
                      style={[
                        styles.toggleIndicator,
                        {
                          left: indicatorAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [4, tabWidth + 4],
                          }),
                          width: tabWidth - 8,
                        },
                      ]}
                    />
                    {/* Rooms Tab */}
                    <TouchableOpacity
                      onPress={() => setViewMode("rooms")}
                      style={[styles.toggleTab, { width: tabWidth - 8 }]}
                      activeOpacity={0.85}
                    >
                      {React.createElement(Home as any, {
                        size: 18,
                        color: viewMode === "rooms" ? "#fff" : "#374151",
                        style: { marginRight: 6 },
                      })}
                      <Text
                        style={[
                          styles.toggleTabText,
                          { color: viewMode === "rooms" ? "#fff" : "#374151" },
                        ]}
                      >
                        Rooms ({rooms?.length || 0})
                      </Text>
                    </TouchableOpacity>
                    {/* Chambers Tab */}
                    <TouchableOpacity
                      onPress={() => setViewMode("chambers")}
                      style={[styles.toggleTab, { width: tabWidth - 8 }]}
                      activeOpacity={0.85}
                    >
                      {React.createElement(Grid2X2 as any, {
                        size: 18,
                        color: viewMode === "chambers" ? "#fff" : "#374151",
                        style: { marginRight: 6 },
                      })}
                      <Text
                        style={[
                          styles.toggleTabText,
                          {
                            color: viewMode === "chambers" ? "#fff" : "#374151",
                          },
                        ]}
                      >
                        Chambers ({chambers?.length || 0})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {viewMode === "rooms" ? (
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                  >
                    {/* Create Room Card */}
                    <TouchableOpacity
                      style={{
                        width: "48%",
                        aspectRatio: 1,
                        height: 110,
                        borderRadius: 12,
                        borderWidth: 4,
                        borderColor: "white",
                        backgroundColor: "#e0e7ef",
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowOffset: { width: 0, height: 1 },
                        shadowRadius: 2,
                        elevation: 2,
                        marginBottom: 8,
                        marginRight: 4,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => router.push("./rooms/create")}
                      activeOpacity={0.85}
                    >
                      {React.createElement(PlusIcon, {
                        size: 36,
                        color: Colors.light.primary,
                        style: { marginBottom: 8 },
                      })}
                      <Text
                        style={{
                          fontWeight: "700",
                          color: Colors.light.primary,
                        }}
                      >
                        Create Room
                      </Text>
                    </TouchableOpacity>
                    {/* Existing Room Cards */}
                    {rooms?.map((room) => (
                      <TouchableOpacity
                        key={room.id}
                        style={{
                          width: "48%", // 2 columns
                          aspectRatio: 1,
                          height: 110,
                          borderRadius: 12,
                          borderWidth: 4,
                          borderColor: "white",
                          backgroundColor: "#f3f4f6",
                          overflow: "hidden", // ensures children respect border radius
                          shadowColor: "#000",
                          shadowOpacity: 0.05,
                          shadowOffset: { width: 0, height: 1 },
                          shadowRadius: 2,
                          elevation: 2,
                          marginBottom: 8,
                          marginRight: 4,
                        }}
                        onPress={() => router.push(`./rooms/${room.id}`)}
                        activeOpacity={0.85}
                      >
                        {room.images && room.images.length > 0 ? (
                          <Image
                            source={{ uri: room.images[0].url }}
                            style={{
                              width: "100%",
                              height: "100%",
                              position: "absolute",
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {React.createElement(ImageIcon as any, {
                              size: 36,
                              color: "#9ca3af",
                              style: { opacity: 0.6 },
                            })}
                          </View>
                        )}
                        {/* Room name at the top overlay */}
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            backgroundColor: "rgba(0,0,0,0.25)",
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            className="text-base font-medium text-white"
                            numberOfLines={1}
                          >
                            {room.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <>
                    {chambers && chambers.length > 0 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 4,
                        }}
                      >
                        {/* Create Chamber Card */}
                        <TouchableOpacity
                          style={{
                            width: "48%",
                            aspectRatio: 1,
                            height: 110,
                            borderRadius: 12,
                            borderWidth: 4,
                            borderColor: "white",
                            backgroundColor: "#e0e7ef",
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOpacity: 0.05,
                            shadowOffset: { width: 0, height: 1 },
                            shadowRadius: 2,
                            elevation: 2,
                            marginBottom: 8,
                            marginRight: 4,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onPress={() => router.push("./chambers/create")}
                          activeOpacity={0.85}
                        >
                          {React.createElement(PlusIcon, {
                            size: 36,
                            color: Colors.light.primary,
                            style: { marginBottom: 8 },
                          })}
                          <Text
                            style={{
                              fontWeight: "700",
                              color: Colors.light.primary,
                            }}
                          >
                            Create Chamber
                          </Text>
                        </TouchableOpacity>
                        {/* Existing Chamber Cards */}
                        {chambers.map((chamber) => (
                          <TouchableOpacity
                            key={chamber.id}
                            style={{
                              width: "48%", // 2 columns
                              aspectRatio: 1,
                              height: 110,
                              borderRadius: 12,
                              borderWidth: 4,
                              borderColor: "white",
                              backgroundColor: "#f3f4f6",
                              overflow: "hidden",
                              shadowColor: "#000",
                              shadowOpacity: 0.05,
                              shadowOffset: { width: 0, height: 1 },
                              shadowRadius: 2,
                              elevation: 2,
                              marginBottom: 8,
                              marginRight: 4,
                            }}
                            onPress={() =>
                              router.push(
                                `./chambers/create?chamberId=${chamber.id}&chamberName=${chamber.name}`
                              )
                            }
                            activeOpacity={0.85}
                          >
                            <View
                              style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text className="text-2xl font-bold text-gray-400">
                                {chamber.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 0,
                                backgroundColor: "rgba(0,0,0,0.25)",
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                className="text-base font-medium text-white"
                                numberOfLines={1}
                              >
                                {chamber.name}
                              </Text>
                              <Text
                                className="text-xs text-gray-200"
                                numberOfLines={1}
                              >
                                {chamber.roomChambers.length} rooms
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      <ChambersEmpty
                        onPress={() => router.push(`./chambers/create`)}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Floating Action Button Options */}
      <FloatingButtonOption
        actions={[
          {
            label: "Camera",
            onPress: () => router.push("./camera"),
            disabled: !(Array.isArray(rooms) && rooms.length > 0),
            icon: Camera,
          },
          {
            label: "Create Room",
            onPress: () => router.push("./rooms/create"),
            icon: Plus,
          },
          {
            label: "Create Chamber",
            onPress: () => router.push("./chambers/create"),
            icon: Plus,
          },
        ]}
      />
    </SafeAreaView>
  );
}

function NavigationCell({
  project,
  path,
  Icon,
  title,
  description,
  onPress,
}: {
  project: Project | null;
  path?: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="w-full"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (path) {
          router.navigate({
            pathname: path,
            params: {
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="p-4">
        <View className="flex-row items-center">
          <View className="bg-primary/10 p-3 rounded-xl">
            {React.createElement(Icon as any, {
              height: 24,
              width: 24,
              color: "#000",
              className: "text-white",
            })}
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-semibold text-foreground">
              {title}
            </Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
          <Text style={{ fontSize: 20, marginLeft: 8 }}>→</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function GridCell({
  project,
  path,
  Icon,
  title,
  description,
  onPress,
}: {
  project: Project | null;
  path?: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  console.log("🚀 ~ params:", path);
  const router = useRouter();
  return (
    <TouchableOpacity
      className="w-[32%] mb-3"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (path) {
          router.navigate({
            pathname: path,
            params: {
              projectName: project?.clientName || "",
            },
          });
        }
      }}
    >
      <Card className="overflow-hidden h-[110px]">
        <View className="items-center p-3 h-full justify-center">
          <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center mb-3">
            {React.createElement(Icon as any, {
              height: 22,
              width: 22,
              color: "#000",
            })}
          </View>
          <Text className="text-sm font-semibold text-center text-foreground">
            {title}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  projectCard: {
    // marginTop: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    padding: 0,
  },
  cardTitleContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    flexDirection: "row",
    marginBottom: 10,
  },
  customerFace: {
    width: 22,
    height: 22,
    resizeMode: "contain",
    marginRight: 8,
  },
  customerText: {
    fontSize: 18,
    fontWeight: "700",
  },
  streetViewTouchable: {
    width: "100%",
    height: 160,
    backgroundColor: "#e0e7ef",
  },
  streetViewLoadingContainer: {
    width: "100%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  streetViewLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
  streetViewImageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  streetViewImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  projectImageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  projectImageOverlayText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  streetViewFallback: {
    width: "100%",
    height: 160,
    backgroundColor: "#e0e7ef",
    justifyContent: "center",
    alignItems: "center",
  },
  streetViewFallbackText: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 48,
    color: "#64748b",
  },
  infoSection: {
    paddingVertical: 18,
  },
  projectNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  projectNameLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectNameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    textTransform: "capitalize",
  },
  statusDamageTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  projectNameRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    // Styles for icon buttons
  },
  locationRow: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  locationRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    flex: 1,
  },
  locationIconButton: {
    marginLeft: 8,
  },
  customerInfoButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "#e0e7ef",
    paddingTop: 12,
  },
  customerInfoButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
  },
  notificationsCard: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  notificationsCardHeader: {
    backgroundColor: "transparent",
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationsCardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  notificationsButtonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 10,
    width: "100%",
    flex: 1,
    paddingHorizontal: 4,
  },
  notificationButton: {
    marginBottom: 12,
    width: "23%",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonGroup: {
    gap: 2,
    marginTop: 4,
    marginBottom: 2,
    width: "100%",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    backgroundColor: "white",
    borderRadius: 16,
  },
  actionButtonIconContainer: {
    backgroundColor: "#e0e7ef",
    borderRadius: 999,
    padding: 8,
    marginRight: 6,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    position: "relative",
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    padding: 4,
    position: "relative",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleIndicator: {
    position: "absolute",
    top: 4,
    borderRadius: 12,
    zIndex: 0,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    backgroundColor: Colors.light.primary,
    height: 44,
  },
  toggleTab: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    zIndex: 1,
  },
  toggleTabText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
