// import { useState } from "react";
// import {
//   Button,
//   View,
//   FormControl,
//   Input,
//   Spinner,
//   HStack,
//   Text,
// } from "native-base";
// import React from "react";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import { useToast } from "native-base";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";
// import { api } from "@/utils/api";
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

import { api } from "@/utils/api";
import { addressPickerStore } from "@/utils/state/address-picker";
import { userStore } from "@/utils/state/user";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, { useState } from "react";
import { Keyboard } from "react-native";
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
import { Toast } from "toastify-react-native";

export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const { address } = addressPickerStore((state) => state);
  const { session } = userStore((state) => state);

  const createNewProject = api.mobile.createNewProject.useMutation();

  const submit = async () => {
    try {
      Keyboard.dismiss()
      if (projectName.length < 3) {
        Toast.error("Your client name must be at least 3 characters long.");
        return;
      }

      if (!address) {
        Toast.error("Please enter a valid address");
        return;
      }

      const { publicId } = await createNewProject.mutateAsync({
        jwt: session ? session.access_token : "null",
        name: projectName,
        location: address,
      });
      router.push({
        pathname: `/projects/${publicId}`,
        params: { projectName },
      });
    } catch (e) {
      console.error(e);
      Toast.error(
        "Could not create project. If this error persits, please contact support@servicegeek.app"
      );
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Street Address</Text>

          <View style={styles.sectionBody}>
            <TextInput
              onPress={() =>
                router.push({ pathname: "projects/address-input" })
              }
              clearButtonMode="while-editing"
              placeholder="Enter your street address"
              style={styles.sectionInput}
              value={address?.address1 ?? ""}
              readOnly
            />
          </View>
        </View>

        <TouchableOpacity onPress={submit}>
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Next</Text>

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
    marginTop: 50,
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
