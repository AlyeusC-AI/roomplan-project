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
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapboxPlacesAutocomplete from "react-native-mapbox-places-autocomplete";
import { toast } from "sonner-native";

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

  const navigation = useNavigation();

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
      }

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
      router.dismiss();
    } catch {
      toast.error(
        "Could not update project. If this error persits, please contact support@servicegeek.com"
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Name</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientName}
              placeholder="Enter client name"
              style={styles.sectionInput}
              value={clientName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Email</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientEmail}
              placeholder="Enter client email"
              style={styles.sectionInput}
              value={clientEmail}
            />
          </View>
        </View>
        <View style={styles.section}>
          <View className="flex flex-row justify-between items-center">
          <Text style={styles.sectionTitle}>Client Phone Number</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${project.project?.clientPhoneNumber}`)}>
            <Text className="text-primary flex items-center"><Phone size={13} className="text-primary" /> Call</Text>
          </TouchableOpacity>
          </View>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={setClientNumber}
              placeholder="Enter client phone number"
              style={styles.sectionInput}
              value={clientPhoneNumber}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Address</Text>

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

        <TouchableOpacity disabled={loading} onPress={updateProject}>
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
