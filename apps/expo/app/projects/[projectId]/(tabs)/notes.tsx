
import {
  Box,
  Heading,
  VStack,
  View,
  Text,
  Button,
  FlatList,
  HStack,
  Avatar,
  Spacer,
} from "native-base";
import React, { useState } from "react";
import { replaceMentionValues } from "react-native-controlled-mentions";
import ProjectNotesModal from "@/components/project/notes-modal";

const data = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    fullName: "Aafreen Khan",
    timeStamp: "12:47 PM",
    recentText:
      "hey don't forget to call me and posost the pics about the project, THEY NEED TO SEE IT! AND I NEED TO SEE ITt the pics about the project, THEY NEED TO SEE IT! AND I NEED TO SEE IT!",
    avatarUrl:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    fullName: "Sujitha Mathur",
    timeStamp: "11:11 PM",
    recentText: "Hello @[David Tabaka](5)! How are you?",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyEaZqT3fHeNrPGcnjLLX1v_W4mvBlgpwxnA&usqp=CAU",
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d72",
    fullName: "Anci Barroco",
    timeStamp: "6:22 PM",
    recentText: "Good Day!",
    avatarUrl: "https://miro.medium.com/max/1400/0*0fClPmIScV5pTLoE.jpg",
  },
  {
    id: "68694a0f-3da1-431f-bd56-142371e29d72",
    fullName: "Aniket Kumar",
    timeStamp: "8:56 PM",
    recentText: "All the best",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr01zI37DYuR8bMV5exWQBSw28C1v_71CAh8d7GP1mplcmTgQA6Q66Oo--QedAN1B4E1k&usqp=CAU",
  },
  {
    id: "28694a0f-3da1-471f-bd96-142456e29d72",
    fullName: "Kiara",
    timeStamp: "12:47 PM",
    recentText: "I will call today.",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwgu1A5zgPSvfE83nurkuzNEoXs9DMNr8Ww&usqp=CAU",
  },
];

export default function ProjectNotes() {
  const [isProjectNoteOpen, setIsProjectNoteOpen] = useState(true);

  return (
    <>
      <Heading size="md">Project Notes</Heading>
      <View
        display="flex"
        flexDirection="row"
        w="full"
        h={48}
        justifyContent="space-between"
        my={2}
      >
        <FlatList
          data={data}
          w="full"
          renderItem={({ item }) => (
            <Box
              borderBottomWidth="1"
              _dark={{
                borderColor: "lightgrey",
              }}
              w="full"
              borderColor="lightgrey"
              pl={["0", "4"]}
              pr={["0", "5"]}
              py="2"
            >
              <HStack space={[2, 3]} justifyContent="space-between">
                <Avatar
                  size="48px"
                  source={{
                    uri: item.avatarUrl,
                  }}
                />
                <VStack>
                  <Text
                    _dark={{
                      color: "warmGray.50",
                    }}
                    color="coolGray.800"
                    bold
                  >
                    {item.fullName}
                  </Text>
                  <Text
                    color="coolGray.600"
                    _dark={{
                      color: "warmGray.200",
                    }}
                  >
                    {replaceMentionValues(
                      item.recentText,
                      ({ name }) => `@${name}`
                    )}
                  </Text>
                </VStack>
                <Spacer />
                <Text
                  fontSize="xs"
                  _dark={{
                    color: "warmGray.50",
                  }}
                  color="coolGray.800"
                  alignSelf="flex-start"
                >
                  {item.timeStamp}
                </Text>
              </HStack>
            </Box>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      {/* <TextArea
          h={20}
          placeholder="Project note here..."
          w="full"
          onChangeText={(text) => {
            console.log(text);
          }}
          autoCompleteType="off"
        /> */}
      {/* right align button */}
      <Box
        w="full"
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
      >
        <Button
          onPress={() => setIsProjectNoteOpen(true)}
          colorScheme="blue"
          variant="solid"
          size="lg"
          mt={2}
        >
          Add Project Note
        </Button>
      </Box>
      <ProjectNotesModal
        isOpen={isProjectNoteOpen}
        setOpen={setIsProjectNoteOpen}
      />
    </>
  );
}
