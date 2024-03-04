import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { supabase } from "../lib/supabase";
import {
  Box,
  FormControl,
  Stack,
  Input,
  Button,
  Heading,
  Image,
  KeyboardAvoidingView,
  Center,
  Spinner,
  CheckIcon,
  Select,
  View,
} from "native-base";
import { AuthStackParamList } from "../types/Navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export default function RegisterScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList>) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lead, setLead] = useState("");

  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          isSupportUser: false,
          firstName,
          lastName,
          lead,
        },
      },
    });
    if (error) {
      Alert.alert(error.message);
    } else {
      try {
        if (!__DEV__) {
          const res = await fetch(
            "https://hooks.slack.com/services/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",
            {
              method: "POST",
              body: JSON.stringify({
                blocks: [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: "New user signup :wave:",
                    },
                  },
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `• email: ${email} \n • first name: ${firstName} \n • last name: ${lastName} \n • lead: ${lead} \n platform: mobile`,
                    },
                  },
                ],
              }),
            }
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      w="full"
      flex={1}
      bg="#fff"
      alignItems="center"
      justifyContent="center"
      padding="4"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          w="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Heading size="sm">Create an account for your business</Heading>
          <FormControl isRequired>
            <Stack mx="4">
              <FormControl.Label>Email</FormControl.Label>
              <Input
                type="text"
                placeholder="email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                size="lg"
              />
              <FormControl.Label>First Name</FormControl.Label>
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                autoCapitalize="none"
                size="lg"
              />
              <FormControl.Label>Last Name</FormControl.Label>
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                autoCapitalize="none"
                size="lg"
              />
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                placeholder="password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                autoCapitalize="none"
                size="lg"
              />
              <FormControl.HelperText>
                Must be atleast 6 characters.
              </FormControl.HelperText>
              <FormControl.Label>How did you hear about us?</FormControl.Label>
              <Select
                selectedValue={lead}
                minWidth="200"
                accessibilityLabel="How did you hear about us?"
                placeholder="How did you hear about us?"
                _selectedItem={{
                  bg: "blue.400",
                  endIcon: <CheckIcon size="5" />,
                }}
                mt={1}
                onValueChange={(itemValue) => setLead(itemValue)}
              >
                <Select.Item label="Search Engine" value="Search Engine" />
                <Select.Item
                  label="LinkedIn Advertisement"
                  value="LinkedIn Advertisement"
                />
                <Select.Item label="At a Convention" value="At a Convention" />
                <Select.Item label="Word of Mouth" value="Word of Mouth" />
                <Select.Item label="Email" value="Email" />
                <Select.Item label="Other" value="Other" />
              </Select>

              <Button
                marginTop="4"
                disabled={loading}
                onPress={() => signInWithEmail()}
              >
                {loading ? <Spinner color="white" /> : "Sign Up"}
              </Button>
              <Button
                onPress={() => navigation.navigate("Login")}
                variant="ghost"
                marginTop="4"
              >
                Back to Login
              </Button>
            </Stack>
          </FormControl>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
