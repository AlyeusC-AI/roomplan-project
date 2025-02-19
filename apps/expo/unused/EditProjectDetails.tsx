import { useState } from "react";
import {
  Button,
  View,
  FormControl,
  Input,
  Spinner,
  Text,
  HStack,
} from "native-base";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { useToast } from "native-base";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { api } from "../utils/api";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { userStore } from "@/lib/state/user";

export default function EditProjectDetails({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) {
  const toast = useToast();
  const { session: supabaseSession } = userStore((state) => state);
  const projectPublicId = (route?.params as { projectId: string })
    .projectId as string;
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId,
  };

  const getProjectOverviewDataQuery =
    api.mobile.getProjectOverviewData.useQuery({
      jwt: supabaseSession ? supabaseSession["access_token"] : "null",
      projectPublicId,
    });

  const [clientName, setClientName] = useState(
    getProjectOverviewDataQuery.data?.project?.clientName || ""
  );
  const [clientNumber, setClientNumber] = useState(
    getProjectOverviewDataQuery.data?.project?.clientPhoneNumber || ""
  );
  const [clientEmail, setClientEmail] = useState(
    getProjectOverviewDataQuery.data?.project?.clientEmail || ""
  );
  const [location, setLocation] = useState(
    getProjectOverviewDataQuery.data?.project?.location || ""
  );

  const editProjectMutation = api.mobile.editProjectDetails.useMutation();

  const updateProject = async () => {
    try {
      await editProjectMutation.mutateAsync({
        ...queryParams,
        clientEmail,
        clientName,
        clientNumber,
        location,
      });
      await getProjectOverviewDataQuery.refetch();
      navigation.goBack();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not update project. If this error persits, please contact
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
        <FormControl mt="3">
          <FormControl.Label color="">Client Name</FormControl.Label>
          <Input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChangeText={(text) => setClientName(text)}
            size="lg"
          />
          <FormControl.Label color="">Client Email</FormControl.Label>
          <Input
            type="text"
            placeholder="Client Email"
            value={clientEmail}
            onChangeText={(text) => setClientEmail(text)}
            size="lg"
            autoCapitalize="none"
          />
          <FormControl.Label color="">Client Phone Number</FormControl.Label>
          <Input
            type="text"
            placeholder="Phone Number"
            value={clientNumber}
            onChangeText={(text) => setClientNumber(text)}
            size="lg"
          />
          <FormControl.Label color="">Address</FormControl.Label>
          <View h="56">
            <GooglePlacesAutocomplete
              placeholder="Address"
              textInputProps={{
                value: location,
              }}
              onPress={(data, details = null) => {
                setLocation(data.description);
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
            mt={4}
            w="full"
            disabled={
              editProjectMutation.isLoading ||
              getProjectOverviewDataQuery.isLoading
            }
            onPress={() => updateProject()}
          >
            {editProjectMutation.isLoading ||
            (getProjectOverviewDataQuery.isLoading &&
              !getProjectOverviewDataQuery.data) ? (
              <Spinner color="white" size="sm" />
            ) : (
              "Update"
            )}
          </Button>
        </FormControl>
      </TouchableWithoutFeedback>
    </View>
  );
}
