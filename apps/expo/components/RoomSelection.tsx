import { Box, Button, Center, Flex, HStack, Select, View } from "native-base";
import React from "react";
import { Check } from "lucide-react-native"
import { RouterOutputs } from "@servicegeek/api";

const RoomSelection = ({
  rooms,
  onChange,
  selectedRoom,
}: {
  rooms: RouterOutputs["mobile"]["getProjectImages"]["rooms"];
  onChange: (id: string) => void;
  selectedRoom: string;
}) => {
  const onValueChange = (v: string) => {
    onChange(v);
  };

  const room = rooms.find((r) => r.publicId === selectedRoom);

  return (
    <Center>
      <View display="flex" width="full" px={4} h={12}>
        <Select
          selectedValue={selectedRoom}
          justifyContent="center"
          alignContent="center"
          alignItems="center"
          display="flex"
          flex={1}
          accessibilityLabel="Assignee"
          placeholder={room ? room.name : "Select Room"}
          _selectedItem={{
            bg: "primary.400",
            endIcon: <Check size={24} color="white" />,
          }}
          size="md"
          color="black"
          bg="white"
          onValueChange={(itemValue) => onValueChange(itemValue)}
        >
          {rooms.map((room) => (
            <Select.Item
              key={room.publicId}
              label={room.name}
              value={room.publicId}
            />
          ))}
        </Select>
      </View>
    </Center>
  );
};

export default RoomSelection;
