import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Button,
  View,
  FormControl,
  Input,
  Spinner,
  HStack,
  Text,
  KeyboardAvoidingView,
} from "native-base";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useToast } from "native-base";
// import { MaterialIcons } from "@expo/vector-icons";
import { getConstants } from "../lib/constants";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { api } from "../utils/api";
import { useRecoilState } from "recoil";
import userSessionState from "../atoms/user";

const servicegeekUrl = getConstants().servicegeekUrl!;

export default function ProjectCreationScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) {
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const toast = useToast();
  const [supabaseSession] = useRecoilState(userSessionState);

  const createNewProject = api.mobile.createNewProject.useMutation();

  const createProject = async () => {
    try {
      const { publicId } = await createNewProject.mutateAsync({
        jwt: supabaseSession ? supabaseSession["access_token"] : "null",
        name: clientName,
        location: address,
      });
      navigation.replace("Project", {
        projectName: clientName,
        projectId: publicId,
      });
    } catch (e) {
      console.error(e);
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not create project. If this error persits, please contact
              support@servicegeek.com
            </Text>
          </HStack>
        ),
        bottom: "16",
      });
    }
  };

  return (
    <View
      bg="#fff"
      alignItems="flex-start"
      padding="4"
      justifyContent="space-between"
      h="full"
      w="full"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <FormControl h="full">
          <FormControl.Label color="">Project Name</FormControl.Label>
          <Input
            type="text"
            placeholder="Name"
            value={clientName}
            onChangeText={(text) => setClientName(text)}
            size="lg"
          />
          <FormControl.Label>Address</FormControl.Label>
          <View h="56">
            <GooglePlacesAutocomplete
              placeholder="Address"
              onPress={(data, details = null) => {
                setAddress(data.description);
              }}
              query={{
                key: "AIzaSyCwLWHxXafe8aHy1mZkU9mwnFcXPSMsePo",
                language: "en",
              }}
              styles={{
                textInputContainer: {
                  border: 1,
                  borderColor: "rgb(212, 212, 212)",
                  borderWidth: 1,
                  borderRadius: 4,
                  height: 38,
                },
                textInput: {
                  height: 34,
                  fontSize: 16,
                },
                predefinedPlacesDescription: {
                  color: "#1faadb",
                },
              }}
            />
          </View>

          <Button
            w="full"
            disabled={createNewProject.isLoading}
            onPress={() => createProject()}
          >
            {createNewProject.isLoading ? (
              <Spinner color="white" size="sm" />
            ) : (
              "Create"
            )}
          </Button>
        </FormControl>
      </TouchableWithoutFeedback>
    </View>
  );
}
