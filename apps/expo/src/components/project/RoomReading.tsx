import {
  FlatList,
  Box,
  Heading,
  Button,
  VStack,
  View,
  Flex,
  Text,
  HStack,
  Center,
  Spinner,
  FormControl,
  Input,
  Stack,
  IconButton,
  InputGroup,
  InputRightAddon,
  AddIcon,
  Pressable,
  ChevronDownIcon,
  ChevronUpIcon,
} from "native-base";
import React, { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/Navigation";
import { useToast } from "native-base";
import { getConstants } from "../../lib/constants";
import { format } from "date-fns";
import { api, RouterOutputs } from "../../utils/api";
import { useRecoilState } from "recoil";
import userSessionState from "../../atoms/user";

// @ts-expect-error
import TrashIcon from "../../../assets/icons/Trash.svg";
import {
  UpdateGenericRoomReadingData,
  UpdateRoomReadingData,
} from "./RoomReadings";
import { useDebounce } from "@restorationx/utils";
import Collapsible from "react-native-collapsible";

export function RoomReadingInput({
  value,
  placeholder,
  onChange,
  rightText,
}: {
  value: string;
  placeholder: string;
  rightText: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const debouncedText = useDebounce(text);

  useEffect(() => {
    if (debouncedText === value) return;
    onChange(debouncedText);
  }, [debouncedText]);

  return (
    <InputGroup
      w={{
        base: "100%",
        md: "285",
      }}
      mb="4"
    >
      <Input
        w={{
          base: "80%",
          md: "100%",
        }}
        fontSize="md"
        type="text"
        value={text}
        placeholder={placeholder}
        onChangeText={(text) => {
          setText(text);
        }}
      />
      <InputRightAddon children={rightText} w="20%" />
    </InputGroup>
  );
}

const RoomReading = ({
  reading,
  roomPublicId,
  deleteReading,
  updateRoomReading,
  addGenericReading,
  updateGenericRoomReading,
}: {
  reading: NonNullable<
    RouterOutputs["mobile"]["getRoomData"]["roomData"]
  >["rooms"][0]["roomReadings"][0];
  roomPublicId: string;
  deleteReading: (roomId: string, readingId: string) => Promise<void>;
  updateRoomReading: (
    roomId: string,
    readingId: string,
    data: UpdateRoomReadingData
  ) => Promise<void>;
  addGenericReading: (roomId: string, readingId: string) => Promise<void>;
  updateGenericRoomReading: (
    roomId: string,
    readingId: string,
    genericReadingId: string,
    data: UpdateGenericRoomReadingData
  ) => Promise<void>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <>
      <Pressable
        onPress={() => setIsCollapsed((o) => !o)}
        px={2}
        py={4}
        borderWidth={1}
        borderColor="gray.200"
        rounded="md"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        mb={4}
      >
        <Heading size="sm" color="blue.500" ml={2}>
          {format(new Date(reading.date), "MM/dd/yyyy")}
        </Heading>
        {!isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
      </Pressable>
      <Collapsible collapsed={isCollapsed}>
        <Box
          key={reading?.publicId}
          w="full"
          pl={6}
          borderLeftWidth={1}
          borderLeftColor="blue.500"
        >
          <Button
            onPress={async () => deleteReading(roomPublicId, reading.publicId)}
            rightIcon={
              <TrashIcon style={{ color: "#ef4444" }} height={24} width={24} />
            }
            backgroundColor="white"
            borderWidth={1}
            rounded="md"
            borderColor="red.500"
          >
            <Text color="red.500">Delete Reading</Text>
          </Button>
          <FormControl>
            <Stack mx="2">
              <FormControl.Label>Temperature</FormControl.Label>
              <RoomReadingInput
                value={reading.temperature || ""}
                placeholder="Temperature"
                rightText="°F"
                onChange={(temperature) =>
                  updateRoomReading(roomPublicId, reading.publicId, {
                    temperature,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>Relative Humidity</FormControl.Label>

              <RoomReadingInput
                value={reading.humidity || ""}
                placeholder="Relative Humidity"
                rightText="RH"
                onChange={(relativeHumidity) =>
                  updateRoomReading(roomPublicId, reading.publicId, {
                    relativeHumidity,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>Grains Per Pound</FormControl.Label>

              <RoomReadingInput
                value={reading.gpp || ""}
                placeholder=""
                rightText="gpp"
                onChange={(gpp) =>
                  updateRoomReading(roomPublicId, reading.publicId, {
                    gpp,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>Moisture Content (Wall)</FormControl.Label>

              <RoomReadingInput
                value={reading.moistureContentWall || ""}
                placeholder="Moisture Content Percentage"
                rightText="%"
                onChange={(moistureContentWall) =>
                  updateRoomReading(roomPublicId, reading.publicId, {
                    moistureContentWall,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>Moisture Content (Floor)</FormControl.Label>

              <RoomReadingInput
                value={reading.moistureContentFloor || ""}
                placeholder="Moisture Content Percentage"
                rightText="%"
                onChange={(moistureContentFloor) =>
                  updateRoomReading(roomPublicId, reading.publicId, {
                    moistureContentFloor,
                  })
                }
              />
            </Stack>

            <Heading size="sm" mt="2" mb="4">
              Dehumidifier readings
            </Heading>

            {reading.genericRoomReadings.map((grr) => (
              <Box w="full" key={grr.publicId}>
                <Stack mx="2">
                  <FormControl.Label>Dehumidifier Reading</FormControl.Label>

                  <RoomReadingInput
                    value={grr.value || ""}
                    rightText="Each"
                    placeholder="Dehumidifier Reading"
                    onChange={(value) =>
                      updateGenericRoomReading(
                        roomPublicId,
                        reading.publicId,
                        grr.publicId,
                        {
                          value,
                        }
                      )
                    }
                  />
                  <FormControl.Label>Temperature</FormControl.Label>

                  <RoomReadingInput
                    value={grr.temperature || ""}
                    rightText="F"
                    placeholder="Temperature"
                    onChange={(temperature) =>
                      updateGenericRoomReading(
                        roomPublicId,
                        reading.publicId,
                        grr.publicId,
                        {
                          temperature,
                        }
                      )
                    }
                  />
                  <FormControl.Label>Relative Humidity</FormControl.Label>

                  <RoomReadingInput
                    value={grr.humidity || ""}
                    rightText="RH"
                    placeholder="Relative Humidity"
                    onChange={(relativeHumidity) =>
                      updateGenericRoomReading(
                        roomPublicId,
                        reading.publicId,
                        grr.publicId,
                        {
                          relativeHumidity,
                        }
                      )
                    }
                  />
                </Stack>
              </Box>
            ))}
            {reading.genericRoomReadings.length === 0 && (
              <Heading size="sm" mt="4" ml="16" color="gray.400">
                no dehumidifier readings yet
              </Heading>
            )}

            <Button
              onPress={async () =>
                addGenericReading(roomPublicId, reading.publicId)
              }
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt="4"
              mr="10"
              ml="10"
              rightIcon={
                <AddIcon style={{ color: "#fff" }} height={24} width={24} />
              }
            >
              Add Dehumidifier Reading
            </Button>
          </FormControl>
        </Box>
      </Collapsible>
    </>
  );
};

export default RoomReading;
