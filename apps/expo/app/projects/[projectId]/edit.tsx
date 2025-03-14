// import { useState } from "react";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import { userStore } from "@/utils/state/user";
// import { router, useLocalSearchParams } from "expo-router";

// export default function EditProjectDetails() {
//   const toast = useToast();
//   const { session: supabaseSession } = userStore((state) => state);
//   const { projectId } = useLocalSearchParams<{ projectId: string; projectName: string }>()
//   const queryParams = {
//     jwt: supabaseSession ? supabaseSession["access_token"] : "null",
//     projectPublicId: projectId,
//   };

//   const getProjectOverviewDataQuery =
//     api.mobile.getProjectOverviewData.useQuery(queryParams);

//   const [clientName, setClientName] = useState(
//     project.project?.clientName || ""
//   );
//   const [clientNumber, setClientNumber] = useState(
//     project.project?.clientPhoneNumber || ""
//   );
//   const [clientEmail, setClientEmail] = useState(
//     project.project?.clientEmail || ""
//   );
//   const [location, setLocation] = useState(
//     project.project?.location || ""
//   );

//   const editProjectMutation = api.mobile.editProjectDetails.useMutation();

//   const updateProject = async () => {
//     try {
//       await editProjectMutation.mutateAsync({
//         ...queryParams,
//         clientEmail,
//         clientName,
//         clientNumber,
//         location,
//       });
//       await getProjectOverviewDataQuery.refetch();
//       router.dismiss();
//     } catch (e) {
//       toast.show({
//         description: (
//           <HStack direction="row" space="2">
//             <Text color="white">
//               Could not update project. If this error persits, please contact
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
//         <FormControl mt="3">
//           <FormControl.Label color="">Client Name</FormControl.Label>
//           <Input
//             type="text"
//             placeholder="Client Name"
//             value={clientName}
//             onChangeText={(text) => setClientName(text)}
//             size="lg"
//           />
//           <FormControl.Label color="">Client Email</FormControl.Label>
//           <Input
//             type="text"
//             placeholder="Client Email"
//             value={clientEmail}
//             onChangeText={(text) => setClientEmail(text)}
//             size="lg"
//             autoCapitalize="none"
//           />
//           <FormControl.Label color="">Client Phone Number</FormControl.Label>
//           <Input
//             type="text"
//             placeholder="Phone Number"
//             value={clientNumber}
//             onChangeText={(text) => setClientNumber(text)}
//             size="lg"
//           />
//           <FormControl.Label color="">Address</FormControl.Label>
//           <View h="56">
//             <GooglePlacesAutocomplete
//               placeholder="Address"
//               textInputProps={{
//                 value: location,
//               }}
//               onPress={(data, details = null) => {
//                 setLocation(data.description);
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
//             mt={4}
//             w="full"
//             disabled={
//               editProjectMutation.isLoading ||
//               getProjectOverviewDataQuery.isLoading
//             }
//             onPress={() => updateProject()}
//           >
//             {editProjectMutation.isLoading ||
//             (getProjectOverviewDataQuery.isLoading &&
//               !getProjectOverviewDataQuery.data) ? (
//               <Spinner color="white" size="sm" />
//             ) : (
//               "Update"
//             )}
//           </Button>
//         </FormControl>
//       </TouchableWithoutFeedback>
//     </View>
//   );
// }

import { addressPickerStore } from "@/lib/state/address-picker";
import { projectStore } from "@/lib/state/project";
import { userStore } from "@/lib/state/user";
import { router, useGlobalSearchParams, useNavigation } from "expo-router";
import { uniqueId } from "lodash";
import { ArrowLeft, ArrowRight, Phone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { toast } from "sonner-native";
import { FormInput, FormButton } from "@/components/ui/form";
import { Box, VStack, HStack, FormControl, Pressable } from "native-base";
import { projectsStore } from "@/lib/state/projects";

export default function EditProject() {
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const { address, setAddress } = addressPickerStore((state) => state);
  const [loading, setLoading] = useState(false);
  const project = projectStore();

  const [clientName, setClientName] = useState(
    project.project?.clientName || ""
  );
  const [clientPhoneNumber, setClientNumber] = useState(
    project.project?.clientPhoneNumber || ""
  );
  const [clientEmail, setClientEmail] = useState(
    project.project?.clientEmail || ""
  );
  const [currentAddress, setCurrentAddress] = useState(
    project.project?.location || ""
  );
  const { projects, setProjects } = projectsStore((state) => state);

  console.log(
    "🚀 ~ EditProject ~ project.project:",
    JSON.stringify({ ...project.project, currentAddress }, null, 2)
  );

  const navigation = useNavigation();
  const [firstTime, setFirstTime] = useState(true);
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });
  const updateProject = async () => {
    try {
      setLoading(true);

      const update: Record<string, unknown> = {
        clientEmail,
        clientName,
        clientPhoneNumber,
      };

      if (address) {
        update.location = address.formattedAddress;
        update.lng = address.lng;
        update.lat = address.lat;
      }

      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            "auth-token": `${supabaseSession?.access_token}`,
          },
          body: JSON.stringify(update),
        }
      );
      setLoading(false);
      project.updateProject(update);
      setProjects(
        projects.map((project) =>
          project.id === projectId ? { ...project, ...update } : project
        )
      );
      router.dismiss();
    } catch {
      toast.error(
        "Could not update project. If this error persits, please contact support@servicegeek.com"
      );
    }
  };

  const handleCallPress = () => {
    if (project.project?.clientPhoneNumber) {
      Linking.openURL(`tel:${project.project.clientPhoneNumber}`);
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
          Edit Project
        </Text>

        <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
      </View>

      <KeyboardAwareScrollView style={styles.content}>
        <VStack>
          <FormInput
            label="Client Name"
            placeholder="Enter client name"
            value={clientName}
            onChangeText={setClientName}
          />

          <FormInput
            label="Client Email"
            placeholder="Enter client email"
            value={clientEmail}
            onChangeText={setClientEmail}
          />

          <FormInput
            label="Client Phone Number"
            placeholder="Enter client phone number"
            value={clientPhoneNumber}
            onChangeText={setClientNumber}
            rightElement={
              <Pressable onPress={handleCallPress}>
                <HStack space={1} alignItems="center">
                  <Phone size={13} color="#2563eb" />
                  <Text style={styles.callText}>Call</Text>
                </HStack>
              </Pressable>
            }
          />

          <Box>
            <FormControl.Label>Client Address</FormControl.Label>
            <Box mb={4}>
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
                textInputProps={{
                  // defaultValue: currentAddress,
                  value: currentAddress,
                  onChangeText: (text) => {
                    console.log("🚀 ~ EditProject ~ text:", text);
                    if (!text && firstTime) {
                      return setFirstTime(false);
                    }
                    setCurrentAddress(text ?? currentAddress);
                  },
                }}
                styles={{
                  textInputContainer: {
                    backgroundColor: "transparent",
                  },
                  textInput: {
                    height: 44,
                    fontSize: 16,
                    fontWeight: "500",
                    color: "#1d1d1d",
                    borderWidth: 1,
                    borderColor: "rgb(212, 212, 212)",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    backgroundColor: "transparent",
                  },
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
            </Box>
          </Box>

          <FormButton onPress={updateProject} mt={2}>
            <HStack space={2} alignItems="center">
              <Text style={styles.btnText}>Update</Text>
              <ArrowRight color="#fff" size={22} />
            </HStack>
          </FormButton>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
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
    borderWidth: 1,
    borderColor: "rgb(212, 212, 212)",
  },
  /** Button */
  btnText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "600",
    color: "#fff",
  },
  callText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  addressInputContainer: {
    backgroundColor: "transparent",
  },
  addressInput: {
    height: 44,
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1d",
    borderWidth: 1,
    borderColor: "rgb(212, 212, 212)",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
