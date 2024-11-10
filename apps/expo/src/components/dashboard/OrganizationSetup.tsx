import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { supabase } from "../../lib/supabase";
import {
  Box,
  FormControl,
  Stack,
  Input,
  Button,
  Heading,
  KeyboardAvoidingView,
  Center,
  Spinner,
  CheckIcon,
  Select,
  HStack,
  useToast,
  Text,
} from "native-base";
import { getConstants } from "../../lib/constants";
import { api } from "../../utils/api";
import { useRecoilState } from "recoil";
import userSessionState from "../../atoms/user";

const servicegeekUrl = getConstants().servicegeekUrl!;

const sizes = [
  { id: "1", size: "1-10" },
  { id: "2", size: "10-20" },
  { id: "3", size: "20-50" },
  { id: "4", size: "50-75" },
  { id: "5", size: "75+" },
];

type validSizes = "" | "1" | "2" | "3" | "4" | "5";

export default function OrganizationSetup({
  isRefetching,
  onComplete,
}: {
  isRefetching: boolean;
  onComplete: () => void;
}) {
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState<validSizes>("");
  const [supabaseSession, setSession] = useRecoilState(userSessionState);

  const toast = useToast();

  const createOrganization = api.mobile.createOrganization.useMutation();

  async function signInWithEmail() {
    if (!companyName) {
      Alert.alert("Missing company name");
      return;
    }
    if (!companySize) {
      Alert.alert("Missing company size");
      return;
    }
    const { org } = await createOrganization.mutateAsync({
      jwt: supabaseSession ? supabaseSession["access_token"] : "null",
      companyName,
      companySize: sizes[companySize].size,
    });
    if (org.id) {
      onComplete();
    } else {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not create organization. If this error persits, please
              contact support@servicegeek.com
            </Text>
          </HStack>
        ),
        bottom: "16",
      });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        w="full"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Center mt={4} padding={6}>
          <Heading size="xl">Setup Your Business</Heading>
          <Text textAlign="center" my={4}>
            We just need a few additional details to setup your organizations
            account
          </Text>
          <FormControl isRequired>
            <Stack mx="4">
              <FormControl.Label>Company Name</FormControl.Label>
              <Input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChangeText={(text) => setCompanyName(text)}
                autoCapitalize="none"
                size="lg"
              />
              <FormControl.Label>Company Size</FormControl.Label>
              <Select
                selectedValue={companySize}
                minWidth="200"
                accessibilityLabel="Company size"
                placeholder="Company size"
                _selectedItem={{
                  bg: "blue.400",
                  endIcon: <CheckIcon size="5" />,
                }}
                mt={1}
                onValueChange={(itemValue) =>
                  setCompanySize(itemValue as validSizes)
                }
              >
                <Select.Item value="1" label="1-10" />
                <Select.Item value="2" label="10-20" />
                <Select.Item value="3" label="20-50" />
                <Select.Item value="4" label="50-75" />
                <Select.Item value="5" label="75+" />
              </Select>

              <Button
                marginTop="4"
                disabled={createOrganization.isLoading || isRefetching}
                onPress={() => signInWithEmail()}
              >
                {createOrganization.isLoading || isRefetching ? (
                  <Spinner color="white" />
                ) : (
                  "Setup Account"
                )}
              </Button>
            </Stack>
          </FormControl>
        </Center>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
