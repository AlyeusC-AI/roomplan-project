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
    // {
    //   path: "./details",
    //   params: { activeTab: "insurance" },
    //   Icon: Cog,
    //   title: "Insurance Adjuster",
    //   description: "Manage insurance details",
    // },
    {
      path: "./chat",
      Icon: MessageCircle,
      title: "Chat",
      description: "Project conversation",
    },
    {
      path: "./documents",
      Icon: File,
      title: "Files",
      description: "Manage project files",
    },
    {
      path: "./scope",
      Icon: Ruler,
      title: "Scope ",
      description: "Manage scope of work",
    },
    {
      path: "./forms",
      Icon: FileText,
      title: "Forms",
      description: "Manage project forms",
    },

    // {
    //   path: "./lidar/rooms",
    //   Icon: Video,
    //   title: "Lidar Scan",
    //   description: "View 3D scans",
    // },

    // {
    //   path: "./pictures",
    //   Icon: Camera,
    //   title: "Photos",
    //   description: "Project documentation",
    // },
    // {
    //   path: "./readings",
    //   Icon: Book,
    //   title: "Readings",
    //   description: "View measurements",
    // },
    // {
    //   path: "./notes",
    //   Icon: StickyNote,
    //   title: "Notes",
    //   description: "Project notes",
    // },
    {
      Icon: Files,
      title: "Report",
      description: "Generate project report",
      onPress: () =>
        Linking.openURL(
          `${process.env.EXPO_PUBLIC_BASE_URL}/projects/${projectId}/report`
        ),
    },
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
  const PhoneIcon = Phone as any;
  const TruckIcon = Truck as any;
  const TimerIcon = Timer as any;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* Enhanced Project Info Card */}

            <Card
              style={{
                marginTop: 16,
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
                overflow: "hidden",
              }}
            >
              {/* CardTitle at the top: Customer Name */}
              <View
                style={{
                  paddingHorizontal: 18,
                  paddingTop: 18,
                  paddingBottom: 8,
                }}
              >
                <CardTitle
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    flexDirection: "row",
                    marginBottom: 10,
                  }}
                >
                  <Image
                    source={CustomerFace}
                    style={{
                      width: 22,
                      height: 22,
                      resizeMode: "contain",
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 18, fontWeight: "700" }}>
                    Customer
                  </Text>
                </CardTitle>
              </View>

              {/* Street View Image (full width, below title) */}
              <TouchableOpacity
                onPress={openStreetViewInMaps}
                activeOpacity={0.9}
                style={{
                  width: "100%",
                  height: 160,
                  backgroundColor: "#e0e7ef",
                }}
              >
                {isLoadingStreetView ? (
                  <View
                    style={{
                      width: "100%",
                      height: 160,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="large" color="#15438e" />
                    <Text
                      style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}
                    >
                      Loading street view...
                    </Text>
                  </View>
                ) : streetViewImageUrl ? (
                  <View
                    style={{ width: "100%", height: 160, position: "relative" }}
                  >
                    <Animated.Image
                      source={{ uri: streetViewImageUrl }}
                      style={{
                        width: "100%",
                        height: 160,
                        resizeMode: "cover",
                      }}
                    />
                  </View>
                ) : project?.data?.mainImage ? (
                  <View
                    style={{ width: "100%", height: 160, position: "relative" }}
                  >
                    <Animated.Image
                      source={{ uri: project.data.mainImage }}
                      style={{
                        width: "100%",
                        height: 160,
                        resizeMode: "cover",
                      }}
                    />
                    {/* Overlay indicating it's a project image */}
                    <View
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        Project Image
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 160,
                      backgroundColor: "#e0e7ef",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 48,
                        fontWeight: "700",
                        lineHeight: 48,
                        color: "#64748b",
                      }}
                    >
                      {project?.data?.name?.[0] || "?"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Info Section */}
              <View style={{ paddingVertical: 18 }}>
                {/* Project Name Row: Justify between message and call icons */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    marginBottom: 8,
                  }}
                >
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
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1e293b",
                        textAlign: "center",
                        textTransform: "capitalize",
                      }}
                      numberOfLines={1}
                    >
                      {project?.data?.name}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {/* Message Icon */}
                    <TouchableOpacity
                      disabled={!project?.data?.clientEmail}
                      onPress={() => {
                        if (project?.data?.clientEmail) {
                          Linking.openURL(`mailto:${project.data.clientEmail}`);
                        }
                      }}
                      style={{ opacity: project?.data?.clientEmail ? 1 : 0.4 }}
                    >
                      <MailIcon size={22} color="#15438e" />
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
                      style={{
                        opacity: project?.data?.clientPhoneNumber ? 1 : 0.4,
                      }}
                    >
                      <PhoneIcon size={22} color="#15438e" />
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
                <View
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    marginBottom: 8,
                  }}
                >
                  {project?.data?.location && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
                        {project.data.location}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDirectionsModal(true)}
                        style={{ marginLeft: 8 }}
                      >
                        <MapPinIcon size={22} color="#15438e" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {/* Status, Damage, Tags */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {project?.data?.status?.label && (
                      <StatusBadge status={project.data.status} />
                    )}
                    {project?.data?.lossType && (
                      <DamageBadge lossType={project.data.lossType} />
                    )}
                    <ProjectTags
                      tags={project?.data?.tags}
                      onAddTags={() => setShowTagsModal(true)}
                    />
                  </View>
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
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    paddingHorizontal: 18,
                    borderTopWidth: 1,
                    borderTopColor: "#e0e7ef",
                    paddingTop: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#1e293b",
                      textAlign: "center",
                    }}
                    numberOfLines={1}
                  >
                    Customer Information
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowClientInfo(true)}
                    style={{ marginLeft: 8 }}
                  >
                    {React.createElement(ChevronRightCircle as any, {
                      size: 22,
                      color: "#15438e",
                    })}
                  </TouchableOpacity>
                </View>
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
                    <View className="flex-col items-start">
                      <Text className="text-xl font-bold text-foreground">
                        {project?.data?.clientName}
                      </Text>
                      {project?.data?.lossType && (
                        <View className="flex flex-row items-center">
                          <View className="bg-primary/10 p-2 rounded-lg">
                            {React.createElement(AlertTriangle as any, {
                              height: 16,
                              width: 16,
                              color: "#000",
                              className: "text-primary",
                            })}
                          </View>
                          <View className="ml-3 flex-1">
                            <Text className="text-sm text-muted-foreground">
                              Damage Type
                            </Text>
                            <Text className="text-base text-foreground capitalize">
                              {project?.data?.lossType.replace(/_/g, " ")}
                            </Text>
                          </View>
                        </View>
                      )}
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
                          // variant="secondary"
                          variant="secondary"
                          className=" flex-row gap-2"
                          onPress={() =>
                            Linking.openURL(
                              `sms:${project?.data?.clientPhoneNumber}`
                            )
                          }
                        >
                          {React.createElement(MessageSquare, {
                            size: 18,
                            color: "#000",
                            className: "mr-2",
                          })}
                          <Text>Message</Text>
                        </Button>
                        <Button
                          // variant="secondary"
                          variant="secondary"
                          className=" flex-row gap-2"
                          onPress={() =>
                            Linking.openURL(
                              `tel:${project?.data?.clientPhoneNumber}`
                            )
                          }
                        >
                          {React.createElement(PhoneIcon, {
                            size: 18,
                            color: "#000",
                            className: "mr-2",
                          })}
                          <Text>Call</Text>
                        </Button>

                        {project?.data?.clientEmail && (
                          <Button
                            // variant="secondary"
                            variant="secondary"
                            className=" flex-row gap-2 text-gray-500"
                            onPress={() =>
                              Linking.openURL(
                                `mailto:${project?.data?.clientEmail}`
                              )
                            }
                          >
                            {React.createElement(MailIcon, {
                              size: 18,
                              color: "#000",
                              className: "mr-2",
                            })}
                            <Text>Send Email</Text>
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
            <Card
              style={{
                marginBottom: 10,
                backgroundColor: "white",
                borderRadius: 16,
                marginHorizontal: 16,
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <CardHeader
                style={{
                  backgroundColor: "transparent",
                  paddingBottom: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {/* <CircleDot size={20} color="#15438e" /> */}
                <CardTitle style={{ fontSize: 18, fontWeight: "700" }}>
                  Customer Notifications
                </CardTitle>
              </CardHeader>
              <Separator className="my-2" />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  gap: 10,
                  width: "100%",
                  flex: 1,
                  paddingHorizontal: 4,
                  // paddingBottom: 10,
                }}
              >
                {/* ARRIVAL BUTTON */}
                <Animated.View
                  style={{
                    marginBottom: 12,
                    width: "23%",
                    transform: [{ scale: arrivalScale }],
                  }}
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
                        <TruckIcon size={30} color="#15438e" />
                      </View>
                      <Text
                        style={{
                          color: "#15438e",
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
                  style={{
                    width: "23%",
                    marginBottom: 12,
                    transform: [{ scale: startScale }],
                  }}
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
                        <TimerIcon size={30} color="#15438e" />
                      </View>
                      <Text
                        style={{
                          color: "#15438e",
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
                  style={{
                    width: "23%",
                    marginBottom: 0,
                    transform: [{ scale: completeScale }],
                  }}
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
                        <CheckCircleIcon size={30} color="#15438e" />
                      </View>
                      <Text
                        style={{
                          color: "#15438e",
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

            <View className="px-4 ">
              {/* Action buttons with text below icons for better responsiveness */}

              <AssigneeSelect />

              {/* Offline Tasks Manager */}
              <OfflineTasksManager projectId={projectId} />

              <View className="gap-2 mt-4 mb-2 w-full">
                <TouchableOpacity
                  className="bg-white rounded-lg w-full mb-2"
                  onPress={() => {
                    router.push({
                      pathname: "./lidar/rooms",
                      params: { projectId },
                    });
                  }}
                  activeOpacity={0.85}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 48,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <View className="bg-primary/10 rounded-full p-2 mr-3">
                    <ScanIcon size={20} color="#15438e" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base">Floor Plan</Text>
                    <Text className="text-xs mt-0.5">Lidar scans</Text>
                  </View>
                  <ChevronRightIcon size={20} color="#15438e" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white rounded-lg w-full"
                  activeOpacity={1}
                  // disabled
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 48,
                    opacity: 1,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: `./copilot`,
                      params: { projectId },
                    })
                  }
                >
                  <View className="bg-primary/10 rounded-full p-2 mr-3">
                    {React.createElement(Bot as any, {
                      size: 20,
                      color: "#15438e",
                    })}
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-base">Co-Pilot</Text>
                    <Text className="text-xs mt-0.5">
                      Project & Room Checklist
                    </Text>
                  </View>
                  <ChevronRightIcon size={20} color="#15438e" />
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
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  className="flex-row"
                >
                  {navigationItems.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="  "
                      style={{
                        width: 80,
                        height: 100,
                        padding: 12,
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
                            size: 28,
                            color: "#15438e",
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
                <View className="flex-row items-center justify-between mb-6">
                  <View className="flex-row bg-gray-200 rounded-xl p-1 shadow-sm">
                    <TouchableOpacity
                      onPress={() => setViewMode("rooms")}
                      className={`px-6 py-3 rounded-lg flex-row items-center`}
                      style={{
                        backgroundColor:
                          viewMode === "rooms" ? "#15438e" : "transparent",
                        shadowColor:
                          viewMode === "rooms" ? "#15438e" : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: viewMode === "rooms" ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: viewMode === "rooms" ? 4 : 0,
                      }}
                    >
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            viewMode === "rooms" ? "#ffffff" : "#6b7280",
                        }}
                      />
                      <Text
                        className="font-semibold text-sm"
                        style={{
                          color: viewMode === "rooms" ? "#ffffff" : "#374151",
                        }}
                      >
                        Rooms ({rooms?.length || 0})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setViewMode("chambers")}
                      className={`px-6 py-3 rounded-lg flex-row items-center`}
                      style={{
                        backgroundColor:
                          viewMode === "chambers" ? "#15438e" : "transparent",
                        shadowColor:
                          viewMode === "chambers" ? "#15438e" : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: viewMode === "chambers" ? 0.3 : 0,
                        shadowRadius: 4,
                        elevation: viewMode === "chambers" ? 4 : 0,
                      }}
                    >
                      <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            viewMode === "chambers" ? "#ffffff" : "#6b7280",
                        }}
                      />
                      <Text
                        className="font-semibold text-sm"
                        style={{
                          color:
                            viewMode === "chambers" ? "#ffffff" : "#374151",
                        }}
                      >
                        Chambers ({chambers?.length || 0})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {viewMode === "rooms" ? (
                    <AddRoomButton
                      showText={false}
                      size="sm"
                      className="rounded-full w-9 h-9 justify-center items-center bg-blue-50 border border-blue-200"
                      onPress={() => router.push(`./rooms/create`)}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => router.push(`./chambers/create`)}
                      className="rounded-full w-9 h-9 justify-center items-center bg-blue-50 border border-blue-200"
                    >
                      <PlusIcon size={20} color="#15438e" />
                    </TouchableOpacity>
                  )}
                </View>
                {viewMode === "rooms" ? (
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                  >
                    {rooms?.map((room) => (
                      <TouchableOpacity
                        key={room.id}
                        style={{
                          width: "30%",
                          aspectRatio: 1,
                          marginBottom: 12,
                          height: 70,
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
                            // borderTopLeftRadius: 24,
                            // borderTopRightRadius: 24,
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
                          gap: 12,
                        }}
                      >
                        {chambers.map((chamber) => (
                          <TouchableOpacity
                            key={chamber.id}
                            style={{
                              width: "48%",
                              aspectRatio: 1,
                              marginBottom: 12,
                              borderRadius: 12,
                              height: 70,
                              backgroundColor: "#f3f4f6",
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
                                bottom: 0,
                                backgroundColor: "rgba(0,0,0,0.45)",
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
