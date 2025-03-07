import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Clock, Trash2, Edit, Building, User, FileText, PlayCircle, CheckCircle } from "lucide-react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { userStore } from "@/lib/state/user";
import dayjs from "dayjs";
import { projectsStore } from "@/lib/state/projects";

interface ProjectDetails {
  id: number;
  publicId: string;
  name: string;
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  companyName: string;
  managerName: string;
  adjusterEmail: string;
  adjusterName: string;
  adjusterPhoneNumber: string;
  insuranceCompanyName: string;
  insuranceClaimId: string;
  lossType: string;
  catCode: number;
  status: string;
  rcvValue: number;
  actualValue: number | null;
  lat: string;
  lng: string;
  [key: string]: any;
}

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { projects } = projectsStore();
  const { session: supabaseSession } = userStore((state) => state);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const arrivalScale = useRef(new Animated.Value(1)).current;
  const startScale = useRef(new Animated.Value(1)).current;
  const completeScale = useRef(new Animated.Value(1)).current;

  // Extract event details from params
  const eventId = params.id as string;
  const subject = params.subject as string;
  const payload = params.payload as string;
  const date = params.date as string;
  const start = params.start as string;
  const end = params.end as string;
  const projectId = params.projectId ? Number(params.projectId) : null;
  
  // Format date and time for display
  const eventDate = start ? new Date(start) : new Date(date);
  const eventEndDate = end ? new Date(end) : null;
  const formattedDate = eventDate.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedStartTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedEndTime = eventEndDate ? eventEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
  const timeDisplay = formattedEndTime ? `${formattedStartTime} to ${formattedEndTime}` : formattedStartTime;
  
  // Get project details if available
  const project = projectId ? projects.find(p => p.id === projectId) : null;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    
    // Fetch project details if we have a projectId
    if (projectId) {
      fetchProjectDetails();
    }
  }, []);

  useEffect(() => {
    // Get map image if we have a location from project details
    if (projectDetails?.location && process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
      getGoogleMapsImageUrl(projectDetails.location);
    }
  }, [projectDetails]);

  const fetchProjectDetails = async () => {
    console.log("🚀 ~ fetchProjectDetails ~ projectId:", projectId)

    if (!project?.publicId) return;
    
    try {
      setIsLoadingProject(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${project?.publicId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${supabaseSession?.access_token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setProjectDetails(data.data);
      } else {
        console.error("Failed to fetch project details");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const getGoogleMapsImageUrl = async (address: string) => {
    try {
      setIsLoadingMap(true);
      
      // If we have lat/lng in project details, use those directly
      if (projectDetails?.lat && projectDetails?.lng) {
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${projectDetails.lat},${projectDetails.lng}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${projectDetails.lat},${projectDetails.lng}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        setMapImageUrl(staticMapUrl);
      } else {
        // Otherwise, use the address directly (Google Maps API can geocode addresses)
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(address)}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        setMapImageUrl(staticMapUrl);
      }
    } catch (error) {
      console.error("Error getting map image:", error);
    } finally {
      setIsLoadingMap(false);
    }
  };

  const handleEditEvent = () => {
    router.push({
      pathname: "calendar/new-event",
      params: {
        editMode: "true",
        eventId: eventId,
        subject: subject,
        payload: payload,
        projectId: projectId?.toString() || "",
        start: start || date,
        end: end || date,
        remindClient: params.remindClient || "false",
        remindProjectOwners: params.remindProjectOwners || "false",
        reminderTime: params.reminderTime || "",
      }
    });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteEvent()
        }
      ]
    );
  };

  const deleteEvent = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/calendar-events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${supabaseSession?.access_token}`,
          },
        }
      );
      
      if (response.ok) {
        router.back();
      } else {
        Alert.alert("Error", "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "An error occurred while deleting the event");
    }
  };

  const handleEmailPress = () => {
    if (projectDetails?.clientEmail) {
      Linking.openURL(`mailto:${projectDetails.clientEmail}`);
    }
  };

  const handlePhonePress = () => {
    if (projectDetails?.clientPhoneNumber) {
      Linking.openURL(`tel:${projectDetails.clientPhoneNumber}`);
    }
  };

  const handleAddressPress = () => {
    if (projectDetails?.location) {
      // Use Google Maps for navigation
      if (projectDetails.lat && projectDetails.lng) {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${projectDetails.lat},${projectDetails.lng}`);
      } else {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(projectDetails.location)}`);
      }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEditEvent} style={styles.headerAction}>
            <Edit color="#000" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteEvent} style={styles.headerAction}>
            <Trash2 color="#ef4444" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoadingProject ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : (
          <>
            {projectDetails && (
              <View style={styles.customerSection}>
                <Text style={styles.customerName}>{projectDetails.clientName}</Text>
                
                {projectDetails.clientEmail && (
                  <TouchableOpacity onPress={handleEmailPress} style={styles.contactItem}>
                    <Mail size={18} color="#3b82f6" style={styles.contactIcon} />
                    <Text style={styles.contactText}>{projectDetails.clientEmail}</Text>
                  </TouchableOpacity>
                )}
                
                {projectDetails.clientPhoneNumber && (
                  <TouchableOpacity onPress={handlePhonePress} style={styles.contactItem}>
                    <Phone size={18} color="#3b82f6" style={styles.contactIcon} />
                    <Text style={styles.contactText}>{projectDetails.clientPhoneNumber}</Text>
                  </TouchableOpacity>
                )}

                {projectDetails.companyName && (
                  <View style={styles.contactItem}>
                    <Building size={18} color="#64748b" style={styles.contactIcon} />
                    <Text style={styles.contactTextSecondary}>{projectDetails.companyName}</Text>
                  </View>
                )}

                {projectDetails.insuranceCompanyName && (
                  <View style={styles.contactItem}>
                    <FileText size={18} color="#64748b" style={styles.contactIcon} />
                    <Text style={styles.contactTextSecondary}>
                      {projectDetails.insuranceCompanyName}
                      {projectDetails.insuranceClaimId ? ` • Claim #${projectDetails.insuranceClaimId}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.dateTimeSection}>
              <View style={styles.dateTimeItem}>
                <Calendar size={18} color="#64748b" style={styles.dateTimeIcon} />
                <Text style={styles.dateTimeText}>{formattedDate}</Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Clock size={18} color="#64748b" style={styles.dateTimeIcon} />
                <Text style={styles.dateTimeText}>{timeDisplay}</Text>
              </View>
            </View>

            {projectDetails?.location && (
              <TouchableOpacity onPress={handleAddressPress} style={styles.addressSection}>
                <View style={styles.addressHeader}>
                  <MapPin size={18} color="#64748b" style={styles.addressIcon} />
                  <Text style={styles.addressLabel}>Project Location:</Text>
                </View>
                <Text style={styles.addressText}>{projectDetails.location}</Text>
                {/* Map preview using Google Maps */}
                {process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <View style={styles.mapPreview}>
                    {isLoadingMap ? (
                      <View style={styles.mapLoading}>
                        <ActivityIndicator size="small" color="#3b82f6" />
                      </View>
                    ) : mapImageUrl ? (
                      <Image 
                        source={{ uri: mapImageUrl }} 
                        style={styles.mapImage}
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.detailsSection}>
              <Text style={styles.detailsTitle}>{subject}</Text>
              <Text style={styles.detailsDescription}>{payload}</Text>
            </View>

            {projectDetails && (
              <View style={styles.projectSection}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectLabel}>Project Details:</Text>
                </View>
                
                <View style={styles.projectDetail}>
                  <Text style={styles.projectDetailLabel}>Status:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(projectDetails.status) }]}>
                    <Text style={styles.statusText}>{projectDetails.status}</Text>
                  </View>
                </View>
                
                {projectDetails.lossType && (
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectDetailLabel}>Loss Type:</Text>
                    <Text style={styles.projectDetailValue}>{projectDetails.lossType}</Text>
                  </View>
                )}
                
                {projectDetails.rcvValue && (
                  <View style={styles.projectDetail}>
                    <Text style={styles.projectDetailLabel}>RCV Value:</Text>
                    <Text style={styles.projectDetailValue}>${projectDetails.rcvValue.toLocaleString()}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom notification buttons */}
      {!isLoadingProject && (
        <View style={styles.bottomNotificationContainer}>
          <View style={styles.notificationButtons}>
            <Animated.View style={{ 
              flex: 1, 
              transform: [{ scale: arrivalScale }],
              marginHorizontal: 4,
            }}>
              <TouchableOpacity 
                style={[styles.notificationButton, styles.arrivalButton]}
                onPress={() => {
                  animateButton(arrivalScale);
                  setTimeout(() => {
                    router.push({
                      pathname: "/notifications/arrival",
                      params: {
                        projectId: projectId?.toString(),
                        eventId: eventId
                      }
                    });
                  }, 200);
                }}
                activeOpacity={0.6}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIconContainer}>
                    <MapPin size={16} color="#fff" />
                  </View>
                  <Text style={styles.notificationButtonText}>Arrival</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ 
              flex: 1, 
              transform: [{ scale: startScale }],
              marginHorizontal: 4,
            }}>
              <TouchableOpacity 
                style={[styles.notificationButton, styles.startButton]}
                onPress={() => {
                  animateButton(startScale);
                  setTimeout(() => {
                    router.push({
                      pathname: "/notifications/start-work",
                      params: {
                        projectId: projectId?.toString(),
                        eventId: eventId
                      }
                    });
                  }, 200);
                }}
                activeOpacity={0.6}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIconContainer}>
                    <PlayCircle size={16} color="#fff" />
                  </View>
                  <Text style={styles.notificationButtonText}>Start</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View style={{ 
              flex: 1, 
              transform: [{ scale: completeScale }],
              marginHorizontal: 4,
            }}>
              <TouchableOpacity 
                style={[styles.notificationButton, styles.completeButton]}
                onPress={() => {
                  animateButton(completeScale);
                  setTimeout(() => {
                    router.push({
                      pathname: "/notifications/complete-work",
                      params: {
                        projectId: projectId?.toString(),
                        eventId: eventId
                      }
                    });
                  }, 200);
                }}
                activeOpacity={0.6}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationIconContainer}>
                    <CheckCircle size={16} color="#fff" />
                  </View>
                  <Text style={styles.notificationButtonText}>Complete</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper function to get color based on status
const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#22c55e';
    case 'pending':
      return '#f59e0b';
    case 'completed':
      return '#3b82f6';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60, // Reduced padding to account for smaller bottom buttons
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 16,
    color: "#3b82f6",
  },
  contactTextSecondary: {
    fontSize: 16,
    color: "#64748b",
  },
  dateTimeSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#334155",
  },
  addressSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressIcon: {
    marginRight: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
  },
  addressText: {
    fontSize: 16,
    color: "#334155",
    marginLeft: 26,
    marginBottom: 12,
  },
  mapPreview: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
  },
  projectSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  projectDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  projectDetailLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748b",
    width: 100,
  },
  projectDetailValue: {
    fontSize: 15,
    color: "#334155",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  bottomNotificationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
  },
  notificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12
  },
  notificationButton: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  arrivalButton: {
    backgroundColor: '#4338ca', // Darker indigo
  },
  startButton: {
    backgroundColor: '#0e7490', // Darker cyan
  },
  completeButton: {
    backgroundColor: '#15803d', // Darker green
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  notificationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  notificationButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
}); 


