import {
  View,
  Pressable,
  Modal,
  Text,
  Button,
  FormControl,
} from "native-base";
import React, { FC, useState } from "react";
import {
  MentionInput,
  MentionSuggestionsProps,
  Suggestion,
} from "react-native-controlled-mentions";
const users = [
  { id: "1", name: "David Tabaka" },
  { id: "2", name: "Mary" },
  { id: "3", name: "Tony" },
  { id: "4", name: "Mike" },
  { id: "5", name: "Grey" },
];

const hashtags = [
  { id: "todo", name: "todo" },
  { id: "help", name: "help" },
  { id: "loveyou", name: "loveyou" },
];

const renderSuggestions: (
  suggestions: Suggestion[]
) => FC<MentionSuggestionsProps> =
  (suggestions) =>
  ({ keyword, onSuggestionPress }) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View>
        {suggestions
          .filter((one) =>
            one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
          )
          .map((one) => (
            <Pressable
              key={one.id}
              onPress={() => {
                console.log(one);
                onSuggestionPress(one);
              }}
              style={{
                padding: 12,
                borderBottomColor: "lightgrey",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: "blue",
                }}
              >
                @{one.name}
              </Text>
            </Pressable>
          ))}
      </View>
    );
  };
const renderMentionSuggestions = renderSuggestions(users);

const renderHashtagSuggestions = renderSuggestions(hashtags);
const ProjectNotesModal = ({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}) => {
  const [value, setValue] = useState("Hello @[Mary](2)! How are you?");

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        avoidKeyboard
        size="lg"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Add project note</Modal.Header>
          <Modal.Body>
            Share notes with your team about this project. You can tag team
            members by @ to notify them of a note.
            <FormControl mt="3">
              <MentionInput
                autoFocus
                value={value}
                onChange={setValue}
                partTypes={[
                  {
                    trigger: "@",
                    renderSuggestions: renderMentionSuggestions,
                  },
                  {
                    pattern:
                      /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(xn--)?[a-z0-9-]{2,20}\b([-a-zA-Z0-9@:%_\+\[\],.~#?&\/=]*[-a-zA-Z0-9@:%_\+\]~#?&\/=])*/gi,
                    textStyle: { color: "blue" },
                  },
                ]}
                style={{
                  padding: 12,
                  fontSize: 18,
                  height: 200,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderTopColor: "lightgrey",
                  borderLeftColor: "lightgrey",
                  borderRightColor: "lightgrey",
                  borderBottomColor: "lightgrey",
                }}
                placeholder="Type here..."
              />
            </FormControl>
          </Modal.Body>
          <Modal.Footer>
            <Button
              flex="1"
              onPress={() => {
                setOpen(false);
              }}
            >
              Add Note
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default ProjectNotesModal;
