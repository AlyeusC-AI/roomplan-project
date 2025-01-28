import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft, ArrowRightCircle } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  TextInput,
} from "react-native";
import { Toast } from "toastify-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addressPickerStore } from "@/utils/state/address-picker";
import MapView, { Marker } from "react-native-maps";
import { userStore } from "@/utils/state/user";
import { api } from "@/utils/api";

export default function Address() {
  const { address } = addressPickerStore((state) => state);
  const { session: supabaseSession } = userStore((state) => state);

  const { projectName } = useLocalSearchParams<{ projectName: string }>();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const createNewProject = api.mobile.createNewProject.useMutation();

  const submit = async () => {
    try {
      if (!address) {
        Toast.error("Please enter a valid address");
        return;
      }

      const { publicId } = await createNewProject.mutateAsync({
        jwt: supabaseSession ? supabaseSession["access_token"] : "null",
        name: projectName,
        location: address,
      });
      router.push({ pathname: `/projects/${publicId}`, params: { projectName } });
    } catch (e) {
      console.error(e);
      Toast.error(
        "Could not create project. If this error persits, please contact support@servicegeek.app"
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
        <ArrowLeft color="#1d1d1d" size={24} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{projectName}</Text>

        <Text style={styles.headerSubtitle}>
          Select the location of your project to continue.
        </Text>
      </View>

      <KeyboardAwareScrollView>
        {address && (
          <MapView
            scrollEnabled={false}
            style={{
              height: 100,
              width: "90%",
              marginHorizontal: 16,
              marginTop: 10,
              borderRadius: 12,
            }}
            initialRegion={{
              latitude: address.lat,
              longitude: address.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{ latitude: address.lat, longitude: address.lng }}
              title={address.address1}
            />
          </MapView>
        )}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Country</Text>

          <View style={styles.sectionBody}>
            <TextInput
              onPress={() =>
                router.push({ pathname: "projects/address-input" })
              }
              clearButtonMode="while-editing"
              placeholder="Country"
              style={styles.sectionInput}
              value={address?.country ?? ""}
              readOnly
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>City</Text>

          <View style={styles.sectionBody}>
            <TextInput
              onPress={() =>
                router.push({ pathname: "projects/address-input" })
              }
              clearButtonMode="while-editing"
              placeholder="Enter your city"
              style={styles.sectionInput}
              value={address?.city ?? ""}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>State</Text>

          <View style={styles.sectionBody}>
            <TextInput
              onPress={() =>
                router.push({ pathname: "projects/address-input" })
              }
              clearButtonMode="while-editing"
              placeholder="State"
              style={styles.sectionInput}
              value={address?.state ?? ""}
              readOnly
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zip Code</Text>

          <View style={styles.sectionBody}>
            <TextInput
              onPress={() =>
                router.push({ pathname: "projects/address-input" })
              }
              clearButtonMode="while-editing"
              placeholder="Enter your zip code"
              style={styles.sectionInput}
              value={address?.postalCode ?? ""}
            />
          </View>
        </View>

        <View style={styles.sectionAction}>
          <TouchableOpacity onPress={submit}>
            <View style={styles.btn}>
              <View style={{ width: 29 }} />

              <Text style={styles.btnText}>Create Project</Text>

              <ArrowRightCircle
                color="#fff"
                size={17}
                style={{ marginLeft: 12 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Header */
  header: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  headerBack: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    marginTop: 6,
  },
  /** Section */
  section: {
    paddingTop: 12,
    paddingHorizontal: 16,
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
  sectionAction: {
    marginTop: 24,
    paddingHorizontal: 20,
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
    marginBottom: 50,
    marginHorizontal: 24,
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#fff",
  },
});
