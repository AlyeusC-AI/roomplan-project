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
import { useToast } from "native-base";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { api } from "../utils/api";
import { userStore } from "@/lib/state/user";
import { router, useLocalSearchParams } from "expo-router";

export default function RoomCreationScreen() {
  const [roomName, setRoomName] = useState("");
  const toast = useToast();

  const { session: supabaseSession } = userStore((state) => state);
  const { projectId, projectName } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId: projectId,
  };

  const createRoomMutation = api.mobile.createNewRoom.useMutation();

  const createRoom = async () => {
    try {
      await createRoomMutation.mutateAsync({
        ...queryParams,
        name: roomName,
      });
      router.dismiss();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            {/* <MaterialIcons name="error" size={24} color="red" /> */}
            <Text color="white">
              Could not create room. If this error persits, please contact
              support@restoregeek.app
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
