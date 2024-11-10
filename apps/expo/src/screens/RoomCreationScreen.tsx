import { useState } from "react";
import { supabase } from "../lib/supabase";
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
import { getConstants } from "../lib/constants";
import { useToast } from "native-base";
// import { MaterialIcons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRecoilState } from "recoil";
import userSessionState from "../atoms/user";
import { api } from "../utils/api";

const servicegeekUrl = getConstants().servicegeekUrl!;

export default function RoomCreationScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) {
  const [roomName, setRoomName] = useState("");
  const toast = useToast();

  const [supabaseSession] = useRecoilState(userSessionState);
  const projectPublicId = (route?.params as { projectId: string })
    .projectId as string;
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId,
  };

  const createRoomMutation = api.mobile.createNewRoom.useMutation();

  const createRoom = async () => {
    try {
      await createRoomMutation.mutateAsync({
        ...queryParams,
        name: roomName,
      });
      navigation.goBack();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            {/* <MaterialIcons name="error" size={24} color="red" /> */}
            <Text color="white">
              Could not create room. If this error persits, please contact
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
          <FormControl.Label color="">Add Room</FormControl.Label>
          <Input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChangeText={(text) => setRoomName(text)}
            size="lg"
          />
          <Button
            mt={4}
            w="full"
            disabled={createRoomMutation.isLoading}
            onPress={() => createRoom()}
          >
            {createRoomMutation.isLoading ? (
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
