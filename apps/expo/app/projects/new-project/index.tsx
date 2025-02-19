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
import { toast } from "sonner-native";
import MapboxPlacesAutocomplete from "react-native-mapbox-places-autocomplete";
import { uniqueId } from "lodash";
import { projectsStore } from "@/lib/state/projects";

export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const { address, setAddress } = addressPickerStore((state) => state);
  const projects = projectsStore();
  const { session } = userStore();

  const submit = async () => {
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
          }),
        }
      );

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
    }
  };

  function select(id: string) {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${
      id
    }?session_token=${uniqueId()}&access_token=${
      process.env.EXPO_PUBLIC_MAPBOX_TOKEN
    }`;

    fetch(url)
      .then((res) => res.json())
      .then((data: RetrieveResponse) => {
        const address1 = data.features[0].properties.address ?? "";
        const address2 = "";
        const city = data.features[0].properties.context.place?.name ?? "";
        const region = data.features[0].properties.context.region?.name ?? "";
        const postalCode =
          data.features[0].properties.context.postcode?.name ?? "";
        const country = data.features[0].properties.context.country?.name ?? "";
        const state = data.features[0].properties.context.region?.name ?? "";
        const lat = data.features[0].geometry.coordinates[1];
        const lng = data.features[0].geometry.coordinates[0];

        const formattedAddress = data.features[0].properties.place_formatted;

        console.log(JSON.stringify(data, null, 2));

        const formattedData: AddressType = {
          address1,
          address2,
          formattedAddress,
          city,
          region,
          postalCode,
          country,
          lat,
          lng,
          state,
        };

        setAddress(formattedData);
      });
  }

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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Street Address</Text>

              <View style={styles.sectionBody}>
                <MapboxPlacesAutocomplete
                  id="origin"
                  placeholder="Enter your street address"
                  accessToken={process.env.EXPO_PUBLIC_MAPBOX_TOKEN}
                  onPlaceSelect={(data: any) => {
                    select(data.properties.mapbox_id);
                    console.log(JSON.stringify(data, null, 2));
                  }}
                  // {"address": "2301", "center": [-73.950167, 40.609356], "context": [{"id": "neighborhood.378506476", "mapbox_id": "dXJuOm1ieHBsYzpGbytNN0E", "text": "Madison"}, {"id": "postcode.27848428", "mapbox_id": "dXJuOm1ieHBsYzpBYWp1N0E", "text": "11229"}, {"id": "locality.66915052", "mapbox_id": "dXJuOm1ieHBsYzpBLzBLN0E", "text": "Brooklyn", "wikidata": "Q18419"}, {"id": "place.233720044", "mapbox_id": "dXJuOm1ieHBsYzpEZTVJN0E", "text": "New York", "wikidata": "Q60"}, {"id": "district.12379884", "mapbox_id": "dXJuOm1ieHBsYzp2T2Jz", "text": "Kings County", "wikidata": "Q11980692"}, {"id": "region.107756", "mapbox_id": "dXJuOm1ieHBsYzpBYVRz", "short_code": "US-NY", "text": "New York", "wikidata": "Q1384"}, {"id": "country.8940", "mapbox_id": "dXJuOm1ieHBsYzpJdXc", "short_code": "us", "text": "United States", "wikidata": "Q30"}], "geometry": {"coordinates": [-73.950167, 40.609356], "type": "Point"}, "id": "address.7378958179886160", "place_name": "2301 Quentin Road, Brooklyn, New York 11229, United States", "place_type": ["address"], "properties": {"accuracy": "rooftop", "mapbox_id": "dXJuOm1ieGFkcjowOTg5ODU5Zi00MDZiLTQxOGQtOTdjZS1kZGMwYzYyYmM5MGQ"}, "relevance": 1, "text": "Quentin Road", "type": "Feature"}
                  onClearInput={() => {
                    setAddress(null);
                  }}
                  countryId="us"
                  inputStyle={styles.sectionInput}
                  containerStyle={{
                    marginBottom: 12,
                  }}
                />
              </View>
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
