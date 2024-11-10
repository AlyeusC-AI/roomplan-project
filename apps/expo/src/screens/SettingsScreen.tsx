import { supabase } from "../lib/supabase";
import {
  Box,
  Heading,
  Button,
  Text,
  Spinner,
  Link,
  View,
  AlertDialog,
} from "native-base";
import React, { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import { getConstants } from "../lib/constants";

export default function SettingsScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList>) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef(null);

  const logout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setIsLoggingOut(false);
  };

  const onDelete = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      const servicegeekUrl = getConstants().servicegeekUrl!;

      const res = await fetch(`${servicegeekUrl}/api/v1/user`, {
        method: "DELETE",
        headers: {
          "auth-token": accessToken || "",
        },
      });
      if (res.ok) {
        await supabase.auth.signOut();
        setIsOpen(false);
      }
    } catch (error) {
      await supabase.auth.signOut();
      setIsOpen(false);
    }
  };

  return (
    <Box flex={1} bg="#fff" alignItems="flex-start" padding="4">
      <View mt="3">
        <Heading size="md" mb={4}>
          Logout
        </Heading>
        <Button
          disabled={isLoggingOut}
          colorScheme="red"
          variant="outline"
          onPress={() => logout()}
        >
          {isLoggingOut ? <Spinner color="white" size="sm" /> : "Logout"}
        </Button>
      </View>
      <View mt="3" p="2" borderColor="red.600" borderWidth="4">
        <Heading size="md">Danger Zone</Heading>
        <Text pt="2" pb="2">
          To delete ServiceGeek account
        </Text>
        <Button
          colorScheme="red"
          variant="outline"
          onPress={() => setIsOpen(!isOpen)}
        >
          {isDeleting ? <Spinner color="white" size="sm" /> : "Delete Account"}
        </Button>
        <AlertDialog
          leastDestructiveRef={cancelRef}
          isOpen={isOpen}
          onClose={onClose}
        >
          <AlertDialog.Content>
            <AlertDialog.CloseButton />
            <AlertDialog.Header>Delete Account</AlertDialog.Header>
            <AlertDialog.Body>
              This will remove all data. This action cannot be reversed. Deleted
              data can not be recovered.
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button.Group space={2}>
                <Button
                  variant="unstyled"
                  colorScheme="coolGray"
                  onPress={onClose}
                  ref={cancelRef}
                >
                  Cancel
                </Button>
                <Button colorScheme="danger" onPress={onDelete}>
                  Delete
                </Button>
              </Button.Group>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </View>
    </Box>
  );
}
