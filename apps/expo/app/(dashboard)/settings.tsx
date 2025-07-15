import { ArrowLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as StoreReview from "expo-store-review";
import * as Application from "expo-application";
import * as Linking from "expo-linking";
import { userStore } from "@/lib/state/user";
import { supabase } from "@/lib/supabase";
import { getConstants } from "@/utils/constants";
import RBSheet from "react-native-raw-bottom-sheet";
import { router } from "expo-router";
import {
  useAuthStore,
  useCurrentUser,
  useLogout,
} from "@service-geek/api-client";

export interface RBSheetRef {
  /**
   * The method to open bottom sheet.
   */
  open: () => void;

  /**
   * The method to close bottom sheet.
   */
  close: () => void;
}

export default function Settings() {
  const { mutate: logoutMutate } = useLogout();
  const { data: user } = useCurrentUser();
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });

  const [imageUrl, setImageUrl] = useState(user?.avatar ?? "");

  const [modalType, setModalType] = useState<"logout" | "delete" | null>(null);
  const deleteSheet = React.useRef<RBSheetRef | null>(null);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    logoutMutate();
    setLoading(false);
    router.replace("/login");
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch("/api/v1/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Test notification sent successfully!");
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to send test notification"
        );
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity onPress={() => router.dismiss()}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>
        <Text numberOfLines={1} style={styles.headerTitle}>
          Settings
        </Text>
        <View style={[styles.headerAction, { alignItems: "flex-end" }]}></View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.sectionBody}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.profile}
            >
              <Image
                alt=""
                source={{
                  uri: imageUrl,
                }}
                onError={() =>
                  setImageUrl(
                    `https://eu.ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&size=250`
                  )
                }
                style={styles.profileAvatar}
              />

              <View style={styles.profileBody}>
                <Text style={styles.profileName}>
                  {`${user?.firstName || ""} ${user?.lastName || ""}`}{" "}
                  {!user?.firstName && !user?.lastName && user?.email}
                </Text>

                <Text style={styles.profileHandle}>{user?.email}</Text>
              </View>

              <ChevronRight color="#bcbcbc" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.sectionBody}>
            {/* <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Language</Text>

                <View style={styles.rowSpacer} />

                <Text style={styles.rowValue}>English</Text>

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View> */}

            {/* <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Location</Text>

                <View style={styles.rowSpacer} />

                <Text style={styles.rowValue}>Los Angeles, CA</Text>

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View> */}

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email Notifications</Text>

                <View style={styles.rowSpacer} />

                <Switch
                  onValueChange={(emailNotifications) =>
                    setForm({ ...form, emailNotifications })
                  }
                  style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
                  value={form.emailNotifications}
                />
              </View>
            </View>

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>

                <View style={styles.rowSpacer} />

                <Switch
                  onValueChange={(pushNotifications) =>
                    setForm({ ...form, pushNotifications })
                  }
                  style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
                  value={form.pushNotifications}
                />
              </View>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity
                onPress={handleTestNotification}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Test Push Notification</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("mailto:support@restoregeek.app")
                }
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Contact Us</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("mailto:support@restoregeek.app")
                }
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Report Bug</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => StoreReview.requestReview()}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Rate in App Store</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => Linking.openURL("https://restoregeek.app/terms")}
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Terms of Service</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>
            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL("https://restoregeek.app/privacy")
                }
                style={styles.row}
              >
                <Text style={styles.rowLabel}>Privacy Policy</Text>

                <View style={styles.rowSpacer} />

                <ChevronRight color="#bcbcbc" size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View
              style={[
                styles.rowWrapper,
                styles.rowFirst,
                styles.rowLast,
                { alignItems: "center" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setModalType("logout");
                  deleteSheet.current?.open();
                }}
                style={styles.row}
              >
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View
              style={[
                styles.rowWrapper,
                styles.rowFirst,
                styles.rowLast,
                { alignItems: "center", backgroundColor: "#dc2626" },
              ]}
            >
              <TouchableOpacity
                onPress={() => {
                  setModalType("delete");
                  deleteSheet.current?.open();
                }}
                style={styles.row}
              >
                <Text style={[styles.rowLabel, styles.rowLabelDelete]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

        <Text style={styles.contentFooter}>
          App Version {Application.nativeApplicationVersion} #
          {Application.nativeBuildVersion}
        </Text>
      </ScrollView>
      <RBSheet
        customStyles={{ container: styles.container }}
        height={300}
        openDuration={250}
        ref={deleteSheet}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Danger Zone</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.bodyText}>
            Are you sure you want to
            <Text style={{ fontWeight: "600" }}>
              {modalType === "delete" ? " delete your profile" : " log out"}
            </Text>
            ?{"\n"}
            {modalType === "delete"
              ? "This action cannot be reversed."
              : "You will need to log back in."}
          </Text>
          <TouchableOpacity
            onPress={() => {
              modalType === "delete" ? onDelete() : logout();
            }}
            disabled={loading}
          >
            <View style={styles.btn}>
              <Text style={styles.btnText}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : modalType === "delete" ? (
                  "Delete anyway"
                ) : (
                  "Log Out"
                )}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.bodyGap} />
          <TouchableOpacity onPress={() => deleteSheet.current?.close()}>
            <View style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  /** Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#000",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: "center",
  },
  /** Content */
  content: {
    paddingHorizontal: 16,
  },
  contentFooter: {
    marginVertical: 24,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    color: "#a69f9f",
  },
  /** Section */
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: "500",
    color: "#a69f9f",
    textTransform: "uppercase",
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  /** Profile */
  profile: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: {
    marginRight: "auto",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#292929",
  },
  profileHandle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: "400",
    color: "#858585",
  },
  /** Row */
  row: {
    height: 44,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#f0f0f0",
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    fontSize: 16,
    letterSpacing: 0.24,
    color: "#000",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ababab",
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowLabelLogout: {
    width: "100%",
    textAlign: "center",
    fontWeight: "600",
    color: "#dc2626",
  },
  rowLabelDelete: {
    width: "100%",
    textAlign: "center",
    fontWeight: "600",
    color: "#fff",
  },
  /** Header */
  sheetHeader: {
    borderBottomWidth: 1,
    borderColor: "#efefef",
    padding: 16,
  },
  sheetHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  /** Body */
  body: {
    padding: 24,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    color: "#0e0e0e",
    marginBottom: 24,
    textAlign: "center",
  },
  bodyGap: {
    marginBottom: 12,
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: "#ff3c2f",
    borderColor: "#ff3c2f",
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#fff",
  },
  btnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: "#dddce0",
  },
  btnSecondaryText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#000",
  },
});

// import { supabase } from "@/utils/supabase";
// import React, { useState } from "react";
// import { getConstants } from "@/utils/constants";

// export default function SettingsScreen() {
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isOpen, setIsOpen] = React.useState(false);
//   const onClose = () => setIsOpen(false);
//   const cancelRef = React.useRef(null);

//   const logout = async () => {
//     setIsLoggingOut(true);
//     await supabase.auth.signOut();
//     setIsLoggingOut(false);
//   };

//   const onDelete = async () => {
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       const accessToken = session?.access_token;
//       const servicegeekUrl = getConstants().servicegeekUrl!;

//       const res = await fetch(`${servicegeekUrl}/api/v1/user`, {
//         method: "DELETE",
//         headers: {
//           "auth-token": accessToken || "",
//         },
//       });
//       if (res.ok) {
//         await supabase.auth.signOut();
//         setIsOpen(false);
//       }
//     } catch (error) {
//       await supabase.auth.signOut();
//       setIsOpen(false);
//     }
//   };

//   return (
//     <Box flex={1} bg="#fff" alignItems="flex-start" padding="4">
//       <View mt="3">
//         <Heading size="md" mb={4}>
//           Logout
//         </Heading>
//         <Button
//           disabled={isLoggingOut}
//           colorScheme="red"
//           variant="outline"
//           onPress={() => logout()}
//         >
//           {isLoggingOut ? <Spinner color="white" size="sm" /> : "Logout"}
//         </Button>
//       </View>
//       <View mt="3" p="2" borderColor="red.600" borderWidth="4">
//         <Heading size="md">Danger Zone</Heading>
//         <Text pt="2" pb="2">
//           To delete ServiceGeek account
//         </Text>
//         <Button
//           colorScheme="red"
//           variant="outline"
//           onPress={() => setIsOpen(!isOpen)}
//         >
//           {isDeleting ? <Spinner color="white" size="sm" /> : "Delete Account"}
//         </Button>
//         <AlertDialog
//           leastDestructiveRef={cancelRef}
//           isOpen={isOpen}
//           onClose={onClose}
//         >
//           <AlertDialog.Content>
//             <AlertDialog.CloseButton />
//             <AlertDialog.Header>Delete Account</AlertDialog.Header>
//             <AlertDialog.Body>
//               This will remove all data. This action cannot be reversed. Deleted
//               data can not be recovered.
//             </AlertDialog.Body>
//             <AlertDialog.Footer>
//               <Button.Group space={2}>
//                 <Button
//                   variant="unstyled"
//                   colorScheme="coolGray"
//                   onPress={onClose}
//                   ref={cancelRef}
//                 >
//                   Cancel
//                 </Button>
//                 <Button colorScheme="danger" onPress={onDelete}>
//                   Delete
//                 </Button>
//               </Button.Group>
//             </AlertDialog.Footer>
//           </AlertDialog.Content>
//         </AlertDialog>
//       </View>
//     </Box>
//   );
// }
