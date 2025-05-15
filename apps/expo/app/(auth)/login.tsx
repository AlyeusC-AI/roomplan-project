import React, { useState } from "react";
import { router } from "expo-router";
import { useLogin } from "@service-geek/api-client";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function Login() {
  const [form, setForm] = useState({
    email: "thermalhunting1@gmail.com",
    password: "12345678",
  });

  const login = useLogin();

  async function handleSubmit() {
    try {
      const response = await login.mutateAsync({
        email: form.email,
        password: form.password,
      });

      router.replace({ pathname: "/" });
      // The redirect is handled in the useLogin hook
    } catch (error) {
      // toast.error("Login Failed", {
      //   description: "Invalid email or password. Please try again.",
      // });
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.container}>
          <Image
            source={{
              uri: "https://restoregeek.app/images/brand/servicegeek.png",
            }}
            alt="ServiceGeek Logo"
            style={{
              width: "100%",
              height: "10%",
              resizeMode: "contain",
            }}
          />
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={styles.inputLabel}>Email address</Text>

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="email-address"
                onChangeText={(email) => setForm({ ...form, email })}
                placeholder="john@example.com"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                value={form.email}
              />
            </View>

            <View style={styles.input}>
              <View style={styles.inputLabelContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={(password) => setForm({ ...form, password })}
                placeholder="********"
                placeholderTextColor="#6b7280"
                style={styles.inputControl}
                secureTextEntry={true}
                value={form.password}
              />
            </View>

            <View style={styles.formAction}>
              <TouchableOpacity
                disabled={login.isPending}
                onPress={handleSubmit}
              >
                <View style={styles.btn}>
                  {login.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Sign in</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.formFooter}>
              <Text style={styles.formFooterText}>
                Don't have an account?{" "}
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text style={styles.formFooterLink}>Sign up</Text>
                </TouchableOpacity>
              </Text>
            </View> */}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
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
  /** Form */
  form: {
    marginBottom: 24,
  },
  formAction: {
    marginVertical: 24,
  },
  formFooter: {
    marginTop: 24,
  },
  formFooterText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    textAlign: "center",
  },
  formFooterLink: {
    color: "#075eec",
    textDecorationLine: "underline",
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },
  forgotPasswordText: {
    fontSize: 15,
    color: "#075eec",
  },
  inputControl: {
    height: 44,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: "#007aff",
    borderColor: "#007aff",
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    color: "#fff",
  },
});
