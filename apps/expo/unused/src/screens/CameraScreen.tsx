import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  Heading,
  Button,
  Center,
  View,
  Image,
  Flex,
  Spinner,
} from "native-base";
import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { Camera, PhotoFile, useCameraDevice } from "react-native-vision-camera";
import { getConstants } from "../../../utils/constants";
import RoomSelection from "../components/RoomSelection";
import { createClient } from "@supabase/supabase-js";
import uuid from "react-native-uuid";
import { api } from "../utils/api";
import { userStore } from "../../../lib/state/user";

export const supabaseServiceRole = createClient(
  getConstants().supabaseUrl,
  getConstants().serviceRoleJwt
);

export default function CameraScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, "Camera">) {
  const camera = useRef<Camera>(null);
  const [lastPhoto, setLastPhoto] = useState("");
  const device = useCameraDevice("back");
  const [disabled, setDisabled] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const { rooms, projectId } = route.params;
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId: projectId,
  };

  console.log(getConstants().supabaseUrl, getConstants().serviceRoleJwt);

  const addImageToProjectMutation = api.mobile.addImageToProject.useMutation();

  const [selectedRoomId, setRoomId] = useState("");
  const onRoomSelect = (r: string) => {
    setRoomId(r);
  };

  const processImage = async (photo: PhotoFile) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("Setting last photo", photo.path);
      setLastPhoto(photo.path);
      console.log("Uploading photo");
      const fileName = photo.path.substring(photo.path.lastIndexOf("/") + 1);
      const supabasePath = `${session?.user.id}/${uuid.v4()}_${fileName}`;

      console.log("Uploading photo to", supabasePath);

      let contentType = "image/jpeg";
      if (fileName.indexOf(".png") >= 0) {
        contentType = "image/png";
      }

      const p = {
        uri: photo.path,
        type: contentType,
        name: fileName,
      };
      const formData = new FormData();
      if (p) {
        // @ts-expect-error maaaaan react-native sucks
        formData.append("file", p);
      }

      const { data, error } = await supabaseServiceRole.storage
        .from("media")
        .upload(supabasePath, formData, {
          cacheControl: "3600",
          contentType,
          upsert: false,
        });

      console.log("Uploaded photo", data, error);
      if (data) {
        addImageToProjectMutation.mutate({
          ...queryParams,
          publicRoomId: selectedRoomId,
          imageKey: data.path,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const takePhoto = async () => {
    if (!camera || !camera.current) return;
    setDisabled(true);
    try {
      console.log("TAKING PICTURE");
      const photo = await camera.current.takePhoto({
        flash: "auto",
        enableShutterSound: false,
      });
      processImage(photo);
    } catch (error) {
      console.error("Caught error");
      console.error(error);
    }
    setDisabled(false);
  };

  if (device == null)
    return (
      <Center w="full" h="full">
        <Spinner size="lg" />
        <Heading color="primary.500" fontSize="md">
          Opening Camera
        </Heading>
      </Center>
    );
  return (
    <View position="relative" h="full" w={"full"} display="flex">
      <Flex h="full" w="full" justifyContent="space-between">
        <View py="2" backgroundColor="black">
          <RoomSelection
            rooms={rooms}
            selectedRoom={selectedRoomId}
            onChange={onRoomSelect}
          />
        </View>
        <Camera
          style={{
            flex: 1,
            height: "100%",
          }}
          device={device}
          isActive={true}
          photo={true}
          ref={camera}
        />
        <Flex
          direction="row"
          w="full"
          px="4"
          justifyContent="space-between"
          alignContent="center"
          alignItems="center"
          backgroundColor="black"
          py="2"
        >
          {lastPhoto ? (
            <Image
              h="16"
              w="16"
              source={{
                uri: lastPhoto,
              }}
              size="sm"
              alt="Last Photo Taken"
              rounded="md"
              borderColor="white"
              borderWidth="2"
            />
          ) : (
            <View
              h="16"
              w="16"
              borderColor="white"
              borderWidth="2"
              rounded="md"
            />
          )}
          <Button
            h="20"
            w="20"
            rounded="full"
            borderWidth="2"
            borderColor="primary.500"
            bg="white"
            shadow={8}
            onPress={() => takePhoto()}
            disabled={disabled}
          />
          <View h="20" w="20" />
        </Flex>
      </Flex>
    </View>
  );
}
