import { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  VStack,
  HStack,
  Heading,
  Input,
  Spinner,
  Text,
  View,
} from "native-base";
import React from "react";
import FilterByAssignees from "./FilterByAssignees";
import { getConstants } from "../../lib/constants";
import { Assets, Icon } from "react-native-ui-lib";
import { useDebounce } from "@servicegeek/utils";
import { RouterOutputs } from "@servicegeek/api";

const servicegeekUrl = getConstants().servicegeekUrl!;

export default function DashboardHeader({
  teamMembers,
  refetch,
  isFetchingProjects,
  selectedUser,
  setSelectedUser,
}: {
  teamMembers: NonNullable<
    RouterOutputs["mobile"]["getDashboardData"]["teamMembers"]
  >;
  refetch: (s: string) => void;
  isFetchingProjects: boolean;
  selectedUser: string;
  setSelectedUser: Dispatch<SetStateAction<string>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  useEffect(() => {
    refetch(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const updateFilter = (userId: string) => {
    const u = userId === "Anyone" || !userId ? "" : userId;
    if (u !== selectedUser) {
      setSelectedUser(u);
    }
  };

  return (
    <VStack w="full" px={4} py={2}>
      <HStack
        w="full"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading>Project Dashboard</Heading>
        <FilterByAssignees
          teamMembers={teamMembers}
          updateFilter={updateFilter}
          selectedUser={selectedUser}
        />
      </HStack>
      <VStack
        w="full"
        h={10}
        display="flex"
        alignSelf="center"
        shadow="1"
        mt="4"
        mb="2"
      >
        <Input
          placeholder="Search for anything"
          placeholderTextColor="black"
          variant="filled"
          width="100%"
          rounded="md"
          py="2"
          px="4"
          size="lg"
          bg="white"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          InputRightElement={
            <View mr={2} display="flex" flexDirection="row">
              {isLoading ? <Spinner mr={2} /> : undefined}
              <Icon size={20} source={Assets.icons.search} tintColor="gray" />
            </View>
          }
        />
      </VStack>
      <HStack w="full" display="flex" alignItems="flex-end" mt={1}>
        <Text color="gray.500" mr={2}>
          Assigned To:
        </Text>
        <Text>
          {teamMembers.find((t) => t.user.id === selectedUser)?.user.email ||
            "Anyone"}
        </Text>
        {isFetchingProjects && <Spinner ml={2} />}
      </HStack>
    </VStack>
  );
}
