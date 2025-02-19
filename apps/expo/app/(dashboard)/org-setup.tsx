import {
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { api } from "../../utils/api";

// export default function OrganizationSetup({
//   isRefetching,
//   onComplete,
// }: {
//   isRefetching: boolean;
//   onComplete: () => void;
// }) {
//   const [companyName, setCompanyName] = useState("");
//   const [companySize, setCompanySize] = useState<validSizes>("");
//   const { session } = userStore((state) => state);

//   const toast = useToast();

//   const createOrganization = api.mobile.createOrganization.useMutation();

//   async function signInWithEmail() {
//     if (!companyName) {
//       Alert.alert("Missing company name");
//       return;
//     }
//     if (!companySize) {
//       Alert.alert("Missing company size");
//       return;
//     }
//     const { org } = await createOrganization.mutateAsync({
//       jwt: session ? session["access_token"] : "null",
//       companyName,
//       companySize: sizes[companySize].size,
//     });
//     if (org.id) {
//       onComplete();
//     } else {
//       toast.show({
//         description: (
//           <HStack direction="row" space="2">
//             <Text color="white">
//               Could not create organization. If this error persits, please
//               contact support@servicegeek.com
//             </Text>
//           </HStack>
//         ),
//         bottom: "16",
//       });
//     }
//   }

//   return (
//     <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//       <KeyboardAvoidingView
//         w="full"
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <Center mt={4} padding={6}>
//           <Heading size="xl">Setup Your Business</Heading>
//           <Text textAlign="center" my={4}>
//             We just need a few additional details to setup your organizations
//             account
//           </Text>
//           <FormControl isRequired>
//             <Stack mx="4">
//               <FormControl.Label>Company Name</FormControl.Label>
//               <Input
//                 type="text"
//                 placeholder="Company Name"
//                 value={companyName}
//                 onChangeText={(text) => setCompanyName(text)}
//                 autoCapitalize="none"
//                 size="lg"
//               />
//               <FormControl.Label>Company Size</FormControl.Label>
//               <Select
//                 selectedValue={companySize}
//                 minWidth="200"
//                 accessibilityLabel="Company size"
//                 placeholder="Company size"
//                 _selectedItem={{
//                   bg: "blue.400",
//                   endIcon: <CheckIcon size="5" />,
//                 }}
//                 mt={1}
//                 onValueChange={(itemValue) =>
//                   setCompanySize(itemValue as validSizes)
//                 }
//               >
//                 <Select.Item value="1" label="1-10" />
//                 <Select.Item value="2" label="10-20" />
//                 <Select.Item value="3" label="20-50" />
//                 <Select.Item value="4" label="50-75" />
//                 <Select.Item value="5" label="75+" />
//               </Select>

//               <Button
//                 marginTop="4"
//                 disabled={createOrganization.isLoading || isRefetching}
//                 onPress={() => signInWithEmail()}
//               >
//                 {createOrganization.isLoading || isRefetching ? (
//                   <Spinner color="white" />
//                 ) : (
//                   "Setup Account"
//                 )}
//               </Button>
//             </Stack>
//           </FormControl>
//         </Center>
//       </KeyboardAvoidingView>
//     </TouchableWithoutFeedback>
//   );
// }
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
import RNPickerSelect from "react-native-picker-select";
import { ArrowRight } from "lucide-react-native";
import { userStore } from "@/lib/state/user";
import { toast } from "sonner-native";
import { router, useNavigation } from "expo-router";

const sizes = ["1-10", "10-20", "20-50", "50-75", "75+"];

export default function OrganizationSetup() {
  const { session } = userStore((state) => state);
  const navigation = useNavigation();
  const [form, setForm] = useState({
    orgName: "",
    size: "Doe",
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Setup Your Business",
      headerBackVisible: false,
    });
  });

  const createOrganization = api.mobile.createOrganization.useMutation();

  async function createOrg() {
    if (!form.orgName) {
      Alert.alert("Missing company name");
      return;
    }
    if (!form.size) {
      Alert.alert("Missing company size");
      return;
    }
    const { org } = await createOrganization.mutateAsync({
      jwt: session ? session["access_token"] : "null",
      companyName: form.orgName,
      companySize: form.size,
    });
    if (org.id) {
      router.replace("/");
    } else {
      toast.error(
        "Could not create organization. If this error persits, please contact support@restoregeek.app"
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      <KeyboardAwareScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Setup Your Business</Text>
          <Text style={styles.subtitle}>
            We just need a few additional details to setup your organization's
            account
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Name</Text>

          <View style={styles.sectionBody}>
            <TextInput
              clearButtonMode="while-editing"
              onChangeText={(orgName) => setForm({ ...form, orgName })}
              placeholder="Enter your organization's name"
              style={styles.sectionInput}
              value={form.orgName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization Size</Text>

          <View style={styles.sectionBody}>
            <View style={styles.sectionInput}>
              <RNPickerSelect
                onValueChange={(companySize) =>
                  setForm({ ...form, size: companySize })
                }
                items={sizes.map((size) => ({
                  label: size,
                  value: size,
                }))}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={createOrg}>
          <View style={styles.btn}>
            <View style={{ width: 34 }} />

            <Text style={styles.btnText}>Save</Text>

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
    marginVertical: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1d1d1d",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
    textAlign: "center",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
