import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { supabase } from "../lib/supabase";
import {
  FormControl,
  Stack,
  Input,
  Button,
  Heading,
  Image,
  KeyboardAvoidingView,
  View,
  Spinner,
} from "native-base";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStackParamList } from "../types/Navigation";

export default function LoginScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParamList>) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
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
          <View w={300} h={100}>
            <Image
              src={"https://servicegeek.app/images/brand/servicegeek.png"}
              alt="ServiceGeek Logo"
              margin={2}
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                resizeMode: "contain",
              }}
            />
          </View>
          <Heading size="md" my={8}>
            Sign into your account
          </Heading>
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
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                defaultValue="12345"
                placeholder="password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                autoCapitalize="none"
                size="lg"
              />
              <Button
                marginTop="4"
                disabled={loading}
                onPress={() => signInWithEmail()}
              >
                {loading ? <Spinner color="white" /> : "Sign In"}
              </Button>
              <Button
                onPress={() => navigation.navigate("Register")}
                variant="ghost"
                marginTop="4"
              >
                Register
              </Button>
            </Stack>
          </FormControl>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
