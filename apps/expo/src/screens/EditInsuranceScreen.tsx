import { useState } from "react";
import {
  Button,
  View,
  FormControl,
  Input,
  Spinner,
  Text,
  HStack,
  Pressable,
} from "native-base";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { useToast } from "native-base";
import { Keyboard, Linking, TouchableWithoutFeedback } from "react-native";
import { api } from "../utils/api";
import { userStore } from "../atoms/user";

export default function InsuranceScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) {
  const toast = useToast();
  const { session: supabaseSession } = userStore(state => state);
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

  const [adjusterName, setAdjusterName] = useState(
    getProjectOverviewDataQuery.data?.project?.adjusterName || ""
  );
  const [adjusterPhoneNumber, setAdjusterPhoneNumber] = useState(
    getProjectOverviewDataQuery.data?.project?.adjusterPhoneNumber || ""
  );
  const [insuranceClaimId, setInsuranceClaimId] = useState(
    getProjectOverviewDataQuery.data?.project?.insuranceClaimId || ""
  );
  const [adjusterEmail, setAdjusterEmail] = useState(
    getProjectOverviewDataQuery.data?.project?.adjusterEmail || ""
  );

  const editProjectMutation = api.mobile.updateInsuranceInfo.useMutation();

  const updateProject = async () => {
    try {
      await editProjectMutation.mutateAsync({
        ...queryParams,
        adjusterName,
        adjusterEmail,
        adjusterPhoneNumber,
        insuranceClaimId,
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
          <FormControl.Label color="">Adjuster Name</FormControl.Label>
          <Input
            type="text"
            placeholder="Adjuster Name"
            value={adjusterName}
            onChangeText={(text) => setAdjusterName(text)}
            size="lg"
          />
          <FormControl.Label color="">Claim Number</FormControl.Label>
          <Input
            type="text"
            placeholder="Claim Number"
            value={insuranceClaimId}
            onChangeText={(text) => setInsuranceClaimId(text)}
            size="lg"
            autoCapitalize="none"
          />
          <FormControl.Label color="">Phone Number</FormControl.Label>
          <Pressable
            onPress={() =>
              Linking.openURL(`tel:${adjusterPhoneNumber}`)
            }
          >
            <FormControl.Label color="#000">Call</FormControl.Label>
          </Pressable>

          <Input
            type="text"
            placeholder="Phone Number"
            value={adjusterPhoneNumber}
            onChangeText={(text) => setAdjusterPhoneNumber(text)}
            size="lg"
          />
          <FormControl.Label color="">Email</FormControl.Label>
          <Input
            type="text"
            placeholder="Email"
            value={adjusterEmail}
            onChangeText={(text) => setAdjusterEmail(text)}
            size="lg"
          />
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
