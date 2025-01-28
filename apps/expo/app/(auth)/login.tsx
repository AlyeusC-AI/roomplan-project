import React, { useEffect, useState } from "react";

// Supabase
import { supabase } from "@/utils/supabase";

import { Link, router, useNavigation } from "expo-router";

// UI
import { Toast } from "toastify-react-native";
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

// export default function LoginScreen() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigation = useNavigation();

//   useEffect(() => {
//     navigation.setOptions({ headerTitle: "Log In" });
//   }, [navigation]);

//   async function signInWithEmail() {
//     setLoading(true);
//     const { error } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: password,
//     });

//     if (error) {
//       toast.show({
//         placement: "top",
//         render: ({ id }) => {
//           return (
//             <Toast nativeID={id} variant="outline" action="error">
//               <ToastTitle>{error.message}</ToastTitle>
//             </Toast>
//           );
//         },
//       });
//     }
//     setLoading(false);
//   }

//   const {
//     control,
//     formState: { errors },
//     handleSubmit,
//     reset,
//   } = useForm<SignInSchemaType>({
//     resolver: zodResolver(signInSchema),
//   });
//   const [isEmailFocused, setIsEmailFocused] = useState(false);

//   const toast = useToast();

//   const onSubmit = (_data: SignInSchemaType) => {
//     toast.show({
//       placement: "bottom right",
//       render: ({ id }) => {
//         return (
//           <Toast nativeID={id} variant="outline" action="success">
//             <ToastTitle>Signed in successfully</ToastTitle>
//           </Toast>
//         );
//       },
//     });
//     reset();
//     // Implement your own onSubmit and navigation logic here.
//   };

//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <KeyboardAvoidingView
//       className=" flex bg-white items-center justify-center p-4 w-screen h-screen"
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <View className="w-full flex items-center justify-center">
//           <View className="w-[300px] h-[100px]">
//             <Image
//               className="w-full h-full flex m-2"
//               source={{
//                 uri: "https://servicegeek.app/images/brand/servicegeek.png",
//               }}
//               alt="ServiceGeek Logo"
//               style={{
//                 flex: 1,
//                 width: "100%",
//                 height: "100%",
//                 resizeMode: "contain",
//               }}
//             />
//           </View>
//           <Heading size="xl" className=" my-8">
//             Log in into your account
//           </Heading>
//           <VStack>
//             <VStack className=" mx-4">
//               <FormControl isRequired>
//                 <FormControlLabel>
//                   <FormControlLabelText>Email</FormControlLabelText>
//                 </FormControlLabel>
//                 <Input size="lg" className="w-96">
//                   <InputField
//                     type="text"
//                     autoCapitalize="none"
//                     size="6xl"
//                     value={email}
//                     onChangeText={(text) => setEmail(text)}
//                     placeholder="Email"
//                   />
//                 </Input>
//               </FormControl>

//               <FormControl isRequired className="my-4">
//                 <FormControlLabel>
//                   <FormControlLabelText>Password</FormControlLabelText>
//                 </FormControlLabel>
//                 <Input size="lg" className="w-96">
//                   <InputField
//                     type={showPassword ? "text" : "password"}
//                     autoCapitalize="none"
//                     size="lg"
//                     value={password}
//                     onChangeText={(text) => setPassword(text)}
//                     placeholder="Password"
//                   />
//                   <InputSlot
//                     className="pr-3"
//                     onPress={() => setShowPassword(!showPassword)}
//                   >
//                     <InputIcon as={showPassword ? Eye : EyeClosed} />
//                   </InputSlot>
//                 </Input>
//               </FormControl>
//               <Button
//                 className="mt-4"
//                 disabled={loading}
//                 onPress={() => signInWithEmail()}
//               >
//                 {loading ? (
//                   <Spinner color="white" />
//                 ) : (
//                   <ButtonText>Sign In</ButtonText>
//                 )}
//               </Button>
//               <HStack
//                 space="sm"
//                 className=" mt-56 flex items-center justify-center"
//               >
//                 <Text className="text-black">Don't have an account yet?</Text>
//                 <Link className="text-primary-800 font-bold" href="/register">
//                   Register
//                 </Link>
//               </HStack>
//             </VStack>
//           </VStack>
//         </View>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerTitle: "Log In" });
  }, [navigation]);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      Toast.error(error.message, "top");
    }
    setLoading(false);
    router.replace({ pathname: "/" });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://servicegeek.app/images/brand/servicegeek.png",
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
            <Text style={styles.inputLabel}>Password</Text>

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
            <TouchableOpacity disabled={loading} onPress={signInWithEmail}>
              <View style={styles.btn}>
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnText}>Sign in</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <Link href="/register">
            <Text style={styles.formFooter}>
              Don't have an account?{" "}
              <Text style={{ textDecorationLine: "underline" }}>
                Create one.
              </Text>
            </Text>
          </Link>
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
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    textAlign: "center",
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
