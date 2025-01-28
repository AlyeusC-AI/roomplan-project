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
  TextArea,
  IconButton,
  AddIcon,
} from "native-base";
import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/Navigation";
import { useToast } from "native-base";
import { format, formatDistance } from "date-fns";

import { api, RouterOutputs } from "../../utils/api";
import { useDebounce } from "../../utils/debounce";
import produce from "immer";
import { userStore } from "@/utils/state/user";
import { Trash2 } from "lucide-react-native";

export function RoomTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);

  const debouncedText = useDebounce(text);

  useEffect(() => {
    onChange(debouncedText);
  }, [debouncedText]);

  return (
    <TextArea
      h={20}
      placeholder="Note here..."
      maxW="300"
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      autoCompleteType="off"
    />
  );
}

const RoomNoteListItem = ({
  room,
  deleteNote,
  addNote,
  updateNote,
}: {
  room: NonNullable<
    RouterOutputs["mobile"]["getRoomData"]["roomData"]
  >["rooms"][0];
  deleteNote: (roomId: string, noteId: string) => Promise<void>;
  addNote: (roomId: string) => Promise<void>;
  updateNote: (roomId: string, noteId: string, body: string) => Promise<void>;
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const onAdd = async () => {
    setIsAdding(true);
    await addNote(room.publicId);
    setIsAdding(false);
  };

  return (
    <>
      <HStack
        w="full"
        justifyContent="space-between"
        alignItems="flex-start"
        direction="row"
        mb={4}
      >
        <View>
          <Heading> {room.name}</Heading>
        </View>
        <Button
          onPress={onAdd}
          display="flex"
          justifyContent="center"
          alignItems="center"
          rightIcon={isAdding ? <Spinner /> : <AddIcon color="white" />}
        />
      </HStack>
      <VStack w="100%" mb="3">
        {room?.notes?.length === 0 && (
          <Center w="full">
            <Heading size="sm" mb="2" color="gray.400">
              There are no Notes yet
            </Heading>
          </Center>
        )}
        {room?.notes?.map((note) => (
          <Box
            key={note?.publicId}
            w="full"
            p={4}
            borderWidth={1}
            borderColor="gray.200"
            borderRadius="md"
            mb="2"
          >
            {note?.date && (
              <Box>
                <Text color="gray.500" fontSize="sm">
                  {format(new Date(note.date), "PPp")}
                </Text>
                <IconButton
                  mt="-9"
                  mr="-3"
                  onPress={() => deleteNote(note.publicId, room.publicId)}
                  alignSelf="flex-end"
                  icon={<Trash2 color="#525252" height={24} width={24} />}
                />
              </Box>
            )}
            <Box w="100%">
              <RoomTextArea
                value={note?.body}
                onChange={(value) => {
                  if (value === note.body) return;
                  updateNote(note.publicId, room.publicId, value);
                }}
              />
            </Box>
            {note.updatedAt && (
              <Text fontSize="sm">
                Updated{" "}
                {formatDistance(new Date(note.updatedAt), Date.now(), {
                  addSuffix: true,
                })}
                {note.notesAuditTrail?.length > 0 &&
                  note.notesAuditTrail[0].userName && (
                    <Text fontSize="sm">
                      {" "}
                      by {note.notesAuditTrail[0].userName}
                    </Text>
                  )}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </>
  );
};

export default function RoomNotes({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const toast = useToast();

  const { session: supabaseSession } = userStore((state) => state);
  const projectPublicId = (route?.params as { projectId: string })
    .projectId as string;
  const queryParams = {
    jwt: supabaseSession ? supabaseSession["access_token"] : "null",
    projectPublicId,
  };
  const trpcContext = api.useContext();

  const roomData = api.mobile.getRoomData.useQuery(queryParams);
  const createNewRoomNoteMutation = api.mobile.createNewRoomNote.useMutation();
  const deleteRoomNoteMutation = api.mobile.deleteRoomNote.useMutation({
    async onMutate({ noteId, roomId }) {
      await trpcContext.mobile.getRoomData.cancel();
      const prevData = trpcContext.mobile.getRoomData.getData();
      trpcContext.mobile.getRoomData.setData(queryParams, (old) => {
        if (!old || !old.roomData) return old;
        return produce(old, (draftState) => {
          if (draftState.roomData) {
            const roomIndex = draftState.roomData.rooms.findIndex(
              (r) => r.publicId === roomId
            );
            if (roomIndex === -1) return;
            const noteIndex = draftState.roomData.rooms[
              roomIndex
            ].notes.findIndex((r) => r.publicId === noteId);
            if (noteIndex === -1) return;
            draftState.roomData.rooms[roomIndex].notes.splice(noteIndex, 1);
          }
        });
      });

      return { prevData };
    },
    onError(err, { jwt, projectPublicId }, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        trpcContext.mobile.getRoomData.setData(
          { jwt, projectPublicId },
          ctx.prevData
        );
    },
    onSettled(d, a) {
      trpcContext.mobile.getRoomData.invalidate();
    },
  });
  const updateRoomNoteMutation = api.mobile.updateRoomNote.useMutation();

  const onCreateRoom = async () => {
    navigation.navigate("Create Room", { projectId: projectPublicId });
  };
  const addNote = async (roomId: string) => {
    await createNewRoomNoteMutation.mutateAsync({
      ...queryParams,
      roomId,
    });
    await roomData.refetch();
  };

  const deleteNote = async (noteId: string, roomId: string) => {
    try {
      await deleteRoomNoteMutation.mutateAsync({
        ...queryParams,
        roomId,
        noteId,
      });
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not delete note. If this error persits, please contact
            </Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  const updateNote = async (noteId: string, roomId: string, body: string) => {
    try {
      await updateRoomNoteMutation.mutateAsync({
        ...queryParams,
        roomId,
        noteId,
        body,
      });
      await roomData.refetch();
    } catch (e) {
      toast.show({
        description: (
          <HStack direction="row" space="2">
            <Text color="white">
              Could not update note. If this error persits, please contact
            </Text>
          </HStack>
        ),
        bottom: "16",
        duration: 2000,
      });
    }
  };

  return (
    <Box
      flex={1}
      alignItems="flex-start"
      h="full"
      pt={4}
      px={2}
      backgroundColor="white"
    >
      {!roomData.isLoading && roomData.data?.roomData?.rooms.length === 0 && (
        <Center h="3/6" w="full">
          <Heading>There are no rooms yet</Heading>
          <Button
            onPress={onCreateRoom}
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={4}
          >
            <Flex direction="row">
              <View
                mr="3"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <AddIcon style={{ color: "#fff" }} height={24} width={24} />
              </View>
              <Text color="white">Create a room</Text>
            </Flex>
          </Button>
        </Center>
      )}
      <FlatList
        refreshing={roomData.isLoading}
        onRefresh={roomData.refetch}
        data={roomData.data?.roomData?.rooms || []}
        keyExtractor={(room) => room.publicId}
        renderItem={({ item: room }) => (
          <RoomNoteListItem
            room={room}
            addNote={addNote}
            deleteNote={deleteNote}
            updateNote={updateNote}
          />
        )}
        w="full"
        h="full"
      />
    </Box>
  );
}
