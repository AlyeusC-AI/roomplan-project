import {
  Box,
  Heading,
  FormControl,
  Input,
  Stack,
  InputGroup,
  InputRightAddon,
  Button,
  Modal,
} from "native-base";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useDebounce } from "../../utils/debounce";
import Collapsible from "react-native-collapsible";
import {
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react-native";
import { Database } from "@/types/database";
import { v4 } from "react-native-uuid/dist/v4";
import { roomsStore } from "@/lib/state/rooms";
import { useGlobalSearchParams } from "expo-router";
import { userStore } from "@/lib/state/user";
import { toast } from "sonner-native";
import { TouchableOpacity, Text, View } from "react-native";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, { getDefaultStyles } from "react-native-ui-datepicker";

export type UpdateRoomReadingData = {
  temperature?: string;
  relativeHumidity?: string;
  gpp?: string;
  moistureContentWall?: string;
  moistureContentFloor?: string;
};

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
  room,
  reading,
  addReading,
}: {
  room: Room;
  reading: ReadingsWithGenericReadings;
  addReading: (
    data: Database["public"]["Tables"]["GenericRoomReading"]["Insert"],
    type: ReadingType
  ) => Promise<any>;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const [date, setDate] = useState(new Date(reading.date));
  const defaultStyles = getDefaultStyles();

  async function updateRoomReading(
    readingId: string,
    type: ReadingType,
    data:
      | Database["public"]["Tables"]["RoomReading"]["Update"]
      | Database["public"]["Tables"]["GenericRoomReading"]["Update"]
  ) {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            readingData: data,
            readingId,
            type,
          }),
        }
      );

      console.log("updated reading", data);

      if (type === "standard") {
        rooms.updateRoomReading(room.id, reading.id, data);
      }
    } catch {
      toast.error("Could not update reading");
    }
  }

  const deleteReading = async (readingId: string, type: ReadingType) => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/readings`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
          body: JSON.stringify({
            type,
            readingId,
          }),
        }
      );
      rooms.removeReading(room.id, reading.id);
    } catch {
      toast.error("Could not delete reading");
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photo = result.assets[0];

      const p = {
        uri: photo.uri,
        name: photo.fileName,
      };
      const formData = new FormData();
      // @ts-expect-error maaaaan react-native sucks
      formData.append("file", p);

      try {
        await supabaseServiceRole.storage
          .from("note-images")
          .upload(`/${reading.publicId}/${v4()}.jpeg`, formData, {
            cacheControl: "3600",
            upsert: false,
          });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <Button variant="outline" onPress={() => setIsCollapsed((o) => !o)}>
        <View className="flex flex-row justify-between w-full items-center">
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text className="text-blue-500">{format(date, "MM/dd/yyyy")}</Text>
          </TouchableOpacity>
          {!isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </View>
      </Button>
      <Collapsible collapsed={isCollapsed}>
        <Box
          key={reading?.publicId}
          w="full"
          pl={6}
          borderLeftWidth={1}
          borderLeftColor="blue.500"
          className="gap-y-3"
        >
          <Button
            onPress={async () => deleteReading(reading.publicId, "standard")}
            className="flex items-center justify-center"
            variant="destructive"
          >
            <Text style={{ color: "#ef4444" }}>
              Delete Reading <Trash2 color="#ef4444" height={24} width={24} />
            </Text>
          </Button>
          <FormControl>
            <Modal
              isOpen={showDatePicker}
              onClose={() => setShowDatePicker(false)}
            >
              <Modal.Content>
                <Modal.CloseButton />
                <Modal.Header>Select Date</Modal.Header>
                <Modal.Body>
                  <DateTimePicker
                    mode="single"
                    components={{
                      IconNext: <ChevronRight color="#1d4ed8" />,
                      IconPrev: <ChevronLeft color="#1d4ed8" />,
                    }}
                    onChange={(params) => {
                      setDate(new Date(params.date as string));
                      updateRoomReading(reading.publicId, "standard", {
                        date: new Date(params.date as string).toISOString(),
                      });
                      setShowDatePicker(false);
                    }}
                    styles={{
                      ...defaultStyles,
                      selected: {
                        ...defaultStyles.selected,
                        color: "#1d4ed8",
                        backgroundColor: "#1d4ed8",
                      },
                    }}
                    date={date}
                  />
                </Modal.Body>
              </Modal.Content>
            </Modal>
          </FormControl>
          <FormControl>
            <Stack mx="2">
              <FormControl.Label>Temperature</FormControl.Label>
              <RoomReadingInput
                value={reading.temperature || ""}
                placeholder="Temperature"
                rightText="°F"
                onChange={(temperature) =>
                  updateRoomReading(reading.publicId, "standard", {
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
                  updateRoomReading(reading.publicId, "standard", {
                    humidity: relativeHumidity,
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
                  updateRoomReading(reading.publicId, "standard", {
                    gpp,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>
                Moisture Content (Wall){" "}
                <TouchableOpacity onPress={() => pickImage()} className="ml-2">
                  <Camera />
                </TouchableOpacity>
              </FormControl.Label>

              <RoomReadingInput
                value={reading.moistureContentWall || ""}
                placeholder="Moisture Content Percentage"
                rightText="%"
                onChange={(moistureContentWall) =>
                  updateRoomReading(reading.publicId, "standard", {
                    moistureContentWall,
                  })
                }
              />
            </Stack>
            <Stack mx="2">
              <FormControl.Label>
                Moisture Content (Floor)
                <TouchableOpacity onPress={() => pickImage()} className="ml-2">
                  <Camera />
                </TouchableOpacity>
              </FormControl.Label>

              <RoomReadingInput
                value={reading.moistureContentFloor || ""}
                placeholder="Moisture Content Percentage"
                rightText="%"
                onChange={(moistureContentFloor) =>
                  updateRoomReading(reading.publicId, "standard", {
                    moistureContentFloor,
                  })
                }
              />
            </Stack>

            <Heading size="sm" mt="2" mb="4">
              Dehumidifier readings
            </Heading>

            {reading.GenericRoomReading.map((grr) => (
              <Box w="full" key={grr.publicId}>
                <Stack mx="2">
                  <FormControl.Label>Dehumidifier Reading</FormControl.Label>

                  <RoomReadingInput
                    value={grr.value || ""}
                    rightText="Each"
                    placeholder="Dehumidifier Reading"
                    onChange={(value) =>
                      updateRoomReading(grr.publicId, "generic", {
                        value,
                      })
                    }
                  />
                  <FormControl.Label>Temperature</FormControl.Label>

                  <RoomReadingInput
                    value={grr.temperature || ""}
                    rightText="F"
                    placeholder="Temperature"
                    onChange={(temperature) =>
                      updateRoomReading(grr.publicId, "generic", {
                        temperature,
                      }).then(() => {
                        rooms.updateGenericRoomReading(
                          room.id,
                          reading.id,
                          grr.publicId,
                          { temperature }
                        );
                      })
                    }
                  />
                  <FormControl.Label>Relative Humidity</FormControl.Label>

                  <RoomReadingInput
                    value={grr.humidity || ""}
                    rightText="RH"
                    placeholder="Relative Humidity"
                    onChange={(relativeHumidity) =>
                      updateRoomReading(grr.publicId, "generic", {
                        humidity: relativeHumidity,
                      })
                    }
                  />
                </Stack>
              </Box>
            ))}
            {reading.GenericRoomReading.length === 0 && (
              <Heading size="sm" mt="4" ml="16" color="gray.400">
                no dehumidifier readings yet
              </Heading>
            )}

            <Button
              onPress={async () =>
                addReading(
                  {
                    roomReadingId: reading.id,
                    publicId: v4(),
                    value: "",
                    type: "dehumidifer",
                  },
                  "generic"
                )
                  .then((res) => res.json())
                  .then((body) => {
                    rooms.addGenericRoomReading(
                      room.id,
                      reading.id,
                      body.reading
                    );
                  })
              }
              display="flex"
              justifyContent="center"
              alignItems="center"
              mt="4"
              mr="10"
              ml="10"
              mb="6"
              rightIcon={<Plus color="#FFF" height={24} width={24} />}
            >
              <Text>Add Dehumidifier Reading</Text>
            </Button>
          </FormControl>
        </Box>
      </Collapsible>
    </>
  );
};

export default RoomReading;
