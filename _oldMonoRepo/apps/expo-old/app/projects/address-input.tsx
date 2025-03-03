import { useDebounce } from "@/utils/debounce";
import { router, useNavigation } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { uniqueId } from "lodash";
import { addressPickerStore } from "@/lib/state/address-picker";

export default function AddressInput() {
  const navigation = useNavigation();
  const [value, setValue] = useState<Suggestion | null>(null);
  const [address, setAddress] = useState("");
  const addressStore = addressPickerStore((state) => state);
  const [data, setData] = useState<{ suggestions: Suggestion[] } | null>(null);

  const debouncedSearchInput = useDebounce(address, 500);

  const predictions: Suggestion[] = data?.suggestions || [];

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  });

  useEffect(() => {
    fetch(
      `https://api.mapbox.com/search/searchbox/v1/suggest?q=${debouncedSearchInput}&language=en&limit=10&session_token=${uniqueId()}&country=US&access_token=${
        process.env.EXPO_PUBLIC_MAPBOX_TOKEN
      }`
    )
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [debouncedSearchInput]);

  function select() {
    if (!value) {
      return;
    }

    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${
      value.mapbox_id
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

        addressStore.setAddress(formattedData);
        router.back();
      });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          Search Address
        </Text>

        <View style={[styles.headerAction, { alignItems: "flex-end" }]}>
          {value && (
            <TouchableOpacity onPress={select}>
              <Check color="#3C81F0" size={24} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ ...styles.section, paddingHorizontal: 16 }}>
        <Text style={styles.sectionTitle}>Address</Text>

        <View style={styles.sectionBody}>
          <TextInput
            clearButtonMode="while-editing"
            onChangeText={setAddress}
            placeholder="Enter your address"
            style={styles.sectionInput}
            value={address}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          {address.length > 0 && (
            <Text
              style={[styles.sectionTitle, { textTransform: "uppercase" }]}
            >{`${predictions.length} results found`}</Text>
          )}

          <View style={styles.sectionBody}>
            {predictions.map((prediction, index, arr) => {
              const isActive = value === prediction;

              return (
                <View
                  key={prediction.mapbox_id}
                  style={[
                    styles.rowWrapper,
                    index === 0 && styles.rowFirst,
                    index === arr.length - 1 && styles.rowLast,
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => setValue(prediction)}
                    style={styles.row}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <Text numberOfLines={1} style={styles.rowLabel}>
                        {prediction.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#a69f9f",
                          width: "100%",
                        }}
                        numberOfLines={1}
                      >
                        {prediction.place_formatted}
                      </Text>
                    </View>

                    {/* <View style={styles.rowSpacer} /> */}

                    {isActive && <Check color="#3C81F0" size={19} />}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
    marginTop: 10,
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
  sectionInput: {
    backgroundColor: "#fff",
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: "500",
    color: "#1d1d1d",
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
  /** Row */
  row: {
    height: 50,
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
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowImage: {
    width: 32,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
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
});
