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
  X,
} from "lucide-react-native";
import { Database } from "@/types/database";
import { v4 } from "react-native-uuid/dist/v4";
import { roomsStore } from "@/lib/state/rooms";
import { useGlobalSearchParams } from "expo-router";
import { userStore } from "@/lib/state/user";
import { toast } from "sonner-native";
import { TouchableOpacity, Text, View, Image, Pressable, Alert, ActivityIndicator } from "react-native";
import { supabaseServiceRole } from "@/unused/screens/CameraScreen";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, { getDefaultStyles } from "react-native-ui-datepicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImageType, setSelectedImageType] = useState<'wall' | 'floor' | 'generic' | null>(null);
  const [selectedGenericIndex, setSelectedGenericIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { session: supabaseSession } = userStore((state) => state);
  const rooms = roomsStore();
  const { projectId } = useGlobalSearchParams<{
    projectId: string;
  }>();
  const [date, setDate] = useState(new Date(reading.date));
  const defaultStyles = getDefaultStyles();

  const handlePrevImage = () => {
    if (selectedImageIndex === null) return;
    if (selectedImageType === 'wall' && wallImages) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? wallImages.length - 1 : selectedImageIndex - 1
      );
    } else if (selectedImageType === 'floor' && floorImages) {
      setSelectedImageIndex(
        selectedImageIndex === 0 ? floorImages.length - 1 : selectedImageIndex - 1
      );
    } else if (selectedImageType === 'generic') {
     const currentGenericReading = reading.GenericRoomReading.find(grr => 
        grr.GenericRoomReadingImage?.[selectedImageIndex]
      );
      if (currentGenericReading?.GenericRoomReadingImage) {
        setSelectedImageIndex(
          selectedImageIndex === 0 ? currentGenericReading.GenericRoomReadingImage.length - 1 : selectedImageIndex - 1
        );
      }
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex === null) return;
    if (selectedImageType === 'wall' && wallImages) {
      setSelectedImageIndex(
        selectedImageIndex === wallImages.length - 1 ? 0 : selectedImageIndex + 1
      );
    } else if (selectedImageType === 'floor' && floorImages) {
      setSelectedImageIndex(
        selectedImageIndex === floorImages.length - 1 ? 0 : selectedImageIndex + 1
      );
    } else if (selectedImageType === 'generic') {
      const currentGenericReading = reading.GenericRoomReading.find(grr => 
        grr.GenericRoomReadingImage?.[selectedImageIndex]
      );
      if (currentGenericReading?.GenericRoomReadingImage) {
        setSelectedImageIndex(
          selectedImageIndex === currentGenericReading.GenericRoomReadingImage.length - 1 ? 0 : selectedImageIndex + 1
        );
      }
    }
  };

  const handleDeleteImage = (imageKey: string, type: 'wall' | 'floor' | 'generic') => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteImage(imageKey, type)
        }
      ]
    );
  };

  const deleteImage = async (imageKey: string, type: 'wall' | 'floor' | 'generic') => {
    try {
      // Delete from storage
      await supabaseServiceRole.storage
        .from("readings-images")
        .remove([imageKey]);

      // Delete from database
      if (type === 'generic') {
        await supabaseServiceRole
          .from("GenericRoomReadingImage")
          .delete()
          .eq("imageKey", imageKey);
      } else {
        await supabaseServiceRole
          .from("RoomReadingImage")
          .delete()
          .eq("imageKey", imageKey);
      }

      // Refresh the rooms data
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": supabaseSession?.access_token || "",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          rooms.setRooms(data.rooms);
        });

      // Update modal state
      if (selectedImageIndex !== null) {
        if (type === 'wall' && wallImages) {
          if (wallImages.length <= 1) {
            setSelectedImageIndex(null);
            setSelectedImageType(null);
          } else {
            setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
          }
        } else if (type === 'floor' && floorImages) {
          if (floorImages.length <= 1) {
            setSelectedImageIndex(null);
            setSelectedImageType(null);
          } else {
            setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
          }
        } else if (type === 'generic') {
          const currentGenericReading = reading.GenericRoomReading.find(grr => 
            grr.GenericRoomReadingImage?.[selectedImageIndex]
          );
          if (currentGenericReading?.GenericRoomReadingImage) {
            if (currentGenericReading.GenericRoomReadingImage.length <= 1) {
              setSelectedImageIndex(null);
              setSelectedImageType(null);
            } else {
              setSelectedImageIndex(Math.max(0, selectedImageIndex - 1));
            }
          }
        }
      }

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image");
    }
  };

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
      setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
    }
  };

  const pickImage = async (type: 'room' | 'generic', genericReadingId?: number, Roomtype?: "floor" | "wall") => {
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
        name: photo.fileName || `${v4()}.jpeg`,
      };
      const formData = new FormData();
      // @ts-expect-error maaaaan react-native sucks
      formData.append("file", p);

      try {
        const imageKey = type === 'room' 
          ? `/${reading.publicId}/${v4()}.jpeg`
          : `/${reading.publicId}/${genericReadingId}/${v4()}.jpeg`;

        const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
          .from("readings-images")
          .upload(imageKey, formData, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

       
        // Update the database with the image key using Supabase
        if (type === 'room') {
          const { error: roomImageError } = await supabaseServiceRole
            .from('RoomReadingImage')
            .insert({
              RoomReadingId: reading.id,
              imageKey:uploadData.path,
              type: Roomtype
            });

          if (roomImageError) {
            throw roomImageError;
          }
        } else {
          const { error: genericImageError } = await supabaseServiceRole
            .from('GenericRoomReadingImage')
            .insert({
              GenericRoomReadingId: (genericReadingId),
              imageKey:uploadData.path
            });

          if (genericImageError) {
            throw genericImageError;
          }
        }

        // Refresh the rooms data
        await fetch(
          `${process.env.EXPO_PUBLIC_BASE_URL}/api/v1/projects/${projectId}/room`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "auth-token": supabaseSession?.access_token || "",
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            rooms.setRooms(data.rooms);
          });

        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload image");
      }
    }
  };

  const [roomImages, setRoomImages] = useState<{ [key: string]: string }>({});
  const [genericImages, setGenericImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load room reading images
    if (reading.RoomReadingImage) {
      const loadRoomImages = async () => {
        const imageKeys = reading.RoomReadingImage?.map(img => img.imageKey);
        const { data: urlData } = await supabaseServiceRole.storage
          .from("readings-images")
          .createSignedUrls(imageKeys || [], 3600);

        const urlMap = urlData?.reduce((acc, curr) => {
          if (curr.path && curr.signedUrl) {
            acc[curr.path] = curr.signedUrl;
          }
          return acc;
        }, {} as { [key: string]: string });

        setRoomImages(urlMap || {});
      };
      loadRoomImages();
    }

    // Load generic reading images
    if (reading.GenericRoomReading) {
      const loadGenericImages = async () => {
        const imageKeys = reading.GenericRoomReading.flatMap(grr => 
          grr.GenericRoomReadingImage?.map(img => img.imageKey) || []
        );
        
        const { data: urlData } = await supabaseServiceRole.storage
          .from("readings-images")
          .createSignedUrls(imageKeys, 3600);

        const urlMap = urlData?.reduce((acc, curr) => {
          if (curr.path && curr.signedUrl) {
            acc[curr.path] = curr.signedUrl;
          }
          return acc;
        }, {} as { [key: string]: string });

        setGenericImages(urlMap || {});
      };
      loadGenericImages();
    }
  }, [reading]);

  const wallImages = reading.RoomReadingImage?.filter(img => img.type === "wall");
  const floorImages = reading.RoomReadingImage?.filter(img => img.type === "floor");  
  return (
    <>
      <Button variant="outline" onPress={() => setIsCollapsed((o) => !o)}>
        <View className="flex flex-row justify-between w-full items-center px-3 py-1.5">
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text className="text-blue-600 font-medium">{format(date, "MM/dd/yyyy")}</Text>
          </TouchableOpacity>
          {!isCollapsed ? <ChevronDown color="#1d4ed8" size={18} /> : <ChevronUp color="#1d4ed8" size={18} />}
        </View>
      </Button>
      <Collapsible collapsed={isCollapsed}>
        <Box
          key={reading?.publicId}
          w="full"
          pl={4}
          borderLeftWidth={1}
          borderLeftColor="blue.500"
          className="gap-y-2"
        >
          <Button
            onPress={() => {
              Alert.alert(
                "Delete Reading",
                "Are you sure you want to delete this reading? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel"
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => deleteReading(reading.publicId, "standard")
                  }
                ]
              );
            }}
            className="flex-row items-center justify-center bg-red-100 rounded-lg py-1.5 px-3 border border-red-300"
            variant="destructive"
            disabled={isDeleting}
          >
            <View className="flex-row items-center">
              {isDeleting ? (
                <ActivityIndicator color="#dc2626" size="small" className="mr-1.5" />
              ) : (
                <Trash2 color="#dc2626" height={16} width={16} className="mr-1.5" />
              )}
              <Text className="text-red-700 font-medium text-sm">
                {isDeleting ? "Deleting..." : "Delete Reading"}
              </Text>
            </View>
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
                      IconNext: <ChevronRight color="#1d4ed8" size={18} />,
                      IconPrev: <ChevronLeft color="#1d4ed8" size={18} />,
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
            <Stack mx="2" className="gap-y-2">
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">Temperature</FormControl.Label>
                <RoomReadingInput
                  value={reading.temperature || ""}
                  placeholder="Enter temperature"
                  rightText="°F"
                  onChange={(temperature) =>
                    updateRoomReading(reading.publicId, "standard", {
                      temperature,
                    })
                  }
                />
              </View>
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">Relative Humidity</FormControl.Label>
                <RoomReadingInput
                  value={reading.humidity || ""}
                  placeholder="Enter relative humidity"
                  rightText="RH"
                  onChange={(relativeHumidity) =>
                    updateRoomReading(reading.publicId, "standard", {
                      humidity: relativeHumidity,
                    })
                  }
                />
              </View>
              <View>
                <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">Grains Per Pound</FormControl.Label>
                <RoomReadingInput
                  value={reading.gpp || ""}
                  placeholder="Enter grains per pound"
                  rightText="gpp"
                  onChange={(gpp) =>
                    updateRoomReading(reading.publicId, "standard", {
                      gpp,
                    })
                  }
                />
              </View>
              <View>
                <View className="flex-row items-center justify-between mb-0.5">
                  <FormControl.Label className="text-gray-700 font-medium text-sm">Moisture Content (Wall)</FormControl.Label>
                  <TouchableOpacity onPress={() => pickImage('room', undefined, "wall")} className="p-0.5">
                    <Camera color="#1d4ed8" size={20} />
                  </TouchableOpacity>
                </View>
                <RoomReadingInput
                  value={reading.moistureContentWall || ""}
                  placeholder="Enter moisture content percentage"
                  rightText="%"
                  onChange={(moistureContentWall) =>
                    updateRoomReading(reading.publicId, "standard", {
                      moistureContentWall,
                    })
                  }
                />
                {wallImages && wallImages.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {wallImages.map((img, index) => (
                      <Pressable 
                        key={img.imageKey}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setSelectedImageType('wall');
                        }}
                      >
                        <Image
                          source={{ uri: roomImages[img.imageKey] }}
                          style={{ width: 80, height: 80, borderRadius: 6 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View>
                <View className="flex-row items-center justify-between mb-0.5">
                  <FormControl.Label className="text-gray-700 font-medium text-sm">Moisture Content (Floor)</FormControl.Label>
                  <TouchableOpacity onPress={() => pickImage('room', undefined, "floor")} className="p-0.5">
                    <Camera color="#1d4ed8" size={20} />
                  </TouchableOpacity>
                </View>
                <RoomReadingInput
                  value={reading.moistureContentFloor || ""}
                  placeholder="Enter moisture content percentage"
                  rightText="%"
                  onChange={(moistureContentFloor) =>
                    updateRoomReading(reading.publicId, "standard", {
                      moistureContentFloor,
                    })
                  }
                />
                {floorImages && floorImages.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-1">
                    {floorImages.map((img, index) => (
                      <Pressable 
                        key={img.imageKey}
                        onPress={() => {
                          setSelectedImageIndex(index);
                          setSelectedImageType('floor');
                        }}
                      >
                        <Image
                          source={{ uri: roomImages[img.imageKey] }}
                          style={{ width: 80, height: 80, borderRadius: 6 }}
                        />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Heading size="sm" mt="2" mb="1" className="text-gray-700 font-semibold text-sm">
                Dehumidifier Readings
              </Heading>

              {reading.GenericRoomReading.map((grr, index) => (
                <Box w="full" key={grr.publicId} className="mb-3 bg-gray-50 rounded-lg p-3">
                  <Stack mx="2" className="gap-y-2">
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Heading size="sm" mb="0.5" className="text-gray-700 font-semibold text-sm">Dehumidifier Reading {index + 1}</Heading>
                        <FormControl.Label className="text-gray-700 font-medium text-sm">Reading Value</FormControl.Label>
                      </View>
                      <TouchableOpacity 
                        onPress={() => pickImage('generic', grr.id)} 
                        className="p-0.5"
                      >
                        <Camera color="#1d4ed8" size={20} />
                      </TouchableOpacity>
                    </View>

                    <RoomReadingInput
                      value={grr.value || ""}
                      rightText="Each"
                      placeholder="Enter dehumidifier reading"
                      onChange={(value) =>
                        updateRoomReading(grr.publicId, "generic", {
                          value,
                        })
                      }
                    />
                    {grr.GenericRoomReadingImage && grr.GenericRoomReadingImage.length > 0 && (
                      <View className="flex-row flex-wrap gap-1.5 mt-1">
                        {grr.GenericRoomReadingImage.map((img, index) => (
                          <Pressable 
                            key={img.imageKey}
                            onPress={() => {
                              setSelectedImageIndex(index);
                              setSelectedImageType('generic');
                              setSelectedGenericIndex(grr.id);
                            }}
                          >
                            <Image
                              source={{ uri: genericImages[img.imageKey] }}
                              style={{ width: 80, height: 80, borderRadius: 6 }}
                            />
                          </Pressable>
                        ))}
                      </View>
                    )}
                    <View>
                      <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">Temperature</FormControl.Label>
                      <RoomReadingInput
                        value={grr.temperature || ""}
                        rightText="°F"
                        placeholder="Enter temperature"
                        onChange={(temperature) =>
                          updateRoomReading(grr.publicId, "generic", {
                            temperature,
                          })
                        }
                      />
                    </View>
                    <View>
                      <FormControl.Label className="text-gray-700 font-medium text-sm mb-0.5">Relative Humidity</FormControl.Label>
                      <RoomReadingInput
                        value={grr.humidity || ""}
                        rightText="RH"
                        placeholder="Enter humidity"
                        onChange={(relativeHumidity) =>
                          updateRoomReading(grr.publicId, "generic", {
                            humidity: relativeHumidity,
                          })
                        }
                      />
                    </View>
                  </Stack>
                </Box>
              ))}
              {reading.GenericRoomReading.length === 0 && (
                <View className="flex items-center justify-center py-4">
                  <Text className="text-gray-400 font-medium text-sm">No dehumidifier readings yet</Text>
                </View>
              )}

              <Button
                onPress={async () => {
                  setIsAdding(true);
                  try {
                    const body = await addReading(
                      {
                        roomReadingId: reading.id,
                        publicId: v4(),
                        value: "",
                        type: "dehumidifer",
                      },
                      "generic"
                    );
                    console.log("🚀 ~ .then ~ body:", body);
                    rooms.addGenericRoomReading(
                      room.id,
                      reading.id,
                      body.reading
                    );
                  } catch (err) {
                    console.log("🚀 ~ .then ~ err:", err);
                  } finally {
                    setIsAdding(false);
                  }
                }}
                className="flex-row items-center justify-center bg-blue-600 rounded-lg py-1.5 px-3 mt-2 mx-2 border border-blue-700"
                disabled={isAdding}
              >
                <View className="flex-row items-center">
                  {isAdding ? (
                    <ActivityIndicator color="#FFF" size="small" className="mr-1.5" />
                  ) : (
                    <Plus color="#FFF" height={16} width={16} className="mr-1.5" />
                  )}
                  <Text className="text-white font-medium text-sm">
                    {isAdding ? "Adding..." : "Add Dehumidifier Reading"}
                  </Text>
                </View>
              </Button>
            </Stack>
          </FormControl>
        </Box>
      </Collapsible>

      <Dialog 
        open={selectedImageIndex !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedImageIndex(null);
            setSelectedImageType(null);
            setSelectedGenericIndex(null);
          }
        }}
      >
        <DialogContent className="p-0 bg-black w-screen h-screen">
          {selectedImageIndex !== null && selectedImageType && (
            <View className="flex-1 relative">
              <Image
                source={{ 
                  uri: selectedImageType === 'generic' 
                    ? genericImages[reading.GenericRoomReading.find(grr => 
                        grr.id === selectedGenericIndex
                      )?.GenericRoomReadingImage?.[selectedImageIndex]?.imageKey || '']
                    : selectedImageType === 'wall'
                    ? roomImages[wallImages?.[selectedImageIndex]?.imageKey || '']
                    : roomImages[floorImages?.[selectedImageIndex]?.imageKey || '']
                }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
              <View className="absolute top-12 right-4 flex-row gap-2 z-20">
                <Pressable 
                  onPress={() => {
                    if (selectedImageType === 'generic') {
                      const currentGenericReading = reading.GenericRoomReading.find(grr => 
                        grr.id === selectedGenericIndex
                      );
                      if (currentGenericReading?.GenericRoomReadingImage?.[selectedImageIndex]) {
                        handleDeleteImage(currentGenericReading.GenericRoomReadingImage[selectedImageIndex].imageKey, 'generic');
                      }
                    } else if (selectedImageType === 'wall' && wallImages?.[selectedImageIndex]) {
                      handleDeleteImage(wallImages[selectedImageIndex].imageKey, 'wall');
                    } else if (selectedImageType === 'floor' && floorImages?.[selectedImageIndex]) {
                      handleDeleteImage(floorImages[selectedImageIndex].imageKey, 'floor');
                    }
                  }}
                  className="bg-black/50 rounded-full p-2"
                >
                  <Trash2 color="white" size={24} />
                </Pressable>
                <Pressable 
                  onPress={() => {
                    setSelectedImageIndex(null);
                    setSelectedImageType(null);
                    setSelectedGenericIndex(null);
                  }}
                  className="bg-black/50 rounded-full p-2"
                >
                  <X color="white" size={24} />
                </Pressable>
              </View>
              {(selectedImageType === 'wall' && wallImages && wallImages.length > 1) ||
               (selectedImageType === 'floor' && floorImages && floorImages.length > 1) ||
               (selectedImageType === 'generic' && reading.GenericRoomReading.find(grr => 
                 grr.id === selectedGenericIndex
               )?.GenericRoomReadingImage?.length > 1) ? (
                <View className="absolute inset-y-0 flex-row justify-between items-center px-4 w-full z-10">
                  <Pressable
                    onPress={handlePrevImage}
                    className="bg-black/50 rounded-full p-2"
                  >
                    <ChevronLeft color="white" size={24} />
                  </Pressable>
                  <Pressable
                    onPress={handleNextImage}
                    className="bg-black/50 rounded-full p-2"
                  >
                    <ChevronRight color="white" size={24} />
                  </Pressable>
                </View>
              ) : null}
              <View className="absolute bottom-4 w-full flex-row justify-center z-10">
                <Text className="text-white text-sm">
                  {selectedImageIndex + 1} / {
                    selectedImageType === 'wall' ? wallImages?.length :
                    selectedImageType === 'floor' ? floorImages?.length :
                    reading.GenericRoomReading.find(grr => 
                      grr.id === selectedGenericIndex
                    )?.GenericRoomReadingImage?.length
                  }
                </Text>
              </View>
            </View>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomReading;
