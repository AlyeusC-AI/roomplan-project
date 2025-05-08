import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRequestPasswordReset } from "@service-geek/api-client";
import { router } from "expo-router";
import { toast } from "sonner-native";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const requestPasswordReset = useRequestPasswordReset();

  const handleSubmit = async () => {
    try {
      await requestPasswordReset.mutateAsync({ email: form.email });
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Failed to send reset link", {
        description: "Please check your email and try again.",
      });
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
        <KeyboardAwareScrollView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerBack}>
              <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft color="#1D2A32" size={30} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Check your email</Text>

            <Text style={styles.subtitle}>
              If an account exists with {form.email}, you will receive a
              password reset link.
            </Text>
          </View>

          <View style={styles.form}>
            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#e8ecf4" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerBack}>
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft color="#1D2A32" size={30} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Forgot password?</Text>

          <Text style={styles.subtitle}>
            Enter the email associated with your account.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email Address</Text>

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

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={requestPasswordReset.isPending}
            >
              <View style={styles.btn}>
                {requestPasswordReset.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Send reset link</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.formFooter}>
          Already have an account?{" "}
          <Text style={{ textDecorationLine: "underline" }}>Sign in</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  title: {
    fontSize: 31,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
  },
  /** Header */
  header: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  headerBack: {
    padding: 8,
    paddingTop: 0,
    position: "relative",
    marginLeft: -16,
    marginBottom: 6,
  },
  /** Form */
  form: {
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginTop: 4,
    marginBottom: 16,
  },
  formFooter: {
    paddingVertical: 24,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
    letterSpacing: 0.15,
  },
  /** Input */
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#C9D3DB",
    borderStyle: "solid",
  },
  /** Button */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: "#075eec",
    borderColor: "#075eec",
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
});
