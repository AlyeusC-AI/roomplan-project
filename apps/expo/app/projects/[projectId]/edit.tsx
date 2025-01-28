// import { useState } from "react";
// import {
//   Button,
//   View,
//   FormControl,
//   Input,
//   Spinner,
//   Text,
//   HStack,
// } from "native-base";
// import React from "react";
// import { useToast } from "native-base";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import { api } from "@/utils/api";
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
//     getProjectOverviewDataQuery.data?.project?.clientName || ""
//   );
//   const [clientNumber, setClientNumber] = useState(
//     getProjectOverviewDataQuery.data?.project?.clientPhoneNumber || ""
//   );
//   const [clientEmail, setClientEmail] = useState(
//     getProjectOverviewDataQuery.data?.project?.clientEmail || ""
//   );
//   const [location, setLocation] = useState(
//     getProjectOverviewDataQuery.data?.project?.location || ""
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

import { api } from "@/utils/api";
import { userStore } from "@/utils/state/user";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Toast } from "toastify-react-native";

export default function EditProject() {
  const { session: supabaseSession } = userStore((state) => state);
  const { projectId } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId: projectId,
  };

  const getProjectOverviewDataQuery =
    api.mobile.getProjectOverviewData.useQuery(queryParams);

  const [clientName, setClientName] = useState(
    getProjectOverviewDataQuery.data?.project?.clientName || ""
  );
  const [clientNumber, setClientNumber] = useState(
    getProjectOverviewDataQuery.data?.project?.clientPhoneNumber || ""
  );
  const [clientEmail, setClientEmail] = useState(
    getProjectOverviewDataQuery.data?.project?.clientEmail || ""
  );
  const [location, setLocation] = useState(
    getProjectOverviewDataQuery.data?.project?.location || ""
  );

  const editProjectMutation = api.mobile.editProjectDetails.useMutation();

  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({ headerShown: false })
  })

  const updateProject = async () => {
    try {
      await editProjectMutation.mutateAsync({
        ...queryParams,
        clientEmail,
        clientName,
        clientNumber,
        location,
      });
      await getProjectOverviewDataQuery.refetch();
      router.dismiss();
    } catch (e) {
      Toast.error(
        "Could not update project. If this error persits, please contact support@servicegeek.com"
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity
            onPress={() => router.dismiss()}
          >
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          Edit Project
        </Text>

        <View style={[styles.headerAction, { alignItems: "flex-end" }]} />
      </View>

      <KeyboardAwareScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Name</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientEmail}
              placeholder="Enter client name"
              style={styles.sectionInput}
              value={clientEmail}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Email</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientEmail}
              placeholder="Enter last name"
              style={styles.sectionInput}
              value={clientEmail}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Email</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientEmail}
              placeholder="Enter last name"
              style={styles.sectionInput}
              value={clientEmail}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Phone Number</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientNumber}
              placeholder="Enter last name"
              style={styles.sectionInput}
              value={clientNumber}
            />
          </View>
        </View>

        <TouchableOpacity onPress={updateProject}>
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Update</Text>

            <ArrowRight color="#fff" size={22} style={{ marginLeft: 12 }} />
          </View>
        </TouchableOpacity>
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
    marginVertical: 24,
    marginHorizontal: 36,
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
