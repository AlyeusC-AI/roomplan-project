// import { useState } from "react";
// import React from "react";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import { userStore } from "@/utils/state/user";

// export default function ProjectCreationScreen() {
//   const [clientName, setClientName] = useState("");
//   const [address, setAddress] = useState("");
//   const toast = useToast();
//   const { session: supabaseSession } = userStore((state) => state);

//   const createNewProject = api.mobile.createNewProject.useMutation();

//   const createProject = async () => {
//     try {
//       const { publicId } = await createNewProject.mutateAsync({
//         jwt: supabaseSession ? supabaseSession["access_token"] : "null",
//         name: clientName,
//         location: address,
//       });
//       navigation.replace("Project", {
//         projectName: clientName,
//         projectId: publicId,
//       });
//     } catch (e) {
//       console.error(e);
//       toast.show({
//         description: (
//           <HStack direction="row" space="2">
//             <Text color="white">
//               Could not create project. If this error persits, please contact
//               support@servicegeek.com
//             </Text>
//           </HStack>
//         ),
//         bottom: "16",
//       });
//     }
//   };

//   return (
//     <View
//       bg="#fff"
//       alignItems="flex-start"
//       padding="4"
//       justifyContent="space-between"
//       h="full"
//       w="full"
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <FormControl h="full">
//           <FormControl.Label color="">Project Name</FormControl.Label>
//           <Input
//             type="text"
//             placeholder="Name"
//             value={clientName}
//             onChangeText={(text) => setClientName(text)}
//             size="lg"
//           />
//           <FormControl.Label>Address</FormControl.Label>
//           <View h="56">
//             <GooglePlacesAutocomplete
//               placeholder="Address"
//               onPress={(data, details = null) => {
//                 setAddress(data.description);
//               }}
//               query={{
//                 key: "AIzaSyCwLWHxXafe8aHy1mZkU9mwnFcXPSMsePo",
//                 language: "en",
//               }}
//               styles={{
//                 textInputContainer: {
//                   border: 1,
//                   borderColor: "rgb(212, 212, 212)",
//                   borderWidth: 1,
//                   borderRadius: 4,
//                   height: 38,
//                 },
//                 textInput: {
//                   height: 34,
//                   fontSize: 16,
//                 },
//                 predefinedPlacesDescription: {
//                   color: "#1faadb",
//                 },
//               }}
//             />
//           </View>

//           <Button
//             w="full"
//             disabled={createNewProject.isLoading}
//             onPress={() => createProject()}
//           >
//             {createNewProject.isLoading ? (
//               <Spinner color="white" size="sm" />
//             ) : (
//               "Create"
//             )}
//           </Button>
//         </FormControl>
//       </TouchableWithoutFeedback>
//     </View>
//   );
// }

import { addressPickerStore } from "@/lib/state/address-picker";
import { userStore } from "@/lib/state/user";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard } from "react-native";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { toast } from "sonner-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { uniqueId } from "lodash";
import { projectsStore } from "@/lib/state/projects";
import {
  DamageType,
  DamageTypeSelector,
} from "@/components/project/damageSelector";

export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const [damageType, setDamageType] = useState<DamageType | undefined>();
  const { address, setAddress } = addressPickerStore((state) => state);
  const projects = projectsStore();
  const { session } = userStore();
  const [currentAddress, setCurrentAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    console.log("🚀 ~ submit ~ projectName:", projectName, address);
    setLoading(true);
    try {
      Keyboard.dismiss();
      if (projectName.length < 3) {
        toast.error("Your client name must be at least 3 characters long.");
        return;
      }

      if (!address) {
        toast.error("Please enter a valid address");
        return;
      }

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${session?.access_token}`,
          },
          body: JSON.stringify({
            name: projectName,
            location: address,
            damageType,
          }),
        }
      );
      console.log("🚀 ~ submit ~ res:", res);

      const json = await res.json();

      projects.addProject(json.project);
      router.replace({
        pathname: `/projects/${json.projectId}`,
        params: { projectName },
      });
    } catch (e) {
      console.error(e);
      toast.error(
        "Could not create project. If this error persits, please contact support@restoregeek.app"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
        <View style={styles.header}>
          <View style={styles.headerAction}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#000" size={24} />
            </TouchableOpacity>
          </View>

          <Text numberOfLines={1} style={styles.headerTitle}>
            Create Project
          </Text>

          <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
        </View>

        <KeyboardAvoidingView style={styles.content}>
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Client Name</Text>

              <View style={styles.sectionBody}>
                <TextInput
                  clearButtonMode="while-editing"
                  onChangeText={setProjectName}
                  placeholder="Enter client name"
                  style={styles.sectionInput}
                  value={projectName}
                />
              </View>
            </View>

            <DamageTypeSelector
              value={damageType}
              onChange={setDamageType}
              style={styles.sectionInput}
              bodyStyle={{
                shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
              }}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Street Address</Text>

              <View style={styles.sectionBody}>
                <GooglePlacesAutocomplete
                  placeholder="Enter your street address"
                  onPress={(data, details = null) => {
                    if (details) {
                      const { geometry, formatted_address } = details;
                      setAddress({
                        formattedAddress: formatted_address,
                        lat: geometry.location.lat,
                        lng: geometry.location.lng,
                        address1: formatted_address,
                        address2: "",
                        city: "",
                        state: "",
                        country: "",
                        postalCode: "",
                        region: "",
                      });
                      setCurrentAddress(formatted_address);
                    }
                  }}
                  query={{
                    key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
                    language: "en",
                  }}
                  fetchDetails={true}
                  styles={{
                    textInputContainer: {
                      backgroundColor: "transparent",
                    },
                    textInput: styles.sectionInput,
                    container: {
                      flex: 0,
                    },
                    listView: {
                      borderWidth: 1,
                      borderColor: "rgb(212, 212, 212)",
                      borderRadius: 8,
                      backgroundColor: "white",
                      marginTop: 4,
                    },
                    row: {
                      padding: 13,
                    },
                    description: {
                      fontSize: 14,
                      color: "#1d1d1d",
                    },
                  }}
                  enablePoweredByContainer={false}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <View style={styles.btn}>
              <View style={{ width: 34 }} />

              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnText}>Next</Text>
              )}

              <ArrowRight color="#fff" size={22} style={{ marginLeft: 12 }} />
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "space-between",
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
  /** Section */
  section: {
    paddingTop: 12,
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
  sectionInput: {
    backgroundColor: "#fff",
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
    marginTop: 200,
    marginHorizontal: 24,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
    marginRight: "auto",
    marginLeft: "auto",
  },
});
